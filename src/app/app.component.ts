import { ChangeDetectionStrategy, Component } from '@angular/core';
import { HeaderComponent } from './components/header.component';
import { HeroComponent } from './components/hero.component';
import { TrustComponent } from './components/trust.component';
import { SuccessStoriesComponent } from './components/success-stories.component';
import { AboutComponent } from './components/about.component';
import { TrainingComponent } from './components/training.component';
import { ServicesComponent } from './components/services.component';
import { OpportunitiesComponent } from './components/opportunities.component';
import { RegistrationComponent } from './components/registration.component';
import { TestimonialsComponent } from './components/testimonials.component';
import { FooterComponent } from './components/footer.component';

@Component({
  selector: 'app-root',
  imports: [HeaderComponent, HeroComponent, TrustComponent, SuccessStoriesComponent, AboutComponent, TrainingComponent, ServicesComponent, OpportunitiesComponent, RegistrationComponent, TestimonialsComponent, FooterComponent],
  template: `
    <a class="skip-link" href="#main-content">Skip to main content</a>
    <app-header />
    <main id="main-content" tabindex="-1">
      @defer (hydrate never) { <app-hero /> }
      @defer (hydrate never) { <app-trust /> }
      @defer (hydrate never) { <app-success-stories /> }
      @defer (hydrate never) { <app-about /> }
      <app-training />
      @defer (hydrate never) { <app-services /> }
      <app-opportunities />
      <app-registration />
      @defer (hydrate never) { <app-testimonials /> }
    </main>
    @defer (hydrate never) { <app-footer /> }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AppComponent {}
