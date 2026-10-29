import React from 'react';
import { Helmet as HelmetBase } from 'react-helmet-async';
const Helmet = HelmetBase as React.ComponentType<React.PropsWithChildren<{ [key: string]: any }>>;

interface SEOProps {
  title: string;
  description?: string;
}

export const SEO: React.FC<SEOProps> = ({ title, description }) => {
  const defaultDescription = "Favilla Candle - A luxury e-commerce experience for hand-poured sculptural candles. Experience scent orchestrated.";
  const metaDescription = description || defaultDescription;
  const fullTitle = `${title} | Favilla`;

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={metaDescription} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={metaDescription} />
      <meta name="twitter:card" content="summary_large_image" />
    </Helmet>
  );
};