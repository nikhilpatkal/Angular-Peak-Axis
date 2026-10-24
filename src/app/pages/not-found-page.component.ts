import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { SeoService } from '../seo';

@Component({
  selector: 'app-not-found-page',
  template: `
    <section class="mx-auto max-w-3xl px-4 py-24 text-center sm:px-6">
      <p class="font-heading text-6xl font-extrabold text-brand-gold">404</p>
      <h1 class="mt-4 font-heading text-3xl font-extrabold text-slate-900">Page not found</h1>
      <p class="mt-4 text-slate-600">The page may have moved or the address may be incorrect.</p>
      <a href="/" class="mt-8 inline-flex rounded-xl bg-brand-blue px-6 py-3 font-bold text-white hover:bg-brand-lightBlue">Return to the homepage</a>
    </section>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class NotFoundPageComponent {
  constructor() {
    inject(SeoService).setNotFound();
  }
}
