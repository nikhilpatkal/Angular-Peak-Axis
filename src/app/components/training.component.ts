import { ChangeDetectionStrategy, Component, ElementRef, signal, viewChild } from '@angular/core';
import { COURSES } from '../courses';
import { SITE } from '../site';

@Component({ selector: 'app-training', templateUrl: './training.component.html', changeDetection: ChangeDetectionStrategy.OnPush })
export class TrainingComponent {
  readonly site = SITE;
  readonly selectedCourse = signal<(typeof COURSES)[number] | null>(null);
  private readonly dialog = viewChild.required<ElementRef<HTMLDialogElement>>('syllabusDialog');

  openSyllabus(id: string): void {
    this.selectedCourse.set(COURSES.find(course => course.id === id) ?? null);
    this.dialog().nativeElement.showModal();
  }

  closeSyllabus(): void { this.dialog().nativeElement.close(); }

  closeOnBackdrop(event: MouseEvent): void {
    if (event.target === event.currentTarget) this.closeSyllabus();
  }
}
