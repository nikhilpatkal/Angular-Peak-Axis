export const COURSES = [
  {
    id: 'clinical-research', name: 'Clinical Research', duration: '3–6 months',
    description: 'Clinical research training covering clinical trials, pharmacovigilance, clinical data management and AI in pharma clinical research.',
    topics: ['Clinical Trial Management (CTM)', 'Pharmacovigilance (PV)', 'Clinical Data Management', 'AI in Pharma Clinical Research']
  },
  {
    id: 'pharmacovigilance', name: 'Pharmacovigilance', duration: '2–3 months',
    description: 'Pharmacovigilance training covering adverse drug reactions, case processing, MedDRA coding, Argus Safety and aggregate reporting.',
    topics: ['ADR & Case Processing', 'MedDRA Coding & Argus Safety', 'Aggregate Reporting (PSUR)', 'AI in Pharmacovigilance']
  },
  {
    id: 'medical-coding', name: 'Medical Coding', duration: '3 months',
    description: 'Medical coding training and CPC exam preparation covering ICD-10, CPT, HCPCS, medical billing, revenue cycle management and anatomy.',
    topics: ['ICD-10, CPT, HCPCS Systems', 'Medical Billing & RCM', 'AR Calling / Analyst Training', 'Anatomy & Physiology Basics']
  }
] as const;
