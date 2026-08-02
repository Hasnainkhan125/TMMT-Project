// config/packageDocs.js
//
// One source of truth per package. Structured to match the richness of the
// Goodhand service JSON: each package carries inside/outside pricing, the
// bundled sub-services that make up the package, and the document checklist.
//
// To add a package: copy a block, change the slug key (PK1, PK3...), fill it in.
// docKey is the stable id stored in the DB. label is what the user sees.
// `hint` shows as a small helper line under the doc row (optional).

export const PACKAGE_CONFIG = {
  PK5: {
    name: 'Spouse Visa',
    tagline: 'Sponsor your husband or wife for UAE residency',
    accent: '#C97A5C', // warm coral — matches Tmmt service palette
    durationLabel: '2-Year Residence Visa',
    processingTime: '1-3 weeks',
    // What the package bundles, mirrors packageOptions in the JSON
    includedServices: [
      'New Entry Permit',
      'Medical Fitness Test',
      'Emirates ID',
      'Visa Stamping',
    ],
    // Price differs by where the applicant is. Captured from JSON priceData / packageOptions.
    pricing: {
      outside: { amount: 1653.55, label: 'Outside UAE' },
      inside: { amount: 1990.5, label: 'Inside UAE' }, // change-status adds cost
    },
    eligibility: 'Minimum salary AED 4,000 + attested marriage certificate',
    docs: [
      { docKey: 'sponsor_emirates_id', label: "Sponsor's Emirates ID", required: true },
      { docKey: 'sponsor_passport', label: "Sponsor's Passport Copy", required: true },
      { docKey: 'sponsor_visa', label: "Sponsor's UAE Visa Copy", required: true },
      { docKey: 'salary_certificate', label: 'Salary Certificate / Labour Contract', required: true, hint: 'Free zone employees: salary certificate. Mainland: labour contract.' },
      { docKey: 'applicant_passport', label: "Spouse's Passport Copy", required: true, hint: 'Valid for at least 6 months.' },
      { docKey: 'applicant_photo', label: "Spouse's Photo", required: true, hint: 'White background, passport size.' },
      { docKey: 'marriage_certificate', label: 'Attested Marriage Certificate', required: true, hint: 'Attested by your home country + UAE MOFA.' },
    ],
  },

  PK1: {
    name: 'Golden Visa',
    tagline: '10-year residency for investors, talent & professionals',
    accent: '#BA7517', // amber
    durationLabel: '10-Year Residence Visa',
    processingTime: '2-4 weeks',
    includedServices: ['Entry Permit', 'VIP Medical', 'Emirates ID', 'Visa Stamping'],
    pricing: {
      outside: { amount: 4440.55, label: 'Outside UAE' },
      inside: { amount: 4440.55, label: 'Inside UAE' },
    },
    eligibility: 'Investors, doctors, engineers, scientists, top students, creatives',
    docs: [
      { docKey: 'passport_copy', label: 'Passport Copy', required: true },
      { docKey: 'photo', label: 'Passport-Size Photo', required: true },
      { docKey: 'emirates_id', label: 'Emirates ID (if resident)', required: false },
      { docKey: 'proof_of_eligibility', label: 'Proof of Qualification / Eligibility', required: true, hint: 'Degree, investment proof, or accreditation depending on category.' },
    ],
  },

  PK3: {
    name: 'Investor Visa',
    tagline: 'Residency for business owners & property investors',
    accent: '#5E9FB3', // teal
    durationLabel: '2-Year Residence Visa',
    processingTime: '2-3 weeks',
    includedServices: ['Entry Permit', 'Change Status', 'Medical Test', 'Emirates ID', 'Visa Stamping'],
    pricing: {
      outside: { amount: 3054.55, label: 'Outside UAE' },
      inside: { amount: 3054.55, label: 'Inside UAE' },
    },
    eligibility: 'Valid trade license or property investment in the UAE',
    docs: [
      { docKey: 'passport_copy', label: 'Passport Copy', required: true },
      { docKey: 'photo', label: 'Passport-Size Photo', required: true },
      { docKey: 'trade_license', label: 'Trade License', required: true },
      { docKey: 'moa', label: 'Memorandum of Association (MOA)', required: true },
      { docKey: 'investment_proof', label: 'Proof of Investment / Title Deed', required: false },
    ],
  },

  PK4: {
    name: 'Parents Visa',
    tagline: 'Bring your parents to live with you in the UAE',
    accent: '#A56A75', // rose
    durationLabel: '1-Year Residence Visa',
    processingTime: '2-3 weeks',
    includedServices: ['Entry Permit', 'Change Status', 'Medical Test', 'Emirates ID', 'Visa Stamping'],
    pricing: {
      outside: { amount: 7787.55, label: 'Outside UAE' },
      inside: { amount: 7787.55, label: 'Inside UAE' },
    },
    eligibility: 'Higher salary threshold + medical insurance + deposit may apply',
    docs: [
      { docKey: 'sponsor_emirates_id', label: "Sponsor's Emirates ID", required: true },
      { docKey: 'sponsor_passport', label: "Sponsor's Passport Copy", required: true },
      { docKey: 'salary_certificate', label: 'Salary Certificate', required: true },
      { docKey: 'parent_passport', label: "Parent's Passport Copy", required: true },
      { docKey: 'parent_photo', label: "Parent's Photo", required: true },
      { docKey: 'relationship_proof', label: 'Proof of Relationship', required: true, hint: 'Birth certificate or family book, attested.' },
    ],
  },

  PK6: {
    name: 'Employment Visa',
    tagline: 'Work visa for professionals with a UAE job offer',
    accent: '#3B6D11', // green
    durationLabel: '2-Year Residence Visa',
    processingTime: '1-3 weeks',
    includedServices: ['Job Offer', 'Entry Permit', 'Change Status', 'Medical Test', 'Emirates ID', 'Visa Stamping'],
    pricing: {
      outside: { amount: 2335.32, label: 'Outside UAE' },
      inside: { amount: 2335.32, label: 'Inside UAE' },
    },
    eligibility: 'Valid job offer from a UAE company + MOHRE work permit',
    docs: [
      { docKey: 'passport_copy', label: 'Passport Copy', required: true },
      { docKey: 'photo', label: 'Passport-Size Photo', required: true },
      { docKey: 'employment_contract', label: 'Employment Contract / Offer Letter', required: true },
      { docKey: 'education_certificate', label: 'Educational Certificates', required: false, hint: 'Attested, if required for the role.' },
    ],
  },

  PK7: {
    name: 'Children Visa',
    tagline: 'Sponsor your child and keep your family together',
    accent: '#534AB7', // purple
    durationLabel: '2-Year Residence Visa',
    processingTime: '1-3 weeks',
    includedServices: ['Entry Permit', 'Change Status', 'Medical Test', 'Emirates ID', 'Visa Stamping'],
    pricing: {
      outside: { amount: 1233.55, label: 'Outside UAE' },
      inside: { amount: 1233.55, label: 'Inside UAE' },
    },
    eligibility: 'Sponsor must meet salary threshold + valid residency',
    docs: [
      { docKey: 'sponsor_emirates_id', label: "Sponsor's Emirates ID", required: true },
      { docKey: 'sponsor_passport', label: "Sponsor's Passport Copy", required: true },
      { docKey: 'birth_certificate', label: "Child's Birth Certificate", required: true, hint: 'Attested.' },
      { docKey: 'child_passport', label: "Child's Passport Copy", required: true },
      { docKey: 'child_photo', label: "Child's Photo", required: true },
    ],
  },

  PK8: {
    name: 'New Born Baby Visa',
    tagline: 'Residency for newborns to resident parents',
    accent: '#993556', // pink
    durationLabel: '2-Year Residence Visa',
    processingTime: '1-2 weeks',
    includedServices: ['Sponsor File', 'Emirates ID', 'Visa Stamping'],
    pricing: {
      outside: { amount: 894.55, label: 'Standard' },
      inside: { amount: 894.55, label: 'Standard' },
    },
    eligibility: 'Born in the UAE to resident parents — apply within 120 days',
    docs: [
      { docKey: 'sponsor_emirates_id', label: "Sponsor's Emirates ID", required: true },
      { docKey: 'birth_certificate', label: 'Birth Certificate', required: true, hint: 'Issued in the UAE.' },
      { docKey: 'baby_passport', label: "Baby's Passport Copy", required: true },
    ],
  },
};

// Backwards-compatible export so existing imports of PACKAGE_DOCS keep working.
export const PACKAGE_DOCS = Object.fromEntries(
  Object.entries(PACKAGE_CONFIG).map(([slug, cfg]) => [slug, { name: cfg.name, docs: cfg.docs }])
);