import { ApplicationConfig, mergeApplicationConfig } from '@angular/core';
import { provideServerRendering, RenderMode, withRoutes } from '@angular/ssr';
import { appConfig } from './app.config';
import { COURSES } from './courses';

const serverConfig: ApplicationConfig = {
  providers: [provideServerRendering(withRoutes([
    { path: '', renderMode: RenderMode.Prerender },
    ...COURSES.map(course => ({ path: `courses/${course.id}`, renderMode: RenderMode.Prerender as const })),
    { path: '**', renderMode: RenderMode.Client }
  ]))]
};

export const config = mergeApplicationConfig(appConfig, serverConfig);
