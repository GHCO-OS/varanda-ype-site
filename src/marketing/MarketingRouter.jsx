import React, { useEffect } from 'react';
import { validIntent } from '../../shared/marketing-config.js';
import { initMarketingLanding } from './client.js';
import { marketingMarkup } from './page.js';

export default function MarketingRouter({ platform = null }) {
  const intent = typeof window === 'undefined' ? 'default' : validIntent(new URLSearchParams(window.location.search).get('intent'));
  useEffect(() => { initMarketingLanding(window); }, [platform, intent]);
  return <><link rel="stylesheet" href={import.meta.env.DEV ? '/src/marketing/landing.css' : '/marketing-assets/landing.css'} /><link rel="stylesheet" href={import.meta.env.DEV ? '/src/marketing/accessibility.css' : '/marketing-assets/accessibility.css'} /><div dangerouslySetInnerHTML={{ __html: marketingMarkup(platform, intent) }} /></>;
}
