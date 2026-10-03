import { ChangeDetectionStrategy, Component } from '@angular/core';
import { SITE } from '../site';

@Component({ selector: 'app-trust', templateUrl: './trust.component.html', changeDetection: ChangeDetectionStrategy.OnPush })
export class TrustComponent { readonly site = SITE; }
