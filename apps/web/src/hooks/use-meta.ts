import { company } from '@platform/shared';
import { useEffect } from 'react';

export function useMeta(title: string, description: string, noIndex = false) {
  useEffect(() => {
    document.title = `${title} | ${company.name}`;
    upsertMeta('name', 'description', description);
    upsertMeta('property', 'og:title', `${title} | ${company.name}`);
    upsertMeta('property', 'og:description', description);
    upsertMeta('property', 'og:type', 'website');
    upsertMeta('name', 'robots', noIndex ? 'noindex,nofollow' : 'index,follow');
    const canonical =
      document.querySelector<HTMLLinkElement>('link[rel="canonical"]') ??
      document.createElement('link');
    canonical.rel = 'canonical';
    canonical.href = `${company.websiteUrl}${window.location.pathname}`;
    if (!canonical.parentNode) document.head.appendChild(canonical);
  }, [description, noIndex, title]);
}

function upsertMeta(attribute: 'name' | 'property', key: string, content: string) {
  const selector = `meta[${attribute}="${key}"]`;
  const element =
    document.querySelector<HTMLMetaElement>(selector) ?? document.createElement('meta');
  element.setAttribute(attribute, key);
  element.content = content;
  if (!element.parentNode) document.head.appendChild(element);
}
