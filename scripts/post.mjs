import { spawnSync } from 'node:child_process'
import { access, mkdir, readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { postCollections } from '../src/site.config.ts'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const blogRoot = path.join(root, 'src', 'content', 'blog')
const localCategories = postCollections.filter((entry) => !entry.draft && !entry.externalUrl)
const [action, slug, ...extra] = process.argv.slice(2)

function todayInChina() {
  return new Intl.DateTimeFormat('sv-SE', { timeZone: 'Asia/Shanghai' }).format(new Date())
}

function fail(message) {
  throw new Error(message)
}

function assertSlug(value) {
  if (!value || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value)) {
    fail('文章 slug 请使用小写英文字母、数字和连字符，例如 r68s-tailscale-rdp。')
  }
}

function postDirectory(value) {
  assertSlug(value)
  return path.join(blogRoot, value)
}

function unquote(value) {
  const trimmed = value.trim()
  if ((trimmed.startsWith("'") && trimmed.endsWith("'")) ||
      (trimmed.startsWith('"') && trimmed.endsWith('"'))) {
    return trimmed.slice(1, -1)
  }
  return trimmed
}

function field(frontmatter, name) {
  return unquote(frontmatter.match(new RegExp(`^${name}:\\s*(.+)$`, 'm'))?.[1] ?? '')
}

async function findPostFile(directory) {
  const candidates = ['index.md', 'index.mdx']
  const found = []
  for (const name of candidates) {
    const file = path.join(directory, name)
    try {
      await access(file)
      found.push(file)
    } catch {
      // This article does not use this extension.
    }
  }
  if (found.length !== 1) fail('文章目录必须且只能包含 index.md 或 index.mdx 其中一个正文文件。')
  return found[0]
}

async function validateLocalImage(directory, reference) {
  if (!reference.startsWith('./assets/')) {
    fail(`本地图片请放在文章 assets/ 下，并使用 ./assets/ 路径：${reference}`)
  }
  const absolute = path.resolve(directory, reference)
  if (!absolute.startsWith(`${directory}${path.sep}`)) fail(`图片路径超出文章目录：${reference}`)
  try {
    await access(absolute)
  } catch {
    fail(`找不到图片：${reference}`)
  }
}

async function validatePost(value) {
  const directory = postDirectory(value)
  const file = await findPostFile(directory)
  const content = await readFile(file, 'utf8')
  const match = content.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n/)
  if (!match) fail('文章开头需要完整的 YAML Frontmatter（两个 --- 分隔行）。')

  const frontmatter = match[1]
  const body = content.slice(match[0].length).trim()
  const title = field(frontmatter, 'title')
  const description = field(frontmatter, 'description')
  const date = field(frontmatter, 'publishDate')
  const category = field(frontmatter, 'category')
  const draft = field(frontmatter, 'draft')

  if (!title || title.length > 60) fail('title 必填，且不能超过 60 个字符。')
  if (!description || description.startsWith('TODO') || description.length > 160) {
    fail('请填写不超过 160 个字符的 description，不能保留模板 TODO。')
  }
  const parsedDate = new Date(`${date}T00:00:00Z`)
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || Number.isNaN(parsedDate.getTime()) || parsedDate.toISOString().slice(0, 10) !== date) {
    fail('publishDate 必须是 YYYY-MM-DD 格式的有效日期。')
  }
  if (!localCategories.some((entry) => entry.slug === category)) {
    fail(`category 必须是本站的本地分类：${localCategories.map((entry) => entry.slug).join(', ')}`)
  }
  if (!['true', 'false'].includes(draft)) fail('draft 必须明确填写 true 或 false。')
  if (!body || body.includes('在这里开始写正文。')) fail('请先填写文章正文并移除模板提示。')

  const heroImage = frontmatter.match(/^heroImage:\s*\r?\n(?:^[ \t]+.*\r?\n)*/m)?.[0]
  if (heroImage) {
    const src = field(heroImage.replace(/^[ \t]+/gm, ''), 'src')
    const alt = field(heroImage.replace(/^[ \t]+/gm, ''), 'alt')
    if (!src || !alt) fail('heroImage 需要同时填写 src 和 alt。')
    await validateLocalImage(directory, src)
  }

  for (const image of body.matchAll(/!\[[^\]]*\]\(([^)]+)\)/g)) {
    const reference = image[1].trim().split(/\s+["']/)[0]
    if (!/^(?:https?:|data:|\/)/.test(reference)) await validateLocalImage(directory, reference)
  }
  for (const image of body.matchAll(/\bfrom\s+["'](\.\/assets\/[^"']+)["']/g)) {
    await validateLocalImage(directory, image[1])
  }
  if (/<img\b[^>]*\bsrc=["']\.\/assets\//i.test(body)) {
    fail('本地图片请使用 Markdown 图片语法；原生 <img src="./assets/..."> 部署后可能失效。')
  }

  return { file, content, draft, category }
}

async function createPost(value, title, selectedCategory) {
  const directory = postDirectory(value)
  if (!title?.trim()) fail('用法：bun run post:new <slug> "文章标题" [分类 slug]')
  const category = selectedCategory ?? (localCategories.length === 1 ? localCategories[0].slug : undefined)
  if (!category || !localCategories.some((entry) => entry.slug === category)) {
    fail(`请指定有效的本地分类：${localCategories.map((entry) => entry.slug).join(', ')}`)
  }
  const date = todayInChina()
  const contents = `---\ntitle: ${JSON.stringify(title.trim())}\ndescription: 'TODO: 用一两句话介绍文章内容。'\npublishDate: ${date}\ncategory: '${category}'\ntags: []\nlanguage: 'Chinese'\ndraft: true\n---\n\n# ${title.trim()}\n\n在这里开始写正文。图片放在 ./assets/，用 ![图片说明](./assets/文件名.png) 引用。\n`

  await mkdir(directory)
  await mkdir(path.join(directory, 'assets'))
  const file = path.join(directory, 'index.md')
  await writeFile(file, contents, { flag: 'wx' })
  console.log(`草稿已创建：${path.relative(root, file)}`)
  console.log(`完成后运行：bun run post:publish ${value}`)
}

async function publishPost(value) {
  const post = await validatePost(value)
  const updated = post.draft === 'true'
    ? post.content
      .replace(/^publishDate:\s*.+$/m, `publishDate: ${todayInChina()}`)
      .replace(/^draft:\s*true\s*$/m, 'draft: false')
    : post.content
  if (post.draft === 'true') await writeFile(post.file, updated)

  console.log('正在执行 Astro 检查…')
  const check = spawnSync(process.execPath, ['run', 'check'], { cwd: root, stdio: 'inherit' })
  if (check.error || check.status !== 0) {
    if (post.draft === 'true') await writeFile(post.file, post.content)
    fail('Astro 检查未通过；文章已恢复为草稿，请修正后重试。')
  }

  console.log(`文章已准备发布：/blog/${value}`)
  console.log(`分类页面：/posts/${post.category}`)
  console.log('提交并推送后，Vercel 才会更新线上网站：')
  console.log(`git add src/content/blog/${value}`)
  console.log(`git commit -m "Publish ${value}"`)
  console.log('git push')
}

try {
  if (action === 'new') await createPost(slug, extra[0], extra[1])
  else if (action === 'validate') {
    const post = await validatePost(slug)
    console.log(`文章内容检查通过；当前状态：${post.draft === 'true' ? '草稿' : '已发布'}。`)
  } else if (action === 'publish') await publishPost(slug)
  else fail('用法：bun run post:new <slug> "文章标题" [分类] | bun run post:validate <slug> | bun run post:publish <slug>')
} catch (error) {
  console.error(error instanceof Error ? error.message : error)
  process.exitCode = 1
}
