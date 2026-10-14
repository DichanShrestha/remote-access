import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/dashboard', '/onboarding', '/editor', '/editor-preview', '/template-preview', '/api'],
    },
    sitemap: 'https://pageory.app/sitemap.xml',
  };
}
