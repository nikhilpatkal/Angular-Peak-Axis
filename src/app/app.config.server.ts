import { ApplicationConfig, mergeApplicationConfig } from '@angular/core';
import { provideServerRendering, RenderMode, withRoutes } from '@angular/ssr';
import { provideRouter } from '@angular/router';
import { appConfig } from './app.config';

const serverConfig: ApplicationConfig = {
  // Routing is used during static generation. Browser navigation uses native anchors.
  providers: [provideRouter([]), provideServerRendering(withRoutes([{ path: '', renderMode: RenderMode.Prerender }]))]
};

export const config = mergeApplicationConfig(appConfig, serverConfig);
