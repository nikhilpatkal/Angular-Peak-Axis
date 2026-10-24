import { DOCUMENT } from '@angular/common';
import { inject, Injectable } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { COURSES } from './courses';
import { SITE } from './site';

const origin = new URL(SITE.url).origin;
const homeUrl = `${origin}/`;
const socialImage = `${origin}/images/social-cover.webp`;
const organizationId = `${homeUrl}#organization`;
const websiteId = `${homeUrl}#website`;

export const courseUrl = (id: string): string => `${origin}/courses/${id}/`;

export const homeStructuredData = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'EducationalOrganization',
      '@id': organizationId,
      name: SITE.name,
      url: homeUrl,
      description: SITE.description,
      email: SITE.email,
      telephone: SITE.phone,
      address: { '@type': 'PostalAddress', ...SITE.address },
      contactPoint: {
        '@type': 'ContactPoint',
        telephone: SITE.phone,
        email: SITE.email,
        contactType: 'customer service',
        availableLanguage: ['English']
      },
      sameAs: Object.values(SITE.social)
    },
    { '@type': 'WebSite', '@id': websiteId, name: SITE.shortName, url: homeUrl, publisher: { '@id': organizationId }, inLanguage: 'en-IN' },
    {
      '@type': 'WebPage',
      '@id': `${homeUrl}#webpage`,
      url: homeUrl,
      name: SITE.title,
      description: SITE.description,
      isPartOf: { '@id': websiteId },
      about: { '@id': organizationId },
      inLanguage: 'en-IN'
    },
    {
      '@type': 'ItemList',
      name: 'Training programs at Peak Axis Global',
      itemListElement: COURSES.map((course, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        item: {
          '@type': 'Course',
          '@id': `${courseUrl(course.id)}#course`,
          name: course.name,
          description: course.description,
          url: courseUrl(course.id),
          provider: { '@id': organizationId }
        }
      }))
    }
  ]
};

export function courseStructuredData(course: (typeof COURSES)[number]) {
  const url = courseUrl(course.id);
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Course',
        '@id': `${url}#course`,
        name: course.name,
        description: course.description,
        url,
        provider: { '@id': organizationId, '@type': 'EducationalOrganization', name: SITE.name, url: homeUrl }
      },
      {
        '@type': 'WebPage',
        '@id': `${url}#webpage`,
        url,
        name: `${course.shortName} Course in Pune | ${SITE.shortName}`,
        description: course.description,
        isPartOf: { '@id': websiteId },
        about: { '@id': `${url}#course` },
        inLanguage: 'en-IN'
      },
      {
        '@type': 'BreadcrumbList',
        '@id': `${url}#breadcrumb`,
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: homeUrl },
          { '@type': 'ListItem', position: 2, name: 'Training Programs', item: `${homeUrl}#training` },
          { '@type': 'ListItem', position: 3, name: course.shortName, item: url }
        ]
      }
    ]
  };
}

@Injectable({ providedIn: 'root' })
export class SeoService {
  private readonly document = inject(DOCUMENT);
  private readonly meta = inject(Meta);
  private readonly title = inject(Title);

  setHome(): void {
    this.title.setTitle(SITE.title);
    this.setCanonical(homeUrl);
    this.meta.updateTag({ name: 'description', content: SITE.description });
    this.meta.updateTag({ name: 'robots', content: 'index, follow, max-image-preview:large' });
    this.meta.updateTag({ property: 'og:url', content: homeUrl });
    this.meta.updateTag({ property: 'og:title', content: SITE.title });
    this.meta.updateTag({ property: 'og:description', content: SITE.description });
    this.meta.updateTag({ name: 'twitter:title', content: SITE.title });
    this.meta.updateTag({ name: 'twitter:description', content: SITE.description });
    this.setStructuredData(homeStructuredData);
  }

  setCourse(course: (typeof COURSES)[number]): void {
    const pageTitle = `${course.shortName} Course in Pune | ${SITE.shortName}`;
    const description = `${course.description} View the course modules and enquire with Peak Axis Global in Pune.`;
    const url = courseUrl(course.id);
    this.title.setTitle(pageTitle);
    this.setCanonical(url);
    this.meta.updateTag({ name: 'description', content: description });
    this.meta.updateTag({ name: 'robots', content: 'index, follow, max-image-preview:large' });
    this.meta.updateTag({ property: 'og:type', content: 'website' });
    this.meta.updateTag({ property: 'og:url', content: url });
    this.meta.updateTag({ property: 'og:title', content: pageTitle });
    this.meta.updateTag({ property: 'og:description', content: description });
    this.meta.updateTag({ property: 'og:image', content: socialImage });
    this.meta.updateTag({ name: 'twitter:title', content: pageTitle });
    this.meta.updateTag({ name: 'twitter:description', content: description });
    this.meta.updateTag({ name: 'twitter:image', content: socialImage });
    this.setStructuredData(courseStructuredData(course));
  }

  setNotFound(): void {
    this.title.setTitle(`Page Not Found | ${SITE.shortName}`);
    this.meta.updateTag({ name: 'robots', content: 'noindex, follow' });
    this.document.querySelector('script[data-seo-schema]')?.remove();
  }

  private setCanonical(url: string): void {
    let canonical = this.document.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (!canonical) {
      canonical = this.document.createElement('link');
      canonical.rel = 'canonical';
      this.document.head.appendChild(canonical);
    }
    canonical.href = url;
  }

  private setStructuredData(value: object): void {
    let script = this.document.querySelector<HTMLScriptElement>('script[data-seo-schema]');
    if (!script) {
      script = this.document.createElement('script');
      script.type = 'application/ld+json';
      script.setAttribute('data-seo-schema', '');
      this.document.head.appendChild(script);
    }
    script.textContent = JSON.stringify(value).replace(/</g, '\\u003c');
  }
}
