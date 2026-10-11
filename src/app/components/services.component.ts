import { ChangeDetectionStrategy, Component } from '@angular/core';
import { SITE } from '../site';

@Component({ selector: 'app-services', templateUrl: './services.component.html', changeDetection: ChangeDetectionStrategy.OnPush })
export class ServicesComponent {
  readonly site = SITE;

  readonly publicationGroups = [
    {
      title: 'Writing Services',
      icon: 'solid-pen-nib',
      description: 'Research-led academic, medical and technical writing support.',
      items: [
        'Thesis Writing Assistance',
        'Dissertation Writing',
        'Synopsis Preparation',
        'Review Article Writing',
        'Research Article Writing',
        'Literature Review Writing',
        'Case Study Writing',
        'SOP & Technical Documentation',
        'Medical & Scientific Writing'
      ]
    },
    {
      title: 'Manuscript Support',
      icon: 'solid-file-alt',
      description: 'Editorial support to prepare a clear, submission-ready manuscript.',
      items: [
        'Manuscript Formatting',
        'Journal Selection Assistance',
        'Plagiarism Reduction',
        'Reference & Citation Formatting',
        'Grammar & Language Editing',
        'Peer Review Support'
      ]
    },
    {
      title: 'Book Publication Services',
      icon: 'solid-graduation-cap',
      description: 'End-to-end assistance for print and digital academic publishing.',
      items: [
        'ISBN Book Publication',
        'National & International Book Publication',
        'Chapter Writing & Editing',
        'E-Book Publication',
        'Academic Book Designing',
        'Cover Page Designing'
      ]
    },
    {
      title: 'Patent & Intellectual Property',
      icon: 'solid-certificate',
      description: 'Structured documentation and filing support for original work.',
      items: [
        'Patent Writing Assistance',
        'Patent Filing Support',
        'Copyright Registration',
        'Trademark Assistance',
        'Innovation Documentation',
        'Research Commercialization Support'
      ]
    }
  ] as const;
}
