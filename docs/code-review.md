# 网站代码审查报告

审查日期：2026-10-31。代码基线：本地 `main`，HEAD `9bc5a45`。目标是在保留 Astro 架构、Pure 风格与已有功能的基础上，完善个人学术与技术主页。

本次先阅读了 `AGENTS.md`，再核对源码、锁文件、已安装主题实现和线上响应。未安装依赖，未运行构建、格式化、发布、Commit 或 Push，未读取环境变量敏感值。根据后续指示，仅新增本报告；不修改网站代码。审查前已有未跟踪文件 `AGENTS.md`，保持原样。

结论分为代码确认、线上确认和待验证。没有运行浏览器视觉测试、Lighthouse、完整链接扫描或构建，因此不宣称构建通过、所有页面无错或性能达标。线上请求是有限抽样，不能替代 Search Console 的收录数据。

## A. 项目整体架构与技术栈

### 实际技术栈

下表版本以 `bun.lock` 为准；根包版本 `4.1.6` 是项目自身版本，不是 Astro 或主题依赖版本。

| 层次 | 实际依赖及版本 | 作用 |
| --- | --- | --- |
| 框架 | Astro 6.2.1、TypeScript 6.0.3 | 文件路由、内容集合、类型检查 |
| 构建 | Vite 7.3.2、Bun 锁文件 | Astro 构建与依赖管理 |
| 主题 | astro-pure 1.4.7 | 布局组件、内容工具、集成插件 |
| 内容 | @astrojs/mdx 5.0.4、@astrojs/rss 4.0.18 | Markdown/MDX、RSS |
| 样式 | UnoCSS 66.6.8、Typography preset | 原子样式和文章排版 |
| 搜索与地图 | Pagefind 1.5.2、@astrojs/sitemap 3.7.2 | 静态搜索索引、站点地图 |
| 部署 | @astrojs/vercel 10.0.6 | Vercel 服务端与预渲染输出 |
| 监测 | @vercel/analytics 2.0.1、@vercel/speed-insights 2.0.0 | 访问与性能监测接入 |
| 图文 | Sharp 0.34.5、Mermaid 11.17.2、KaTeX/remark-math | 图片处理、图表、公式 |
| 工具 | ESLint 10.2.1、Prettier 3.8.3 | 静态规则与格式化 |

根配置还声明 `@astrojs/compiler-rs`，但没有发现应用配置中显式启用它的代码，不能将“安装”当作“实际使用 Rust 编译器”。Bun/Node 生产运行时版本未由根 `package.json` 的 `engines` 或 `packageManager` 固定，本次不推测平台版本。

### 渲染与数据流

`astro.config.ts` 设置 `output: 'server'`、Vercel adapter、`trailingSlash: 'never'`。博客详情、博客分页、项目详情、分类详情、标签分页、归档和文档详情显式 `prerender = true`；首页、About 等没有同样的页面级声明。主题配置里的 `prerender: true` 并不等于所有路由都已预渲染：核对安装主题的 `index.ts`，未见它把所有页面统一设成静态输出。

核心数据流：

1. `src/site.config.ts` 提供个人信息、教育、项目、荣誉、分类和主题集成配置。
2. `src/content.config.ts` 用 glob loader 和 Zod 定义 blog/docs/projects 集合。
3. 页面组合配置数据、集合内容与组件。
4. `BaseLayout` 统一注入 head、主题、导航、自定义页脚、全局样式和监测。
5. `ContentLayout` 承载长文、目录和移动端侧栏；`BlogPost`、`CommonPage`、`IndividualPage` 为不同内容形态再封装。

### Astro Theme Pure 的组织方式

仓库保留完整 `packages/pure/` 主题源码，但根依赖声明的是 `astro-pure: 1.4.7`，没有 workspace/file 链接。当前 `node_modules/astro-pure` 也不是显示为符号链接的目录。应用通常从安装包导入，而非直接从 `packages/pure/` 导入。

已安装主题实际自动接入 MDX、sitemap、UnoCSS、阅读时间、外链处理、图片缩放标记，并通过 Vite 虚拟模块 `virtual:config` 暴露配置。构建完成后调用 Pagefind。

特别注意：`astro-pure check` 并不是常规质量检查，它读取 `BUN_LINK_PKG`；当值为 `true` 时执行 `bun link` 和 `bun link astro-pure`。因此构建环境可能改变主题解析来源。本次没有读取该环境变量的值，无法保证生产构建与当前本地安装包完全一致。未来改主题前必须先明确唯一生效来源。

## B. 核心目录和文件说明

| 位置 | 当前用途与边界 |
| --- | --- |
| `src/pages/` | 全部页面和 RSS、robots 端点；放在这里的普通 Astro 文件也可能成为公开路由 |
| `src/components/` | home/about/projects/honors/posts、内容图片、评论、友情链接、自定义页脚 |
| `src/layouts/` | 基础框架、长文、博客、通用页、独立 Markdown 页 |
| `src/content/blog/` | 4 篇已发布技术文章；每篇目录内有正文与 assets |
| `src/content/projects/` | rescue 项目正文与图片，另有 `_template` |
| `src/content/docs/` | 主题遗留的 setup/integrations/advanced 文档，不是个人研究内容 |
| `src/content/honors/` | 荣誉图片；没有对应 honors 内容集合，展示数据在站点配置中 |
| `src/assets/` | 头像、学校标志、全局 CSS 等共享素材 |
| `src/lib/post-collections.ts` | 发布文章分类合法性与分类计数 |
| `src/plugins/` | 标题锚点、Shiki 复制/折叠/高亮等 Markdown 扩展 |
| `public/` | favicon、社交卡片、CV PDF、友链 JSON、RSS XSL；原路径公开提供 |
| `packages/pure/` | 完整主题副本，有独立 package.json/bun.lock，但默认不是根项目 workspace |
| `preset/` | 主题预置签名组件、头像缓存脚本等；不是自动全量启用的应用模块 |
| `scripts/post.mjs` | 文章创建、校验、准备发布工具 |
| `.github/` | Issue 模板和 Funding；未发现 workflows 目录 |
| `.astro/`、`dist/`、`.vercel/` | 本地生成物/平台产物，不作为最新生产源码证据 |
| 根 `docs/` | 本次审查文档；不同于可公开访问的 `src/content/docs/` |

`tsconfig.json` 继承 Astro strict；部分路径别名仍指向不存在的 `src/utils/` 等历史位置，不应据此认定对应模块存在。

## C. 当前网站各页面的实现情况

| 页面/路由 | 源码、数据及主要依赖 | 实现与观察 |
| --- | --- | --- |
| Home `/` | `src/pages/index.astro`；site config；ProfileIntro/EducationSection/ProjectsSection/HonorsSection/PostsSection | 个人卡片、CV、研究简介、教育、前两个项目/荣誉、主题入口、随机引用。顺序来自配置数组，不是自动日期排序 |
| About `/about` | `src/pages/about/index.astro`；CommonPage、Substats、Collapse、Spoiler | 研究介绍、兴趣、社交统计、折叠诗歌；介绍与首页重复硬编码，后续容易不同步 |
| Projects `/projects` | `src/pages/projects/index.astro`；config.projects、ProjectCards | 过滤 draft；当前一个 rescue 项目，四宫格、标签、外部组织链接 |
| 项目详情 `/projects/rescue` | `src/pages/projects/[...slug].astro`；projects 集合、ContentLayout、TOC、ImageGrid | 配置 slug 与正文匹配，缺正文会抛错；预渲染；页面标题描述优先取配置，不取正文 frontmatter |
| Posts `/posts` | `src/pages/posts/index.astro`；postCollections、PostCollectionCards、分类工具 | 展示知识分类，不是逐篇文章流；Embedded Systems 本地分类，Robotics 指向飞书知识库 |
| `/posts/embedded-systems` | `src/pages/posts/[slug].astro`；getCategorizedPosts、PostPreview | 预渲染本地分类，列出4篇文章；无分类分页；外部分类不生成本站详情页 |
| `/blog`、后续分页 | `src/pages/blog/[...page].astro`；主题集合工具、Paginator、PostPreview | 保留主题文章总列表，每页8篇，与 Posts 入口并存，不是相同 URL 的重复文章正文 |
| `/blog/<id>` | `src/pages/blog/[...id].astro`、BlogPost | frontmatter、正文、目录、封面、版权、推荐、公式、图片缩放、按需 Mermaid；生产集合过滤 draft |
| `/honors` | `src/pages/honors/index.astro`；config.honors、HonorCards | 两项展示记录，无荣誉详情路由；图片不属于 Markdown 内容集合 |
| `/archives` | `src/pages/archives/index.astro` | 按 updatedDate 优先、publishDate 次之分组年份，不一定是首次发表年份 |
| `/tags`、`/tags/<tag>` | tags/index 与 `[tag]/[...page].astro` | 标签统计、分页；标签只去重和转小写，不转为统一 slug |
| `/search` | search/index、主题 PFSearch | 已开启 Pagefind；依赖构建时索引，开发模式不等同生产搜索 |
| `/links` | links/index、public/links.json、FriendList、Timeline | 主题友链页、随机排序、复制本站信息；申请链接仍指向上游仓库 |
| `/docs`、`/docs/<id>` | docs/index、`[...id]`、docs 集合、DocsContents | 17篇主题文档，编辑按钮指向上游主题；当前与个人学术定位关联较弱 |
| `/docs/DocsContents` | `src/pages/docs/DocsContents.astro` | 本应用作组件，但放在 pages 下成为 partial 路由；线上200且无完整 head，并被 sitemap 收录 |
| `/terms` 和四个子页 | terms/index、Markdown、IndividualPage | 隐私/条款/版权/免责声明正文仍只有生成政策的模板提示，尚非完整站点说明 |
| `/rss.xml`、`/docs/rss.xml` | 两个 rss.xml.ts | 输出博客/主题文档订阅；博客正文用 remark 管线重建，不是 MDX 完整渲染 |
| `/robots.txt` | robots.txt.ts | 允许抓取，公开 sitemap；AI Bot 行没有 Disallow，不能理解为已禁止 AI 抓取 |
| 404 | `src/pages/404.astro` | 自定义错误页；线上随机不存在路径实测返回 HTTP 404 |

当前没有 Research、Publications、Teaching、Academic Pages 整合专用路由或内容集合，也没有论文元数据模型。研究方向仅出现在个人介绍与技能标签中。没有证据确认用户另有哪一个学术站点，后续整合需提供源站或内容。

## D. UI 与设计系统分析

### 应保留的设计规范

- 颜色：`src/assets/styles/app.css` 使用 HSL 语义 token；浅色主色 `200 29% 45%`，暗色主色 `195 95% 85%`。前景、背景、muted、border、card 等统一映射到 UnoCSS。
- 字体：Astro Fonts 配置 Fontshare Satoshi，normal/italic、400/500、latin，基础 head 预加载。中文姓名单独使用宋体/衬线系统回退，英文名使用 Georgia。部分600/700字重不在明确配置的字体权重中，应后续检查实际字体合成表现。
- 布局：BaseLayout 限制70rem宽度，并处理安全区域；首页内容进一步收窄；正文桌面文章+侧栏、移动端抽屉目录。
- 视觉：柔和蓝灰主色、细边框、低对比背景、大圆角卡片、胶囊标签、留白和克制阴影。项目卡片使用文字+2×2图像，移动端图像在前。
- 排版：UnoCSS Typography `prose text-base`，自定义引用、代码、表格、标题锚点；Shiki 使用 GitHub light/dark，支持复制、语言标记、折叠和行号。
- 交互：滚动隐藏/显示的 sticky 导航、移动菜单、主题循环切换、回顶、目录抽屉、图片缩放、折叠和悬停反馈。

### 具体风险与改进边界

1. `ProjectCards` 和 `HonorCards` 使用普通 `<img src={metadata.src}>`，没有经 Image/getImage 按显示尺寸生成响应式图片，也没有显式图片尺寸属性。项目素材 `rescue/assets/03.png` 大约5.62MB，代码会直接引用其资源 URL。CDN实际传输字节未测，但大图路径已确认。
2. 首页头像有尺寸、eager 和 fetchpriority，优先级配置合理；仍可生成适合约100px显示尺寸的变体。`ImageGrid` 已使用 Astro Image，说明可以沿用现有能力，而无需引入新图片框架。
3. 响应式断点分散在640/768附近和局部34rem/44rem/48rem。ContentLayout 使用769px，与 UnoCSS md 边界存在交界差异，需要在768–770px重点验证。
4. reduced-motion 只把动画缩短到100ms，仍保留移动效果。侧栏缺少完整焦点管理、Escape关闭及状态声明；导航菜单按钮缺少 aria-expanded/aria-controls，各菜单链接统一 aria-label 覆盖了有意义的可见名称。
5. 主题工具监听系统变化时未在回调重新核查用户当前显式选择；用户选定 light/dark 后，后续系统主题变化仍可能覆盖显示。初始化直接访问 localStorage，也没有存储不可用时的兜底。
6. Mermaid 只在首次渲染读取明暗主题，切换主题不会自动重绘已生成 SVG。BlogPost 有渲染脚本，但项目详情没有同一能力，未来项目内使用 Mermaid 时需统一内容能力。
7. 首页和About的学校、导师、年级等硬编码重复；“sophomore”是会过时的信息，需作者确认当前表述。页脚 Updated 使用请求/构建日期，不代表真实内容修改日期。

本次未进行视觉截图、色彩对比度测量与真机操作，以上响应式和无障碍部分为代码风险，而非已复现的所有设备故障。

## E. SEO 现状及问题清单

### 已实现

`src/components/BaseHead.astro` 统一输出 Title、Description、author、canonical、OG、Twitter card、RSS发现链接、sitemap发现链接和favicon。博客使用frontmatter描述，项目详情使用配置描述。文章标题/描述有60/160字符的集合校验；生产集合过滤草稿。URL配置为无尾斜杠。实际不存在URL返回404，没有发现代码将所有错误页面重定向到首页。

线上抽样来源：[首页](https://www.zhuze.website/)、[About](https://www.zhuze.website/about)、[robots.txt](https://www.zhuze.website/robots.txt)、[sitemap](https://www.zhuze.website/sitemap-0.xml)、[意外组件路由](https://www.zhuze.website/docs/DocsContents)。

### 确认的问题

| 编号 | 问题与证据 | 影响 |
| --- | --- | --- |
| SEO-01 | 请求非www首页会最终到www；但首页/About canonical均指向非www，sitemap和robots也使用非www；BaseHead的OG图片又按请求域名生成 | 规范域与实际最终域冲突，搜索引擎收到不一致信号；不能据此断言完全不收录 |
| SEO-02 | `/docs/DocsContents` 线上200、无title/canonical等完整head，并出现在线上sitemap | 组件片段意外成为可抓取页面，是明确工程问题 |
| SEO-03 | 首页与About均输出通用的个人网站描述；Projects/Honors经CommonPage也没有独立description通道 | 核心入口缺少个人身份、研究方向、项目关键词的专门摘要 |
| SEO-04 | sitemap公开17篇主题文档、搜索页、模板政策页及组件片段 | 站点地图缺少内容发布策略；保留主题文档是产品选择，不应一律删除，但应明确是否参与索引 |
| SEO-05 | 未发现 JSON-LD；线上首页/About也无application/ld+json | 缺Person/ProfilePage、BlogPosting、BreadcrumbList等语义；这不是阻止普通收录的错误 |
| SEO-06 | 所有页面html lang固定en-US；4篇博客标记Chinese但布局不使用该字段设置文档语言；项目正文也以中文为主 | 语言声明与主要正文不一致，不利于辅助技术和语言识别；不能宣称因此被惩罚 |
| SEO-07 | BlogPost把updatedDate优先赋给articleDate，BaseHead再写入article:published_time | 更新日期覆盖发布日期语义；没有单独modified_time |
| SEO-08 | 项目alt为Project image one等泛化文本；第二项荣誉图片alt沿用了第一项RoboCup描述；部分封面alt只是“封面” | 替代文本信息量低或不准确 |
| SEO-09 | 标签直接用原文拼URL，现有地图包含altium%20designer、remote%20access | 目前不等于坏链，但缺少稳定slug约束；未来特殊字符标签应校验并编码 |
| SEO-10 | 自定义Footer没有消费theme.footer.links/social配置，因此配置中的Site Policy和RSS入口并未由该页脚展示 | 配置与实际界面不一致；RSS head发现仍存在，并非RSS功能完全失效 |

未发现应用源码中的全站noindex或重定向规则；首页/About响应头未见X-Robots-Tag。不能推广为所有路由、平台Preview部署均无noindex。robots中连续AI Bot声明最终也未配拒绝规则，不构成已实现的AI抓取屏蔽。

### 内链与内容语义

主导航与自定义页脚覆盖Home/Projects/Honors/Posts/About；文章仍回到/blog，分类体系与旧博客体系双入口并存。建议保留文章现有URL，补分类返回与面包屑，而不是迁移所有博客地址。首页研究介绍没有指向研究成果的独立入口，Robotics飞书链接不会形成本站研究知识库页面。

项目页外层h1与rescue正文的Markdown一级标题会并存，应将正文层级统一到h2起。标题层级问题不应表述为必然不能收录。

### 尚无法确认

Google/Bing实际收录数量、Search Console验证及提交情况、搜索引擎选择的canonical、Core Web Vitals、完整重定向状态码链、全部图片与URL可达性、社交卡片实际像素是否符合声明的1200×630，均未完整验证。

## F. 部署架构与开发工作流

### 本地命令

| 命令 | 代码中的实际行为/注意事项 |
| --- | --- |
| `bun install` | 安装依赖；CI宜使用--frozen-lockfile。此次未执行 |
| `bun run dev` | astro dev；server.host=true，允许局域网访问 |
| `bun run dev:check` | 使用&组合watch检查和开发服务，跨平台并发与退出管理需验证 |
| `bun run check` | astro check；不是完整测试，可能生成Astro文件，此次未执行 |
| `bun run build` | astro-pure check → astro check → astro build；第一步可能链接本地主题 |
| `bun run preview` | astro preview；当前Vercel服务端产物是否可由该命令完整预览，未运行验证 |
| `bun run lint` / `format` | 分别含--fix和--write，都会改文件，不适合作为只读审查命令 |
| `bun run post:new <slug> "标题"` | 创建正文与assets；slug限制小写字母/数字/连字符 |
| `bun run post:validate <slug>` | 校验frontmatter、分类、本地图片引用 |
| `bun run post:publish <slug>` | 修改draft和发布日期，执行check；失败恢复原正文；只打印Git命令，不自动Push或部署 |

文章校验工具用正则解析frontmatter和图片引用，覆盖范围有限，不能当作通用YAML/MDX分析器；构建脚本也没有自动逐篇执行post:validate。schema允许heroImage.alt缺省，与脚本要求同时填写src/alt存在约束不一致。日期排序优先updatedDate，分类说明若强调“发布日期排序”应统一口径。

### Git与平台

- 本地分支main，显示跟踪origin/main，均指向9bc5a45；未fetch，因此不能证明远程当前仍完全一致。
- origin为 `https://github.com/zz-unofficial/zhuze_website.git`。近期记录采用feat:/chore:前缀。
- `.github/`未发现Actions工作流；存在Issue模板，但没有证据证明远程不存在其他平台检查。
- Vercel adapter、`.vercel/output/`和自定义页脚指向Vercel；线上响应Server也确认为Vercel。
- 推送触发Vercel部署符合发布脚本提示，但Git集成、Production Branch、平台构建命令、运行时版本、环境变量与Preview权限没有控制台证据，列为待确认。

### 环境变量与配置风险

仅检查引用位置，未读取.env或平台密钥值：

- `import.meta.env.SITE`：RSS与robots，来自Astro site配置。
- `PROD`：主题集合草稿过滤；`DEV`、`BASE_URL`：主题搜索；均为Astro内置配置用途。
- `process.env.BUN_LINK_PKG`：主题check脚本决定是否bun link，影响构建可复现性。
- Dockerfile设置ASTRO_TELEMETRY_DISABLED；未发现应用自定义秘密变量引用。
- `.gitignore`只明确忽略.env、.env.production，没有统一覆盖.env.local等变体；将来添加变量时需补规则。

### 工程风险

1. Pagefind构建钩子用`npx -y pagefind`，并在进程close时无论退出码都resolve，索引失败可能不阻止构建。未验证当前线上搜索索引是否完整。
2. 未配置项目测试套件或coverage目标；packages/pure的test是失败占位命令。ESLint主脚本只覆盖src，不能替代scripts、主题副本等校验。
3. About的Substats在服务端await多个第三方请求；Bilibili有5秒超时与fallback，但api.swo.moe请求没有timeout/response.ok检查，可能拖慢页面。页面“统计随部署更新”的提示与服务端渲染模式未必一致。
4. 评论配置关闭，但Comment组件仍在构建脚本中静态导入Waline客户端与CSS；是否最终加载冗余JS需要产物分析，不能仅凭enable=false认定零成本。
5. Docker镜像未固定Bun版本；Compose旧new服务走pure new，绕过现有post:new分类流程。preview依赖dist，而当前Vercel输出布局与旧静态工作流是否兼容未验证。Compose构建服务还会清理宿主导出目录，不应在只读审查中执行。
6. cache:avatars使用tsx，但根项目未直接声明tsx；能否依赖本地已有/间接安装工具执行不具备稳定保证。

## G. 建议的后续优化任务：P0、P1、P2

优先级按本站维护价值定义：P0优先修复明确错误和收录信号冲突，不代表已发现全站安全事故。

### P0：修复明确错误、稳定发布基础

1. **T01 统一域名**：建议顺应当前www最终域，统一site、canonical、OG、RSS与sitemap；核对Vercel域名跳转。保留现有路径。
2. **T02 消除组件公开路由**：将DocsContents移到组件目录并更新导入；明确旧URL返回404还是重定向到/docs；从sitemap移除片段。
3. **T03 修复友链复制**：站点标题含单引号，当前拼入单引号JS字符串会破坏onclick；使用事件监听和数据属性，替换上游申请地址。
4. **T04 首屏图片减重**：项目/荣誉/头像统一按用途生成尺寸与现代格式，保留原图供详情；为卡片补尺寸或稳定宽高比。
5. **T05 第三方统计降级**：统一超时、状态码处理和缓存/占位策略，避免About关键响应依赖无超时远程服务。

### P1：完善个人与学术信息架构

6. **T06 SEO元数据**：核心页面专属Title/Description；Person/ProfilePage、文章结构化数据、面包屑、正确发布日期/更新时间；逐页语言设置和alt校正。
7. **T07 首页与About信息统一**：公共个人简介数据源；作者确认年级/导师链接/研究定位；About增加教育、研究经历、联系和CV，保留兴趣内容但调整信息优先级。
8. **T08 Research与Academic Pages整合**：新增研究页和结构化研究/论文模型，按真实成果填写；先确认已有Academic Pages源站，建立旧新URL映射，避免两个站点长期重复维护同一成果。
9. **T09 项目案例规范**：统一卡片/正文元数据，补个人职责、方法、结果、指标、代码/演示、项目状态和对应论文链接；正文从h2开始。
10. **T10 Posts连续导航**：保持/blog文章URL，补所属分类、相关文章和研究/项目关联；本地长列表达到规模后再分页；明确飞书内容的本站摘要与外链边界。
11. **T11 内容与索引策略**：决定主题文档是否继续公开；完善真实站点政策；搜索、辅助页、模板页按用途设置索引策略，不简单全站noindex。
12. **T12 发布质量门禁**：固定运行时与依赖安装方式；增加只读lint/format检查和少量关键回归检查；Pagefind失败应明确报错；确认主题唯一来源。

### P2：体验与可持续维护

13. **T13 无障碍与主题修复**：菜单/侧栏状态、焦点、Escape、reduced-motion、系统主题覆盖问题、Mermaid主题同步和断点统一。
14. **T14 性能实测与持续监测**：基于移动端Lighthouse、Vercel真实数据核查LCP/CLS/INP；分析Waline、字体、代码高亮与第三方JS，按证据精简。
15. **T15 内容维护工具统一**：校验器与schema约束统一，文档/Compose跟随同一文章流程；按真实内容更新时间显示页脚；评估是否保留主题副本与预置样例。

## H. 每项任务涉及文件和预计修改范围

下列均为待确认的实施建议，不是本次已修改内容。S约1–3文件，M约3–8文件，L跨模块或需内容迁移；实际数量以实施设计为准。

| 任务 | 主要文件/位置 | 预计范围与验收重点 |
| --- | --- | --- |
| T01 | astro.config.ts、src/components/BaseHead.astro、src/site.config.ts、两个rss.xml.ts、robots.txt.ts；Vercel域名配置 | M；所有规范URL与最终域一致，无循环跳转 |
| T02 | src/pages/docs/DocsContents.astro、docs/index.astro、docs/[...id].astro、新组件位置 | S–M；组件正常，旧片段不再200可索引，地图不含片段 |
| T03 | src/pages/links/index.astro，必要时主题toast调用封装 | S；含引号/换行文本均可复制，申请目标为本人仓库 |
| T04 | ProjectCards、HonorCards、ProfileIntro、EducationSection及相关图片 | M；保持卡片样式，移动端实际下载图显著减小且无布局跳动 |
| T05 | src/components/about/Substats.astro、about/index.astro | S；上游失败/超时仍快速返回可用页面 |
| T06 | BaseHead、BaseLayout、CommonPage、BlogPost、核心pages、site.config.ts、图片元数据 | L；专属描述、有效JSON-LD、正确语言/日期/alt，不伪造学术信息 |
| T07 | site.config.ts、pages/index.astro、pages/about/index.astro、ProfileIntro | M；两处简介一致，CV/联系方式和经历经作者核对 |
| T08 | 新src/pages/research/、研究组件、content.config.ts、研究/论文内容、导航、BaseHead | L；先定义源站迁移方案，再接真实成果；已有URL可追溯 |
| T09 | projects配置/集合、projects/[...slug].astro、ProjectCards、rescue/index.mdx | M；避免双份元数据漂移，项目责任与结果可验证 |
| T10 | BlogPost、posts/[slug].astro、post-collections.ts、PostCollectionCards | M；文章—分类—项目可往返，旧文章URL保持稳定 |
| T11 | astro.config.ts/主题sitemap接入点、BaseHead元数据类型、src/pages/docs/、terms/、custom/Footer | L；按页面类型决定公开与索引，RSS/政策入口可达 |
| T12 | package.json、bun.lock、eslint.config.mjs、新.github/workflows/、主题集成实现 | M–L；只读检查、可复现构建、索引失败不静默通过；不可直接修改node_modules作为长期修复 |
| T13 | ContentLayout、global.css、BlogPost、主题Header/ThemeProvider/theme工具的明确生效来源 | M–L；键盘可操作、系统切换尊重用户选择、断点一致 |
| T14 | BaseHead、BaseLayout、waline组件、卡片与内容图片；依实测调整 | M；记录优化前后指标，避免单纯删功能 |
| T15 | scripts/post.mjs、content.config.ts、compose.yml、Dockerfile、package.json、custom/Footer、维护文档 | M–L；工具与实际发布流程一致，更新时间可信 |

主题修复有三种可选实现：在src覆写组件、将本地主题明确纳入受控依赖、向上游贡献后升级。应先选定策略，再改Header、Pagefind等主题代码，避免同时维护两套不一致实现。

## I. 推荐的长期开发路线图

### 阶段一：建立可信基础

先完成T01–T05，核对Vercel生产分支和运行时。以线上最终域、地图、404、复制交互、移动端图片和About失败降级为验收。之后再向Search Console/Bing提交稳定地图；账号验证与真实收录状态由平台数据确认。

### 阶段二：让个人身份与研究方向清晰可见

完成T06–T09。保持现有蓝灰、圆角、卡片和双主题体系，统一首页/About资料，新增Research并复用内容布局。研究项目、论文、技术文章分别建模，通过链接关联；没有发表成果时展示真实研究方向与在研项目，不制造Publications占位成绩。

### 阶段三：形成长期内容网络

完成T10–T12，将文章与项目、研究方向关联。确定主题文档与Academic Pages的职责，优先复用结构化成果数据，不复制一整套Jekyll架构到Astro。旧站迁移采用明确URL映射与重定向计划，技术博客保留原地址。

### 阶段四：持续体验优化

完成T13–T15。以真实移动端数据驱动字体、图片与JS优化；保持少量有价值的发布检查。每次新增项目/论文时同步检查描述、alt、语言、日期、成果链接和CV，每季度核对个人简介、外链、统计服务与搜索收录情况。

本次建议不要求重构为其他框架。现有Astro内容集合、Pure组件和Vercel部署足以支撑个人学术与技术主页的持续扩展。后续实施应逐项确认范围、保持现有文章路径，并在修改后执行对应验证。
