import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { COURSES } from '../courses';
import { SeoService } from '../seo';
import { SITE } from '../site';

@Component({
  selector: 'app-course-page',
  templateUrl: './course-page.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CoursePageComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly seo = inject(SeoService);
  readonly site = SITE;
  readonly course = COURSES.find(item => item.id === this.route.snapshot.data['courseId'])!;
  constructor() {
    this.seo.setCourse(this.course);
  }
}
