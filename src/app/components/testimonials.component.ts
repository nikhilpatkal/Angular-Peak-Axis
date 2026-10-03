import { ChangeDetectionStrategy, Component } from '@angular/core';
import { SITE } from '../site';

@Component({ selector: 'app-testimonials', templateUrl: './testimonials.component.html', changeDetection: ChangeDetectionStrategy.OnPush })
export class TestimonialsComponent { readonly site = SITE; }
