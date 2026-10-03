import { ChangeDetectionStrategy, Component } from '@angular/core';
import { SITE } from '../site';

@Component({ selector: 'app-footer', templateUrl: './footer.component.html', changeDetection: ChangeDetectionStrategy.OnPush })
export class FooterComponent { readonly site = SITE; }
