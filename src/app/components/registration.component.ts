import { ChangeDetectionStrategy, Component, ElementRef, signal, viewChild } from '@angular/core';
import { SITE } from '../site';

@Component({
  selector: 'app-registration',
  templateUrl: './registration.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RegistrationComponent {
  private readonly maximumResumeSize = 3 * 1024 * 1024;
  private readonly allowedResumeTypes = new Set([
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ]);
  readonly site = SITE;
  readonly submitting = signal(false);
  readonly submitted = signal(false);
  readonly submissionError = signal('');
  private readonly status = viewChild.required<ElementRef<HTMLElement>>('submissionStatus');

  async submitEnquiry(event: Event, form: HTMLFormElement): Promise<void> {
    event.preventDefault();
    if (!form.reportValidity() || this.submitting()) return;

    this.submitting.set(true);
    this.submitted.set(false);
    this.submissionError.set('');

    const data = new FormData(form);
    const resumeInput = form.elements.namedItem('resume') as HTMLInputElement | null;
    const resume = resumeInput?.files?.[0];

    if (!resume) {
      this.showSubmissionError('Please select your resume.');
      return;
    }

    const extension = resume.name.split('.').pop()?.toLowerCase() ?? '';
    if (!['pdf', 'doc', 'docx'].includes(extension) || (resume.type && !this.allowedResumeTypes.has(resume.type))) {
      this.showSubmissionError('Resume must be a PDF, DOC or DOCX file.');
      return;
    }

    if (resume.size > this.maximumResumeSize) {
      this.showSubmissionError('Resume must not be larger than 3 MB.');
      return;
    }

    const controller = new AbortController();
    // A 3 MB file becomes roughly 4 MB after base64 encoding, so allow enough
    // time for mobile connections and the Drive write to complete.
    const timeout = window.setTimeout(() => controller.abort(), 45000);

    try {
      data.delete('resume');
      data.set('resumeName', resume.name);
      data.set('resumeMimeType', resume.type || this.mimeTypeFor(extension));
      data.set('resumeBase64', await this.readAsBase64(resume));
      data.set('source', window.location.href);

      const response = await fetch(this.site.enquiryEndpoint, {
        method: 'POST',
        body: data,
        signal: controller.signal
      });

      if (!response.ok) throw new Error('The enquiry service is currently unavailable.');
      const result = await response.json() as { success?: boolean; message?: string };
      if (!result.success) throw new Error(result.message || 'The enquiry could not be saved.');

      form.reset();
      this.submitted.set(true);
    } catch (error) {
      const message = error instanceof DOMException && error.name === 'AbortError'
        ? 'The upload timed out. Please check your connection and try again.'
        : error instanceof Error
          ? error.message
          : 'We could not submit your enquiry. Please check your connection and try again.';
      this.submissionError.set(message);
    } finally {
      window.clearTimeout(timeout);
      this.submitting.set(false);
      requestAnimationFrame(() => this.status().nativeElement.focus());
    }
  }

  private showSubmissionError(message: string): void {
    this.submitting.set(false);
    this.submissionError.set(message);
    requestAnimationFrame(() => this.status().nativeElement.focus());
  }

  private mimeTypeFor(extension: string): string {
    if (extension === 'pdf') return 'application/pdf';
    if (extension === 'doc') return 'application/msword';
    return 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
  }

  private readAsBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onerror = () => reject(new Error('We could not read the selected resume.'));
      reader.onload = () => {
        const result = String(reader.result ?? '');
        const separator = result.indexOf(',');
        if (separator < 0) reject(new Error('The selected resume could not be encoded.'));
        else resolve(result.slice(separator + 1));
      };
      reader.readAsDataURL(file);
    });
  }
}
