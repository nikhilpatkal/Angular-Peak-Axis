import { ChangeDetectionStrategy, Component, ElementRef, signal, viewChild } from '@angular/core';
import { SITE } from '../site';

@Component({ selector: 'app-registration', templateUrl: './registration.component.html', changeDetection: ChangeDetectionStrategy.OnPush })
export class RegistrationComponent {
  readonly site = SITE;
  readonly emailDraft = signal('');
  private readonly status = viewChild.required<ElementRef<HTMLElement>>('draftStatus');

  prepareEnquiry(event: Event, form: HTMLFormElement): void {
    event.preventDefault();
    if (!form.reportValidity()) return;
    const data = new FormData(form);
    const fields = [
      ['Full name', 'fullName'], ['Email', 'email'], ['WhatsApp', 'phone'],
      ['Location', 'location'], ['Qualification', 'qualification'],
      ['Experience', 'experience'], ['Graduation year', 'graduation'], ['Preferred role or course', 'role']
    ];
    const body = `Hello Peak Axis Global,\n\nI would like to enquire about your career and training services.\n\n${fields.map(([label, key]) => `${label}: ${String(data.get(key) ?? '').trim()}`).join('\n')}\n\nI consent to being contacted about this enquiry.\n`;
    this.emailDraft.set(`mailto:${this.site.email}?subject=${encodeURIComponent('Career / training enquiry')}&body=${encodeURIComponent(body)}`);
    // Focus the status after Angular removes the hidden attribute.
    requestAnimationFrame(() => this.status().nativeElement.focus());
  }
}
