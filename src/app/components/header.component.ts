import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { SITE } from '../site';

@Component({ selector: 'app-header', templateUrl: './header.component.html', changeDetection: ChangeDetectionStrategy.OnPush })
export class HeaderComponent {
  readonly site = SITE;
  readonly menuOpen = signal(false);
  readonly announcementVisible = signal(true);
}
