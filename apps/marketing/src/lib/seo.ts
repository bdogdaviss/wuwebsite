export const siteConfig = {
  name: 'WakeUp',
  description: 'Focus better. Block distractions. Build better habits.',
  url: 'https://wakeup.app',
  ogImage: '/og.png',
}

export function createMetadata({
  title,
  description,
}: {
  title?: string
  description?: string
}) {
  const finalTitle = title ? `${title} | ${siteConfig.name}` : siteConfig.name
  const finalDescription = description || siteConfig.description

  return {
    title: finalTitle,
    description: finalDescription,
    openGraph: {
      title: finalTitle,
      description: finalDescription,
      siteName: siteConfig.name,
      images: [{ url: siteConfig.ogImage }],
    },
    twitter: {
      card: 'summary_large_image',
      title: finalTitle,
      description: finalDescription,
    },
  }
}
