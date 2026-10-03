import { ChangeDetectionStrategy, Component } from '@angular/core';
import { SITE } from '../site';

@Component({ selector: 'app-hero', templateUrl: './hero.component.html', changeDetection: ChangeDetectionStrategy.OnPush })
export class HeroComponent { readonly site = SITE; }
