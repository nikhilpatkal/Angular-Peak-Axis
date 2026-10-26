import { afterNextRender, ChangeDetectionStrategy, Component, DestroyRef, ElementRef, inject, signal, viewChild } from '@angular/core';

const PLACEMENT_STUDENTS = [
  {
    name: 'Tejas Gayke',
    role: 'Clinical Research Associate',
    company: 'Synergen Bio',
    image: '/images/placed-students/tejas-gayke.webp',
    review: 'I completed the All-in-One Global PG Diploma in Clinical Research at PeakAxis Global. The training was helpful, and the guidance from experienced faculty helped me understand the industry better. I am really happy that I got placed as a Clinical Research Associate (CRA) with their placement support. Thank you to the PeakAxis Global team for guiding me and supporting me throughout this journey. I would recommend PeakAxis Global to anyone who wants to start a career in Clinical Research.'
  },
  {
    name: 'Shradha Bankar',
    role: 'Project Management',
    company: 'Klin Health Bio',
    image: '/images/placed-students/shradha-bankar.webp',
    review: 'Honestly, my experience with PeakAxis Global was good. Their team guided me properly and helped me get a job in Project Management. I am thankful to the team for their support and for helping me start my career. Thank you, PeakAxis Global!'
  },
  {
    name: 'Gauri Kohad',
    role: 'Clinical Research Coordinator',
    company: 'Synergen Bio',
    image: '/images/placed-students/gauri-kohad.webp',
    review: 'I joined PeakAxis Global for career guidance and clinical research training. As promised, they provided me with placement support, and I am happy to share that I got placed as a Clinical Research Coordinator (CRC). Thank you to the PeakAxis Global team for helping me start my career! I would highly recommend PeakAxis Global to students looking to start their careers in the clinical research industry.'
  },
  {
    name: 'Dr. Sanvedana Kambale',
    role: 'Clinical Research Associate',
    company: 'Synergen Bio',
    image: '/images/placed-students/sanvedana-kambale.webp',
    review: 'After completing my Pharm.D, I joined PeakAxis Global to build my career in Clinical Research. The experienced faculty and their guidance helped me prepare for the industry. As promised, I received placement support and got placed as a Clinical Research Associate (CRA) at Synergen Bio. I am thankful to the PeakAxis Global team for helping me achieve this career goal.'
  },
  {
    name: 'Ajay Jadhav',
    role: 'Clinical Research Associate',
    company: 'Synergen Bio',
    image: '/images/placed-students/ajay-jadhav.webp',
    review: 'I joined PeakAxis Global to build my career in Clinical Research. The team provided good guidance and helped me prepare for job opportunities. I am happy to share that I got placed as a Clinical Research Associate (CRA). Thank you to the PeakAxis Global team for their support and guidance!'
  },
  {
    name: 'Kunal Niphade',
    role: 'Clinical Research Associate',
    company: 'Synergen Bio',
    image: '/images/placed-students/kunal-niphade.webp',
    review: 'I had an excellent experience with PeakAxis Global. The team was very supportive and guided me at every step. Their guidance helped me find the right career opportunity. I am truly thankful to the entire team for their support and encouragement. I would definitely recommend PeakAxis Global to other students.'
  },
  {
    name: 'Ravindra Hiwale',
    role: 'Clinical Research Associate',
    company: 'Synergen Bio',
    image: '/images/placed-students/ravindra-hiwale.webp',
    review: 'I had tried 2-3 institutes before, but I could not get a placement. Then I joined PeakAxis Global, and they delivered on their placement promise. I am really happy with their support and guidance. Thank you to the entire PeakAxis Global team for helping me start my career!'
  },
  {
    name: 'Sanket Pharne',
    role: 'Clinical Research Associate',
    company: 'Synergen Bio',
    image: '/images/placed-students/sanket-pharne.webp',
    review: 'I had an excellent experience with PeakAxis Global. Their team guided me well and supported me throughout my job search. They kept their promise and helped me move forward in my career. I am truly thankful to the entire team for their support and guidance.'
  },
  {
    name: 'Srushti Magade',
    role: 'Project Management',
    company: 'Synergen Bio',
    image: '/images/placed-students/srushti-magade.webp',
    review: 'I had a great experience with PeakAxis Global. The team provided good guidance and support, which helped me find an opportunity in Project Management. I am thankful to the entire team for their help and for supporting me in taking this step forward in my career.'
  },
  {
    name: 'Shahu Zaware',
    role: 'Clinical Research Associate',
    company: 'Synergen Bio',
    image: '/images/placed-students/shahu-zaware.webp',
    review: 'I joined PeakAxis Global to build my career in Clinical Research. The team provided good guidance and support throughout my journey. I am happy to have secured a Clinical Research Associate (CRA) position. Thank you to the PeakAxis Global team for helping me take this step forward in my career!'
  },
  {
    name: 'Mahesh Gadekar',
    role: 'Clinical Research Associate',
    company: 'Klin Health Bio',
    image: '/images/placed-students/mahesh-gadekar.webp',
    review: 'I had a really good experience with PeakAxis Global. I joined their All-in-One Clinical Research course and found the training and guidance very helpful. The teaching quality was good, and the team supported me throughout the process. Most importantly, they kept their placement promise. I am really thankful to the entire team for helping me move forward in my career.'
  },
  {
    name: 'Laxmikant Thorat',
    role: 'Clinical Research Associate',
    company: 'Klin Health Bio',
    image: '/images/placed-students/laxmikant-thorat.webp',
    review: 'I had a great experience with PeakAxis Global. The All-in-One Clinical Research course provided good training and practical knowledge. The team guided me throughout the process and helped me find the right career opportunity. I am really thankful to the entire team for their support and guidance.'
  },
  {
    name: 'Ladlu Shaikh',
    role: 'Clinical Research Associate',
    company: 'Klin Health Bio',
    image: '/images/placed-students/ladlu-shaikh.webp',
    review: 'I had a great experience with PeakAxis Global. The training was good, and the team provided proper guidance and support. They helped me understand the industry better and prepare for job opportunities. I am thankful to the entire team for their support in helping me move forward in my career.'
  },
  {
    name: 'Saidoddin saifoddin Patel',
    role: 'Clinical Research Associate',
    company: 'Klin Health Bio',
    image: '/images/placed-students/saidoddin-saifoddin-patel.webp',
    review: 'PeakAxis Global helped me achieve my dream of becoming a CRA. The training and placement support were excellent. I am truly thankful to the team for their guidance!'
  },
  {
    name: 'Vipul Palimkar',
    role: 'Clinical Record Specialist',
    company: 'Balanced Wellbeing India Pvt. Ltd.',
    image: '/images/placed-students/vipul-palimkar.webp',
    review: 'I am truly grateful to PeakAxis Global for helping me start my career as a Clinical Record Specialist with a 3 LPA package. The team provided excellent guidance and placement support throughout the process. Special thanks to the entire team for their efforts, encouragement, and commitment to my career growth. I highly recommend PeakAxis Global to students looking for the right career opportunities!'
  },
  {
    name: 'Swapnil Kolhe',
    role: 'Clinical Record Specialist',
    company: 'Balanced Wellbeing India Pvt. Ltd.',
    image: '/images/placed-students/swapnil-kolhe.webp',
    review: "Joining PeakAxis Global was a great decision for my career. Their guidance and placement support helped me secure a Clinical Record Specialist position with a 3 LPA package. I sincerely appreciate the team's efforts, professional approach, and continuous support. Thank you, PeakAxis Global, for helping me achieve this milestone!"
  },
  {
    name: 'Sakshi Biradar',
    role: 'Clinical Record Specialist',
    company: 'Balanced Wellbeing India Pvt. Ltd.',
    image: '/images/placed-students/sakshi-biradar.webp',
    review: 'My experience with PeakAxis Global has been excellent. The team provided valuable career guidance and professional support throughout the process. I truly appreciate their efforts in helping me move forward in my career. Thank you to the entire PeakAxis Global team for your support and encouragement.'
  },
  {
    name: 'Shweta Mali',
    role: 'Medical Record Specialist',
    company: 'Balanced Wellbeing India Pvt. Ltd.',
    image: '/images/placed-students/shweta-mali.webp',
    review: 'Thank you, PeakAxis Global, for your valuable guidance and support. Your encouragement has helped me move forward with confidence in my career. Truly grateful to the entire team!'
  },
  {
    name: 'Nikita Kalskar',
    role: 'Medical Record Specialist',
    company: 'Balanced Wellbeing India Pvt. Ltd.',
    image: '/images/placed-students/nikita-kalskar.webp',
    review: 'Joining PeakAxis Global was a great learning experience. The classes were helpful, and the team provided good guidance and support. Thank you for helping me move forward in my career!'
  },
  {
    name: 'Amol Khade',
    role: 'Medical Coder',
    company: 'Optum',
    image: '/images/placed-students/amol-khade.webp',
    review: 'My experience with PeakAxis Global was really good. They provided proper training and prepared me well for interviews. The team focused on building my confidence and improving my interview skills. I am thankful for their guidance and support in helping me start my career as a Medical Coder.'
  },
  {
    name: 'Viraj Mhatre',
    role: 'Clinical Records',
    company: 'Balanced Wellbeing India Pvt. Ltd.',
    image: '/images/placed-students/viraj-mhatre.webp',
    review: 'Joining PeakAxis Global was a great decision. The training was helpful, and the team provided proper guidance and interview preparation. I am thankful for their support and for helping me move forward in my career.'
  },
  {
    name: 'Varad Koli',
    role: 'Clinical Records',
    company: 'Balanced Wellbeing India Pvt. Ltd.',
    image: '/images/placed-students/varad-koli.webp',
    review: 'Joining PeakAxis Global was a great experience. The training was helpful, and the team provided proper guidance and interview preparation. I am grateful for their support and efforts in helping me move forward in my career. Thank you, PeakAxis Global!'
  },
  {
    name: 'Aman Naikwadi',
    role: 'Clinical Research Associate',
    company: 'Klin Health Bio',
    image: '/images/placed-students/aman-naikwadi.webp',
    review: 'My experience with PeakAxis Global was very good. The training was useful, and the team guided me properly throughout the process. Their support helped me gain confidence and prepare for better career opportunities. Thank you to the entire team for your guidance and support!'
  }
] as const;

@Component({
  selector: 'app-placement-students',
  templateUrl: './placement-students.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PlacementStudentsComponent {
  readonly activeStudent = signal(0);
  readonly expandedStudent = signal<string | null>(null);
  readonly students = PLACEMENT_STUDENTS;

  private readonly track = viewChild.required<ElementRef<HTMLDivElement>>('studentsTrack');
  private readonly destroyRef = inject(DestroyRef);
  private timer: ReturnType<typeof setInterval> | undefined;
  private reducedMotion = false;
  private isHovered = false;
  private isFocused = false;
  private isPointerDown = false;

  constructor() {
    afterNextRender(() => {
      this.reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      this.startAutoScroll();
      this.destroyRef.onDestroy(() => this.stopAutoScroll());
    });
  }

  previousStudent(): void {
    this.goToStudent(this.activeStudent() - 1);
  }

  nextStudent(): void {
    this.goToStudent(this.activeStudent() + 1);
  }

  toggleReview(name: string): void {
    this.expandedStudent.update(current => current === name ? null : name);
  }

  goToStudent(index: number): void {
    const normalizedIndex = (index + this.students.length) % this.students.length;
    const card = this.track().nativeElement.children.item(normalizedIndex) as HTMLElement | null;
    if (!card) return;

    this.activeStudent.set(normalizedIndex);
    this.track().nativeElement.scrollTo({
      left: card.offsetLeft - this.track().nativeElement.offsetLeft,
      behavior: this.reducedMotion || index < 0 || index >= this.students.length ? 'auto' : 'smooth'
    });
  }

  updateActiveStudent(): void {
    const track = this.track().nativeElement;
    const cards = Array.from(track.children) as HTMLElement[];
    if (!cards.length) return;

    const activeIndex = cards.reduce((closestIndex, card, index) => {
      const closestCard = cards[closestIndex];
      const distance = Math.abs(card.offsetLeft - track.offsetLeft - track.scrollLeft);
      const closestDistance = Math.abs(closestCard.offsetLeft - track.offsetLeft - track.scrollLeft);
      return distance < closestDistance ? index : closestIndex;
    }, 0);
    this.activeStudent.set(activeIndex);
  }

  setHovered(isHovered: boolean): void {
    this.isHovered = isHovered;
    this.syncAutoScroll();
  }

  setFocused(isFocused: boolean): void {
    this.isFocused = isFocused;
    this.syncAutoScroll();
  }

  setPointerDown(isPointerDown: boolean): void {
    this.isPointerDown = isPointerDown;
    this.syncAutoScroll();
  }

  onFocusOut(event: FocusEvent): void {
    const nextTarget = event.relatedTarget;
    if (!(nextTarget instanceof Node) || !this.track().nativeElement.parentElement?.contains(nextTarget)) {
      this.setFocused(false);
    }
  }

  private startAutoScroll(): void {
    if (this.reducedMotion || this.timer) return;
    this.timer = setInterval(() => this.nextStudent(), 3000);
  }

  private syncAutoScroll(): void {
    if (this.isHovered || this.isFocused || this.isPointerDown) {
      this.stopAutoScroll();
      return;
    }
    this.startAutoScroll();
  }

  private stopAutoScroll(): void {
    if (!this.timer) return;
    clearInterval(this.timer);
    this.timer = undefined;
  }
}
