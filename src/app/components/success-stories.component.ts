import { ChangeDetectionStrategy, Component } from '@angular/core';
import { SITE } from '../site';

@Component({ selector: 'app-success-stories', templateUrl: './success-stories.component.html', changeDetection: ChangeDetectionStrategy.OnPush })
export class SuccessStoriesComponent { readonly site = SITE; }
