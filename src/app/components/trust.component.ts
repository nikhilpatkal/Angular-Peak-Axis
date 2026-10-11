import { isPlatformBrowser } from '@angular/common';
import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  PLATFORM_ID,
  inject
} from '@angular/core';
import { SITE } from '../site';

@Component({ selector: 'app-trust', templateUrl: './trust.component.html', changeDetection: ChangeDetectionStrategy.OnPush })
export class TrustComponent implements AfterViewInit {
  readonly site = SITE;

  private readonly element = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly destroyRef = inject(DestroyRef);
  private animationFrame?: number;
  private observer?: IntersectionObserver;

  ngAfterViewInit(): void {
    if (!isPlatformBrowser(this.platformId)) return;

    const window = this.element.nativeElement.ownerDocument.defaultView;
    if (!window || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const counters = Array.from(this.element.nativeElement.querySelectorAll<HTMLElement>('.counter'));
    counters.forEach(counter => { counter.textContent = '0'; });

    const animate = () => {
      const duration = 1600;
      const startedAt = window.performance.now();

      const update = (now: number) => {
        const progress = Math.min((now - startedAt) / duration, 1);
        const easedProgress = 1 - Math.pow(1 - progress, 3);

        counters.forEach(counter => {
          const target = Number(counter.dataset['target']);
          counter.textContent = String(Math.round(target * easedProgress));
        });

        if (progress < 1) this.animationFrame = window.requestAnimationFrame(update);
      };

      this.animationFrame = window.requestAnimationFrame(update);
    };

    if ('IntersectionObserver' in window) {
      this.observer = new window.IntersectionObserver(entries => {
        if (!entries.some(entry => entry.isIntersecting)) return;
        this.observer?.disconnect();
        animate();
      }, { threshold: 0.25 });
      this.observer.observe(this.element.nativeElement.querySelector('section')!);
    } else {
      animate();
    }

    this.destroyRef.onDestroy(() => {
      this.observer?.disconnect();
      if (this.animationFrame !== undefined) window.cancelAnimationFrame(this.animationFrame);
    });
  }
}
