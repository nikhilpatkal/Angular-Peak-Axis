import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { SITE } from '../site';

@Component({ selector: 'app-opportunities', templateUrl: './opportunities.component.html', changeDetection: ChangeDetectionStrategy.OnPush })
export class OpportunitiesComponent {
  readonly site = SITE;
  readonly jobFilter = signal('all');
  setFilter(event: Event): void {
    this.jobFilter.set((event.target as HTMLSelectElement).value);
  }
}
