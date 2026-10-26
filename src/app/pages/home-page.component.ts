import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { AboutComponent } from '../components/about.component';
import { HeroComponent } from '../components/hero.component';
import { OpportunitiesComponent } from '../components/opportunities.component';
import { PlacementStudentsComponent } from '../components/placement-students.component';
import { RegistrationComponent } from '../components/registration.component';
import { ServicesComponent } from '../components/services.component';
import { TestimonialsComponent } from '../components/testimonials.component';
import { TrainingComponent } from '../components/training.component';
import { TrustComponent } from '../components/trust.component';
import { SeoService } from '../seo';

@Component({
  selector: 'app-home-page',
  imports: [
    HeroComponent,
    TrustComponent,
    PlacementStudentsComponent,
    AboutComponent,
    TrainingComponent,
    ServicesComponent,
    OpportunitiesComponent,
    RegistrationComponent,
    TestimonialsComponent
  ],
  template: `
    @defer (hydrate never) { <app-hero /> }
    <app-trust />
    <app-placement-students />
    @defer (hydrate never) { <app-about /> }
    <app-training />
    @defer (hydrate never) { <app-services /> }
    <app-opportunities />
    <app-registration />
    @defer (hydrate never) { <app-testimonials /> }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HomePageComponent {
  constructor() {
    inject(SeoService).setHome();
  }
}
