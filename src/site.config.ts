import type {
  CardListData,
  Config,
  IconsType,
  IntegrationUserConfig,
  ThemeUserConfig
} from 'astro-pure/types'

export const theme: ThemeUserConfig = {
  // [Basic]
  /** Title for your website. Will be used in metadata and as browser tab title. */
  title: 'Zhuze',
  /** Will be used in index page & copyright declaration */
  author: 'Zhuze',
  /** Description metadata for your website. Can be used in page metadata. */
  description: "Zhuze's personal website and blog",
  /** The default favicon for your site which should be a path to an image in the `public/` directory. */
  favicon: '/favicon/favicon.ico',
  /** The default social card image for your site which should be a path to an image in the `public/` directory. */
  socialCard: '/images/social-card.png',
  /** Specify the default language for this site. */
  locale: {
    lang: 'en-US',
    attrs: 'en_US',
    // Date locale
    dateLocale: 'en-US',
    dateOptions: {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    }
  },
  /** Set a logo image to show in the homepage. */
  logo: {
    src: '/src/assets/avatar.jpg',
    alt: 'Avatar'
  },

  titleDelimiter: '•',
  prerender: true, // pagefind search is not supported with prerendering disabled
  npmCDN: 'https://cdn.jsdelivr.net/npm',

  // Still in test
  head: [
    /* Telegram channel */
    // {
    //   tag: 'meta',
    //   attrs: { name: 'telegram:channel', content: '@cworld0_cn' },
    //   content: ''
    // }
  ],
  customCss: [],

  /** Configure the header of your site. */
  header: {
    menu: [
      { title: 'Blog', link: '/blog' },
      { title: 'Docs', link: '/docs' },
      { title: 'Projects', link: '/projects' },
      { title: 'Links', link: '/links' },
      { title: 'About', link: '/about' }
    ]
  },

  /** Configure the footer of your site. */
  footer: {
    // Year format
    year: `© ${new Date().getFullYear()}`,
    // year: `© 2019 - ${new Date().getFullYear()}`,
    links: [
      // Privacy Policy link
      {
        title: 'Site Policy',
        link: '/terms',
        pos: 2 // position set to 2 will be appended to copyright line
      }
    ],
    /** Enable displaying a “Astro & Pure theme powered” link in your site’s footer. */
    credits: true,
    /** Optional details about the social media accounts for this site. */
    social: [
      { icon: 'github', label: 'GitHub', href: 'https://github.com/zz-unofficial/zhuze_website' },
      { icon: 'rss', label: 'RSS', href: '/rss.xml' }
    ]
  },

  // [Content]
  content: {
    /** External links configuration */
    externalLinks: {
      content: ' ↗',
      /** Properties for the external links element */
      properties: { style: 'user-select:none' }
    },
    /** Blog page size for pagination (optional) */
    blogPageSize: 8,
    /** Share buttons to show */
    // Currently support weibo, x, bluesky
    share: ['weibo', 'x', 'bluesky']
    /** Enable image captions (default false) */
    // imageCaption: true
  }
}

export const integ: IntegrationUserConfig = {
  // [Links]
  // https://astro-pure.js.org/docs/integrations/links
  links: {
    // Friend logbook
    logbook: [
      { date: '2025-03-16', content: 'Is there a leakage?' },
      { date: '2025-03-16', content: 'A leakage of what?' },
      { date: '2025-03-16', content: 'I have a full seat of water, like, full of water!' },
      { date: '2025-03-16', content: 'Must be the water.' },
      { date: '2025-03-16', content: "Let's add that to the words of wisdom." }
    ],
    // Yourself link info
    applyTip: [
      { name: 'Name', val: theme.title },
      { name: 'Desc', val: theme.description || 'Null' },
      { name: 'Link', val: 'https://zhuze.website' },
      { name: 'Avatar', val: 'https://zhuze.website/favicon/favicon.ico' }
    ],
    // Cache avatars in `public/avatars/` to improve user experience.
    cacheAvatar: false
  },
  // [Search]
  pagefind: true,
  // Add a random quote to the footer (default on homepage footer)
  // See: https://astro-pure.js.org/docs/integrations/advanced#web-content-render
  // [Quote]
  quote: {
    // - Hitokoto
    // https://developer.hitokoto.cn/sentence/#%E8%AF%B7%E6%B1%82%E5%9C%B0%E5%9D%80
    // server: 'https://v1.hitokoto.cn/?c=i',
    // target: `(data) => (data.hitokoto || 'Error')`
    // - Quotable
    // https://github.com/lukePeavey/quotable
    // server: 'http://api.quotable.io/quotes/random?maxLength=60',
    // target: `(data) => data[0].content || 'Error'`
    // - DummyJSON
    server: 'https://dummyjson.com/quotes/random',
    target: `(data) => (data.quote.length > 80 ? \`\${data.quote.slice(0, 80)}...\` : data.quote || 'Error')`
  },
  // [Typography]
  // https://unocss.dev/presets/typography
  typography: {
    class: 'prose text-base',
    // The style of blockquote font `normal` / `italic` (default to italic in typography)
    blockquoteStyle: 'italic',
    // The style of inline code block `code` / `modern` (default to code in typography)
    inlineCodeBlockStyle: 'modern'
  },
  // [Lightbox]
  // A lightbox library that can add zoom effect
  // https://astro-pure.js.org/docs/integrations/others#medium-zoom
  mediumZoom: {
    enable: true, // disable it will not load the whole library
    selector: '.prose .zoomable',
    options: {
      className: 'zoomable'
    }
  },
  // Comment system
  waline: {
    enable: false,
    // Server service link
    server: 'https://astro-theme-pure-waline.arthals.ink/',
    // Show meta info for comments
    showMeta: false,
    // Refer https://waline.js.org/en/guide/features/emoji.html
    emoji: ['bmoji', 'weibo'],
    // Refer https://waline.js.org/en/reference/client/props.html
    additionalConfigs: {
      // search: false,
      pageview: true,
      comment: true,
      locale: {
        reaction0: 'Like',
        placeholder: 'Welcome to comment. (Email to receive replies. Login is unnecessary)'
      },
      imageUploader: false
    }
  }
}

export const terms: CardListData = {
  title: 'Terms content',
  list: [
    {
      title: 'Privacy Policy',
      link: '/terms/privacy-policy'
    },
    {
      title: 'Terms and Conditions',
      link: '/terms/terms-and-conditions'
    },
    {
      title: 'Copyright',
      link: '/terms/copyright'
    },
    {
      title: 'Disclaimer',
      link: '/terms/disclaimer'
    }
  ]
}

export interface EducationItem {
  institution: string
  website: string
  programme: string
  period: string
  logo: string
  logoAlt: string
}

/** Education history shown on the homepage, newest entry first. */
export const education: EducationItem[] = [
  {
    institution: 'Northwestern Polytechnical University',
    website: 'https://www.nwpu.edu.cn/',
    programme: 'Undergraduate, Electronic Information Engineering, School of Electronics and Information',
    period: 'September 2024 – Present',
    logo: '/src/assets/nwpu-logo.png',
    logoAlt: 'Northwestern Polytechnical University logo'
  }
]

export interface HonorBase {
  title: string
  description: string
  date: string
  tags: string[]
  image: string
  imageAlt: string
  /** Set to true to prepare an item without publishing it. */
  draft?: boolean
}

/**
 * Choose exactly one destination for each honor:
 * - `slug` opens a Markdown detail page at `/honors/<slug>`.
 * - `link` opens an external record, certificate, or official announcement.
 */
export type HonorItem = HonorBase &
  (
    | {
        slug: string
        link?: never
      }
    | {
        link: string
        slug?: never
      }
  )

/**
 * Awards and honors, newest first.
 *
 * Put each award in `src/content/honors/<slug>/`, then add an item here. The homepage
 * automatically shows the first two published items; the remaining items appear at `/honors`.
 * Each honor directory contains `index.md` and any images used by that honor.
 */
export const honors: HonorItem[] = [
  {
    title: 'RoboCup China 2026',
    description: 'National Champion, Rescue Group',
    date: 'May 2026',
    tags: ['National', 'Robotics'],
    image: '/src/content/honors/robocup2026/cover.jpg',
    imageAlt: 'RoboCup China 2026 award trophies and robot',
    slug: 'robocup2026'
  },

  {
    title: 'Advanced Robot and Simulation Technology Competition',
    description: 'First Prize, National - August 2025\nThird Prize, National - August 2026',
    date: 'August 2025 , August 2026',
    tags: ['National', 'Robotics'],
    image: '/src/content/honors/rst/cover.jpg',
    imageAlt: 'RoboCup China 2026 award trophies and robot',
    slug: 'rst'
  }
]

export interface ProjectImage {
  src: string
  alt: string
}

export interface ProjectLink {
  label: string
  href: string
  icon: IconsType
}

export interface ProjectItem {
  title: string
  description: string
  period: string
  tags: string[]
  /** Exactly four images, displayed as a 2 × 2 collage on each project card. */
  images: [ProjectImage, ProjectImage, ProjectImage, ProjectImage]
  /** Optional external destinations shown as icon buttons below the project description. */
  links?: ProjectLink[]
  /** Matches src/content/projects/<slug>/index.md. */
  slug: string
  draft?: boolean
}

/**
 * Projects shown on the homepage and at /projects, newest first.
 *
 * Store every project's Markdown/MDX file and images in src/content/projects/<slug>/.
 * Add one object per project; its four `images` entries form the card collage.
 */
export const projects: ProjectItem[] = [
  {
    title: 'Rescue Team - NPU Dancing Robot Base',
    description:
      'Focused on tracked vehicle structures, navigation control, and multi-sensor fusion for obstacle traversal, search and rescue, autonomous mapping, and target localization in complex environments. My contribution: developed the complete vehicle electronic control system.',
    period: '2026',
    tags: ['Robotics', 'Embedded'],
    images: [
      { src: '/src/content/projects/rescue/assets/01.jpg', alt: 'Project image one' },
      { src: '/src/content/projects/rescue/assets/02.png', alt: 'Project image two' },
      { src: '/src/content/projects/rescue/assets/03.png', alt: 'Project image three' },
      { src: '/src/content/projects/rescue/assets/04.jpg', alt: 'Project image four' }
    ],
    slug: 'rescue',
    links: [
      { label: 'Organization website', href: 'https://dance-robot-base.github.io/', icon: 'link' },
    ]
  }
]

/**
 * Homepage profile card. Replace the placeholder values below with your own details.
 * The card is rendered at the top of the homepage.
 */
export const profile = {
  name: '朱泽',
  englishName: 'zhuze',
  headline: 'School of Electronics And Information, Northwestern Polytechnical University',
  availability: 'Open to collaboration, research, or internship opportunities',
  location: 'Xi\'an, ShaanXi, China',
  email: 'zzzhuze@mail.nwpu.edu.cn',
  cvUrl: '/files/cv-zh-CN.pdf',
  socialLinks: [
    { label: 'GitHub', icon: 'github', href: 'https://github.com/zz-unofficial' },
    { label: 'Bilibili', icon: 'bilibili', href: 'https://space.bilibili.com/3546702879394547' }
  ] as const,
  skillGroups: [
    { title: 'Languages', skills: ['C++', 'Python'] },
    { title: 'Focus', skills: ['Computer Vision', 'Robotics'] },
    { title: 'Interests', skills: ['Computer Vision', 'Embedded Systems'] }
  ]
}

const config = { ...theme, integ } as Config
export default config
