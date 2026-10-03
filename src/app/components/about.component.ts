import { ChangeDetectionStrategy, Component } from '@angular/core';
import { SITE } from '../site';

@Component({ selector: 'app-about', templateUrl: './about.component.html', changeDetection: ChangeDetectionStrategy.OnPush })
export class AboutComponent { readonly site = SITE; }
