// ──────────────────────────────────────────────────────────────────────────────
// Schema.org JSON-LD generators
//
// No Next.js dependency — returns plain objects suitable for
// JSON.stringify() inside a <script type="application/ld+json"> tag.
//
// All functions accept a SiteConfig so they stay decoupled from any
// particular brand or deployment.
// ──────────────────────────────────────────────────────────────────────────────

// ---------------------------------------------------------------------------
// Shared types
// ---------------------------------------------------------------------------

export interface SiteConfig {
  siteName: string;
  siteUrl: string;
}

export interface BreadcrumbItem {
  name: string;
  url: string;
}

export interface ArticleInput {
  title: string;
  excerpt: string;
  url: string;
  imageUrl?: string;
  authorName: string;
  datePublished: string;
  dateModified?: string;
  tags?: string[];
}

export interface FAQItem {
  question: string;
  answer: string;
}

// ---------------------------------------------------------------------------
// Generators
// ---------------------------------------------------------------------------

/**
 * schema.org/Organization — for the marketplace itself.
 */
export function generateOrganizationJsonLd(
  config: SiteConfig & { description: string; logoUrl?: string },
): Record<string, unknown> {
  const schema: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: config.siteName,
    url: config.siteUrl,
    description: config.description,
  };

  if (config.logoUrl) {
    schema.logo = config.logoUrl;
  }

  return schema;
}

/**
 * schema.org/BreadcrumbList
 */
export function generateBreadcrumbJsonLd(
  items: BreadcrumbItem[],
): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

/**
 * schema.org/Article — for blog posts.
 */
export function generateArticleJsonLd(
  article: ArticleInput,
  config: SiteConfig,
): Record<string, unknown> {
  const schema: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: article.title,
    description: article.excerpt,
    url: article.url,
    author: {
      '@type': 'Person',
      name: article.authorName,
    },
    publisher: {
      '@type': 'Organization',
      name: config.siteName,
      url: config.siteUrl,
    },
    datePublished: article.datePublished,
  };

  if (article.dateModified) {
    schema.dateModified = article.dateModified;
  }

  if (article.imageUrl) {
    schema.image = article.imageUrl;
  }

  if (article.tags?.length) {
    schema.keywords = article.tags.join(', ');
  }

  return schema;
}

/**
 * schema.org/FAQPage
 */
export function generateFAQJsonLd(
  items: FAQItem[],
): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.answer,
      },
    })),
  };
}
