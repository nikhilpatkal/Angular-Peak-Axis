import { ChangeDetectionStrategy, Component, ElementRef, computed, signal, viewChild } from '@angular/core';
import { COURSES } from '../courses';
import { SITE } from '../site';

@Component({ selector: 'app-training', templateUrl: './training.component.html', changeDetection: ChangeDetectionStrategy.OnPush })
export class TrainingComponent {
  readonly site = SITE;
  readonly courses = COURSES;
  readonly categories: readonly string[] = ['All', ...new Set(COURSES.map(course => course.category))];
  readonly activeCategory = signal('All');
  readonly filteredCourses = computed(() => {
    const category = this.activeCategory();
    return category === 'All' ? COURSES : COURSES.filter(course => course.category === category);
  });
  readonly selectedCourse = signal<(typeof COURSES)[number] | null>(null);
  private readonly coursesRail = viewChild.required<ElementRef<HTMLDivElement>>('coursesRail');
  private readonly dialog = viewChild.required<ElementRef<HTMLDialogElement>>('syllabusDialog');

  openSyllabus(id: string): void {
    this.selectedCourse.set(COURSES.find(course => course.id === id) ?? null);
    this.dialog().nativeElement.showModal();
  }

  setCategory(category: string): void {
    this.activeCategory.set(category);
    this.coursesRail().nativeElement.scrollTo({ left: 0, behavior: 'smooth' });
  }

  scrollCourses(direction: -1 | 1): void {
    const rail = this.coursesRail().nativeElement;
    rail.scrollBy({ left: direction * Math.max(rail.clientWidth * 0.85, 280), behavior: 'smooth' });
  }

  closeSyllabus(): void { this.dialog().nativeElement.close(); }

  closeOnBackdrop(event: MouseEvent): void {
    if (event.target === event.currentTarget) this.closeSyllabus();
  }
}
