import React from 'react';
import { Helmet } from 'react-helmet-async';

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string;
  ogType?: string;
  ogImage?: string;
  twitterCard?: 'summary' | 'summary_large_image' | 'app' | 'player';
  canonicalUrl?: string;
  structuredData?: object;
}

const SEO: React.FC<SEOProps> = ({
  title = 'Tammat - UAE Visa Services | Fast & Reliable',
  description = 'Professional UAE visa services for tourists, residents, and investors. Fast processing, expert support, and hassle-free visa solutions in Dubai and across the UAE.',
  keywords = 'UAE visa, Dubai visa, residence visa, tourist visa, investor visa, Tammat, visa services UAE, Dubai immigration, visa application, golden visa UAE',
  ogType = 'website',
  ogImage = '/tmmetLogo.png',
  twitterCard = 'summary_large_image',
  canonicalUrl,
  structuredData,
}) => {
  const currentUrl = canonicalUrl || (typeof window !== 'undefined' ? window.location.href : '');
  const siteUrl = typeof window !== 'undefined' 
    ? `${window.location.protocol}//${window.location.host}` 
    : 'https://tammat.ae';

  const fullImageUrl = ogImage.startsWith('http') 
    ? ogImage 
    : `${siteUrl}${ogImage}`;

  // Default structured data for organization
  const defaultStructuredData = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Tammat Visa Services',
    description: 'Professional UAE visa services for tourists, residents, and investors',
    url: siteUrl,
    logo: `${siteUrl}/tmmetLogo.png`,
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'Customer Service',
      areaServed: 'AE',
      availableLanguage: ['English', 'Arabic'],
    },
    address: {
      '@type': 'PostalAddress',
      addressCountry: 'AE',
      addressRegion: 'Dubai',
    },
    sameAs: [
      // Add social media links here when available
    ],
  };

  const structuredDataToUse = structuredData || defaultStructuredData;

  return (
    <>
     <Helmet>
      {/* Basic Meta Tags */}
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      <link rel="canonical" href={currentUrl} />

      {/* Open Graph Tags */}
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:type" content={ogType} />
      <meta property="og:url" content={currentUrl} />
      <meta property="og:image" content={fullImageUrl} />
      <meta property="og:site_name" content="Tammat" />
      <meta property="og:locale" content="en_US" />
      <meta property="og:locale:alternate" content="ar_AE" />

      {/* Twitter Card Tags */}
      <meta name="twitter:card" content={twitterCard} />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={fullImageUrl} />

      {/* Additional SEO Tags */}
      <meta name="robots" content="index, follow" />
      <meta name="googlebot" content="index, follow" />
      <meta name="language" content="English" />
      <meta name="revisit-after" content="7 days" />
      <meta name="author" content="Tammat" />

      {/* Structured Data */}
      <script type="application/ld+json">
        {JSON.stringify(structuredDataToUse)}
      </script>
    // </Helmet>
    </>
  );
};

export default SEO;

