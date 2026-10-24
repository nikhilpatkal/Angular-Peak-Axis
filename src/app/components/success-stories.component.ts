import { afterNextRender, ChangeDetectionStrategy, Component, DestroyRef, ElementRef, inject, signal, viewChild } from '@angular/core';
import { SITE } from '../site';

@Component({
  selector: 'app-success-stories',
  templateUrl: './success-stories.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SuccessStoriesComponent {
  readonly site = SITE;
  readonly activeStory = signal(0);
  readonly stories = [
    {
      name: 'Clinical Research',
      role: 'Career Pathway',
      company: 'Clinical operations',
      package: 'View course',
      image: '/images/photo-1573496359142-b8d87734a5a2.webp'
    },
    {
      name: 'Medical Coding',
      role: 'Career Pathway',
      company: 'Healthcare documentation',
      package: 'View course',
      image: '/images/photo-1506277886164-e25aa3f4ef7f.webp'
    },
    {
      name: 'Regulatory Affairs',
      role: 'Career Pathway',
      company: 'Regulatory operations',
      package: 'View course',
      image: '/images/photo-1580489944761-15a19d654956.webp'
    },
    {
      name: 'Pharmacovigilance',
      role: 'Career Pathway',
      company: 'Drug safety',
      package: 'View course',
      image: '/images/photo-1519085360753-af0119f7cbe7.webp'
    }
  ] as const;

  private readonly track = viewChild.required<ElementRef<HTMLDivElement>>('storiesTrack');
  private readonly destroyRef = inject(DestroyRef);
  private timer: ReturnType<typeof setInterval> | undefined;
  private reducedMotion = false;

  constructor() {
    afterNextRender(() => {
      this.reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      this.startAutoScroll();
      this.destroyRef.onDestroy(() => this.stopAutoScroll());
    });
  }

  previousStory(): void {
    this.goToStory(this.activeStory() - 1);
  }

  nextStory(): void {
    this.goToStory(this.activeStory() + 1);
  }

  goToStory(index: number): void {
    const normalizedIndex = (index + this.stories.length) % this.stories.length;
    const card = this.track().nativeElement.children.item(normalizedIndex) as HTMLElement | null;
    if (!card) return;

    this.activeStory.set(normalizedIndex);
    this.track().nativeElement.scrollTo({
      left: card.offsetLeft - this.track().nativeElement.offsetLeft,
      behavior: this.reducedMotion ? 'auto' : 'smooth'
    });
  }

  pauseAutoScroll(): void {
    this.stopAutoScroll();
  }

  resumeAutoScroll(): void {
    this.startAutoScroll();
  }

  private startAutoScroll(): void {
    if (this.reducedMotion || this.timer) return;
    this.timer = setInterval(() => this.nextStory(), 3000);
  }

  private stopAutoScroll(): void {
    if (!this.timer) return;
    clearInterval(this.timer);
    this.timer = undefined;
  }
}
