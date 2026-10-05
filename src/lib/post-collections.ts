import type { CollectionEntry } from 'astro:content'

import { getBlogCollection, sortMDByDate } from 'astro-pure/server'
import { postCollections } from '@/site-config'

export async function getCategorizedPosts(): Promise<CollectionEntry<'blog'>[]> {
  const posts = sortMDByDate((await getBlogCollection()).filter((post) => !post.data.draft)) as CollectionEntry<'blog'>[]
  const localCategories = new Set(
    postCollections
      .filter((collection) => !collection.draft && !collection.externalUrl)
      .map((collection) => collection.slug)
  )

  for (const post of posts) {
    if (!localCategories.has(post.data.category)) {
      throw new Error(
        `Blog post "${post.id}" has unknown category "${post.data.category}". Add a local entry to postCollections or correct its Frontmatter.`
      )
    }
  }

  return posts
}

export function getPostCounts(posts: CollectionEntry<'blog'>[]): Record<string, number> {
  return posts.reduce<Record<string, number>>((counts, post) => {
    counts[post.data.category] = (counts[post.data.category] ?? 0) + 1
    return counts
  }, {})
}
