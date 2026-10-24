import { Routes } from '@angular/router';
import { COURSES } from './courses';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/home-page.component').then(module => module.HomePageComponent)
  },
  ...COURSES.map(course => ({
    path: `courses/${course.id}`,
    data: { courseId: course.id },
    loadComponent: () => import('./pages/course-page.component').then(module => module.CoursePageComponent)
  })),
  {
    path: '**',
    loadComponent: () => import('./pages/not-found-page.component').then(module => module.NotFoundPageComponent)
  }
];
