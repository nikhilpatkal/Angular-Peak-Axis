import { ChangeDetectionStrategy, Component } from '@angular/core';
import { SITE } from '../site';

@Component({ selector: 'app-services', templateUrl: './services.component.html', changeDetection: ChangeDetectionStrategy.OnPush })
export class ServicesComponent { readonly site = SITE; }
