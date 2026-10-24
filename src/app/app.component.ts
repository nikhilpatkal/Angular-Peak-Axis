import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from './components/header.component';
import { FooterComponent } from './components/footer.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, HeaderComponent, FooterComponent],
  template: `
    <a class="skip-link" href="#main-content">Skip to main content</a>
    <app-header />
    <main id="main-content" tabindex="-1">
      <router-outlet />
    </main>
    @defer (hydrate never) { <app-footer /> }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AppComponent {}
