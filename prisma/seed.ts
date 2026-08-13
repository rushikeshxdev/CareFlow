import 'dotenv/config';
import { PrismaClient, UserRole, ProviderType, ServiceType, SlotStatus } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting CareFlow Database Seeder...');

  // Clean existing data
  await prisma.auditLog.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.aIMessage.deleteMany();
  await prisma.aIConversation.deleteMany();
  await prisma.careEvent.deleteMany();
  await prisma.careJourney.deleteMany();
  await prisma.appointment.deleteMany();
  await prisma.availabilitySlot.deleteMany();
  await prisma.providerService.deleteMany();
  await prisma.providerSpecialty.deleteMany();
  await prisma.service.deleteMany();
  await prisma.specialty.deleteMany();
  await prisma.provider.deleteMany();
  await prisma.patient.deleteMany();
  await prisma.user.deleteMany();

  console.log('🧹 Cleaned existing database tables');

  // 1. Create Demo Users & Patients
  const demoPatientUser = await prisma.user.create({
    data: {
      name: 'Sarah Jenkins',
      email: 'sarah.jenkins@example.com',
      passwordHash: '$2b$10$e7xX3N8...dummyhashforprototype',
      role: UserRole.PATIENT,
      patient: {
        create: {
          dateOfBirth: new Date('1992-05-14'),
          gender: 'Female',
          allergies: 'Penicillin',
          existingConditions: 'Mild Asthma',
        },
      },
    },
    include: { patient: true },
  });

  console.log(`👤 Created Demo Patient: ${demoPatientUser.name}`);

  // 2. Create Specialties
  const specialtiesData = [
    { name: 'Cardiology', slug: 'cardiology', description: 'Heart and cardiovascular care', icon: 'heart' },
    { name: 'General Medicine', slug: 'general-medicine', description: 'Primary health, fever, routine care', icon: 'activity' },
    { name: 'Orthopedics', slug: 'orthopedics', description: 'Bone, joint, and spine care', icon: 'bone' },
    { name: 'Neurology', slug: 'neurology', description: 'Brain, nervous system, and headache care', icon: 'brain' },
    { name: 'Pulmonology', slug: 'pulmonology', description: 'Lungs, respiratory, and asthma care', icon: 'wind' },
    { name: 'Gynecology', slug: 'gynecology', description: 'Women health and maternity care', icon: 'user' },
    { name: 'Pediatrics', slug: 'pediatrics', description: 'Child and infant healthcare', icon: 'smile' },
    { name: 'Dermatology', slug: 'dermatology', description: 'Skin, hair, and cosmetic care', icon: 'sun' },
  ];

  const specialtiesMap = new Map<string, string>();
  for (const s of specialtiesData) {
    const created = await prisma.specialty.create({ data: s });
    specialtiesMap.set(s.slug, created.id);
  }
  console.log(`🩺 Created ${specialtiesMap.size} Medical Specialties`);

  // 3. Create Services
  const servicesData = [
    { name: 'General Consultation', slug: 'general-consultation', serviceType: ServiceType.CONSULTATION, description: '30-min primary doctor consultation' },
    { name: 'Specialist Consultation', slug: 'specialist-consultation', serviceType: ServiceType.CONSULTATION, description: 'In-depth specialist evaluation' },
    { name: 'ECG & Cardiac Screening', slug: 'ecg-cardiac-screening', serviceType: ServiceType.DIAGNOSTIC, description: '12-lead Electrocardiogram screening' },
    { name: 'Full Body Blood Panel', slug: 'full-body-blood-panel', serviceType: ServiceType.DIAGNOSTIC, description: 'Comprehensive blood & lipid panel' },
    { name: 'Home Nursing Care', slug: 'home-nursing-care', serviceType: ServiceType.HOME_NURSING, description: '4-hour professional home nursing' },
    { name: 'Home Physiotherapy Session', slug: 'home-physiotherapy-session', serviceType: ServiceType.PHYSIOTHERAPY, description: 'Targeted physical rehab at home' },
    { name: 'Executive Health Checkup', slug: 'executive-health-checkup', serviceType: ServiceType.HEALTH_CHECKUP, description: 'Complete day checkup package' },
    { name: 'Expert Second Opinion', slug: 'expert-second-opinion', serviceType: ServiceType.SECOND_OPINION, description: 'Senior consultant case review' },
  ];

  const servicesMap = new Map<string, string>();
  for (const s of servicesData) {
    const created = await prisma.service.create({ data: s });
    servicesMap.set(s.slug, created.id);
  }
  console.log(`📋 Created ${servicesMap.size} Healthcare Services`);

  // 4. Seed Doctors (15 Providers)
  const doctorsData = [
    { name: 'Dr. Aris Thorne', bio: 'Senior Cardiologist with 14 years of clinical experience in interventional cardiology.', city: 'New York', state: 'NY', rating: 4.9, reviewCount: 128, experienceYears: 14, fee: 150, specSlugs: ['cardiology'] },
    { name: 'Dr. Elena Rostova', bio: 'Compassionate General Physician specializing in preventive care and chronic illness management.', city: 'New York', state: 'NY', rating: 4.8, reviewCount: 94, experienceYears: 9, fee: 80, specSlugs: ['general-medicine'] },
    { name: 'Dr. Marcus Vance', bio: 'Orthopedic Surgeon focused on sports injury rehabilitation and joint replacement.', city: 'New York', state: 'NY', rating: 4.7, reviewCount: 82, experienceYears: 12, fee: 140, specSlugs: ['orthopedics'] },
    { name: 'Dr. Sophia Chen', bio: 'Neurologist specialized in migraine management, stroke rehab, and nerve disorders.', city: 'New York', state: 'NY', rating: 4.9, reviewCount: 156, experienceYears: 16, fee: 160, specSlugs: ['neurology'] },
    { name: 'Dr. Rajiv Patel', bio: 'Pulmonologist expert in asthma, allergic respiratory conditions, and sleep apnea.', city: 'New York', state: 'NY', rating: 4.8, reviewCount: 110, experienceYears: 11, fee: 120, specSlugs: ['pulmonology'] },
    { name: 'Dr. Rachel Adams', bio: 'Obstetrician and Gynecologist supporting women through all stages of life.', city: 'Chicago', state: 'IL', rating: 4.9, reviewCount: 210, experienceYears: 15, fee: 130, specSlugs: ['gynecology'] },
    { name: 'Dr. David Kim', bio: 'Pediatrician dedicated to newborn, child, and adolescent growth & development.', city: 'Chicago', state: 'IL', rating: 4.9, reviewCount: 180, experienceYears: 10, fee: 95, specSlugs: ['pediatrics'] },
    { name: 'Dr. Maya Lin', bio: 'Dermatologist expert in clinical acne treatment, eczema, and skin cancer screening.', city: 'Chicago', state: 'IL', rating: 4.8, reviewCount: 142, experienceYears: 8, fee: 110, specSlugs: ['dermatology'] },
    { name: 'Dr. James Harrison', bio: 'General Practitioner specializing in urgent care and infectious disease control.', city: 'Chicago', state: 'IL', rating: 4.6, reviewCount: 75, experienceYears: 7, fee: 75, specSlugs: ['general-medicine'] },
    { name: 'Dr. Anita Roy', bio: 'Consultant Neurologist focusing on memory care, Parkinson’s, and neuro-genetics.', city: 'San Francisco', state: 'CA', rating: 4.9, reviewCount: 115, experienceYears: 13, fee: 170, specSlugs: ['neurology'] },
    { name: 'Dr. Samuel Wright', bio: 'Interventional Cardiologist with extensive clinical research in heart failure.', city: 'San Francisco', state: 'CA', rating: 4.7, reviewCount: 88, experienceYears: 12, fee: 155, specSlugs: ['cardiology'] },
    { name: 'Dr. Chloe Bennett', bio: 'Orthopedic specialist in hand, wrist, and micro-vascular surgery.', city: 'San Francisco', state: 'CA', rating: 4.8, reviewCount: 64, experienceYears: 9, fee: 145, specSlugs: ['orthopedics'] },
    { name: 'Dr. Omar Farooq', bio: 'Pulmonary Critical Care specialist managing complex lung and airway pathologies.', city: 'San Francisco', state: 'CA', rating: 4.9, reviewCount: 92, experienceYears: 14, fee: 135, specSlugs: ['pulmonology'] },
    { name: 'Dr. Victoria Sterling', bio: 'Senior Pediatric Cardiologist managing congenital heart conditions in children.', city: 'Boston', state: 'MA', rating: 5.0, reviewCount: 204, experienceYears: 18, fee: 190, specSlugs: ['pediatrics', 'cardiology'] },
    { name: 'Dr. Benjamin Hayes', bio: 'Primary Care Physician with focus on lifestyle medicine and cardiovascular wellness.', city: 'Boston', state: 'MA', rating: 4.7, reviewCount: 98, experienceYears: 8, fee: 85, specSlugs: ['general-medicine'] },
  ];

  const providerIds: string[] = [];

  for (const doc of doctorsData) {
    const createdDoc = await prisma.provider.create({
      data: {
        name: doc.name,
        type: ProviderType.DOCTOR,
        bio: doc.bio,
        address: '100 Medical Center Way',
        city: doc.city,
        state: doc.state,
        rating: doc.rating,
        reviewCount: doc.reviewCount,
        experienceYears: doc.experienceYears,
        consultationFee: doc.fee,
        specialties: {
          create: doc.specSlugs.map((slug) => ({
            specialtyId: specialtiesMap.get(slug)!,
          })),
        },
        services: {
          create: [
            { serviceId: servicesMap.get('general-consultation')!, customPrice: doc.fee, durationMinutes: 30 },
            { serviceId: servicesMap.get('specialist-consultation')!, customPrice: doc.fee + 30, durationMinutes: 45 },
          ],
        },
      },
    });
    providerIds.push(createdDoc.id);
  }
  console.log(`👨‍⚕️ Created 15 Synthetic Doctors`);

  // 5. Seed Hospitals (5 Providers)
  const hospitalsData = [
    { name: 'MetroHealth Medical Center', city: 'New York', state: 'NY', rating: 4.8, reviewCount: 520, fee: 200, bio: 'Tier-1 multi-specialty research and emergency trauma hospital.' },
    { name: 'St. Jude Community Hospital', city: 'Chicago', state: 'IL', rating: 4.7, reviewCount: 410, fee: 180, bio: 'Patient-first community health network with 24/7 cardiac ICU.' },
    { name: 'Pacific Care Super-Specialty Hospital', city: 'San Francisco', state: 'CA', rating: 4.9, reviewCount: 680, fee: 250, bio: 'State-of-the-art surgical and oncological care center.' },
    { name: 'Beacon Hill General Hospital', city: 'Boston', state: 'MA', rating: 4.6, reviewCount: 310, fee: 175, bio: 'Established regional hospital known for orthopedic excellence.' },
    { name: 'Sunrise Bay Children & Family Hospital', city: 'Miami', state: 'FL', rating: 4.9, reviewCount: 490, fee: 210, bio: 'Dedicated maternity, pediatric, and family wellness hospital.' },
  ];

  for (const h of hospitalsData) {
    const createdHosp = await prisma.provider.create({
      data: {
        name: h.name,
        type: ProviderType.HOSPITAL,
        bio: h.bio,
        address: '500 Health Boulevard',
        city: h.city,
        state: h.state,
        rating: h.rating,
        reviewCount: h.reviewCount,
        experienceYears: 25,
        consultationFee: h.fee,
        specialties: {
          create: [
            { specialtyId: specialtiesMap.get('cardiology')! },
            { specialtyId: specialtiesMap.get('general-medicine')! },
            { specialtyId: specialtiesMap.get('orthopedics')! },
          ],
        },
        services: {
          create: [
            { serviceId: servicesMap.get('specialist-consultation')!, customPrice: h.fee, durationMinutes: 45 },
            { serviceId: servicesMap.get('executive-health-checkup')!, customPrice: 450, durationMinutes: 180 },
            { serviceId: servicesMap.get('expert-second-opinion')!, customPrice: 300, durationMinutes: 60 },
          ],
        },
      },
    });
    providerIds.push(createdHosp.id);
  }
  console.log(`🏥 Created 5 Synthetic Hospitals`);

  // 6. Seed Diagnostic Centers (5 Providers)
  const diagnosticData = [
    { name: 'Apex Diagnostic & Imaging Hub', city: 'New York', state: 'NY', rating: 4.8, reviewCount: 290, fee: 90, bio: 'Advanced 3T MRI, CT Scan, and automated pathology lab.' },
    { name: 'QuestCare Diagnostics Lab', city: 'Chicago', state: 'IL', rating: 4.7, reviewCount: 210, fee: 70, bio: 'Fast, accurate blood work and genetic marker diagnostic services.' },
    { name: 'Silicon Valley Health Diagnostics', city: 'San Francisco', state: 'CA', rating: 4.9, reviewCount: 340, fee: 110, bio: 'Digital X-ray, Ultrasound, and cardiac diagnostic center.' },
    { name: 'New England Precision Pathology', city: 'Boston', state: 'MA', rating: 4.6, reviewCount: 180, fee: 85, bio: 'Specialized lab screening for endocrine and metabolic disorders.' },
    { name: 'Sunstate Scan & Lab Center', city: 'Miami', state: 'FL', rating: 4.8, reviewCount: 230, fee: 75, bio: 'Same-day report delivery for routine health checkups and blood panels.' },
  ];

  for (const d of diagnosticData) {
    const createdDiag = await prisma.provider.create({
      data: {
        name: d.name,
        type: ProviderType.DIAGNOSTIC_CENTER,
        bio: d.bio,
        address: '25 Lab Park Road',
        city: d.city,
        state: d.state,
        rating: d.rating,
        reviewCount: d.reviewCount,
        experienceYears: 15,
        consultationFee: d.fee,
        specialties: {
          create: [
            { specialtyId: specialtiesMap.get('general-medicine')! },
            { specialtyId: specialtiesMap.get('cardiology')! },
          ],
        },
        services: {
          create: [
            { serviceId: servicesMap.get('ecg-cardiac-screening')!, customPrice: 120, durationMinutes: 30 },
            { serviceId: servicesMap.get('full-body-blood-panel')!, customPrice: 150, durationMinutes: 20 },
            { serviceId: servicesMap.get('executive-health-checkup')!, customPrice: 350, durationMinutes: 120 },
          ],
        },
      },
    });
    providerIds.push(createdDiag.id);
  }
  console.log(`🔬 Created 5 Synthetic Diagnostic Centers`);

  // 7. Seed Home Care Providers (5 Providers)
  const homeCareData = [
    { name: 'ComfortCare Home Health & Nursing', city: 'New York', state: 'NY', rating: 4.9, reviewCount: 195, fee: 120, bio: '24/7 certified home nursing care for post-operative & geriatric patients.' },
    { name: 'Windy City Home Physio & Nurse', city: 'Chicago', state: 'IL', rating: 4.8, reviewCount: 140, fee: 100, bio: 'In-home stroke rehabilitation and post-joint replacement physical therapy.' },
    { name: 'Golden Gate Home Caregivers', city: 'San Francisco', state: 'CA', rating: 4.9, reviewCount: 220, fee: 130, bio: 'Compassionate home health aides and respiratory therapy support.' },
    { name: 'BayState Elderly & Home Nursing', city: 'Boston', state: 'MA', rating: 4.7, reviewCount: 110, fee: 110, bio: 'Specialized dementia and palliative care in the comfort of home.' },
    { name: 'Sunshine State Home Physio', city: 'Miami', state: 'FL', rating: 4.8, reviewCount: 160, fee: 95, bio: 'Personalized physical rehabilitation and post-fracture home care.' },
  ];

  for (const hc of homeCareData) {
    const createdHC = await prisma.provider.create({
      data: {
        name: hc.name,
        type: ProviderType.HOME_CARE,
        bio: hc.bio,
        address: '78 Community Way',
        city: hc.city,
        state: hc.state,
        rating: hc.rating,
        reviewCount: hc.reviewCount,
        experienceYears: 12,
        consultationFee: hc.fee,
        specialties: {
          create: [
            { specialtyId: specialtiesMap.get('general-medicine')! },
            { specialtyId: specialtiesMap.get('orthopedics')! },
            { specialtyId: specialtiesMap.get('pulmonology')! },
          ],
        },
        services: {
          create: [
            { serviceId: servicesMap.get('home-nursing-care')!, customPrice: 160, durationMinutes: 240 },
            { serviceId: servicesMap.get('home-physiotherapy-session')!, customPrice: 120, durationMinutes: 60 },
          ],
        },
      },
    });
    providerIds.push(createdHC.id);
  }
  console.log(`🏡 Created 5 Synthetic Home Care Providers`);

  // 8. Create Availability Slots (for today and next 5 days)
  console.log('⏰ Generating Availability Slots...');
  const now = new Date();
  let totalSlots = 0;

  for (const pid of providerIds) {
    for (let dayOffset = 0; dayOffset < 5; dayOffset++) {
      const baseDate = new Date(now);
      baseDate.setDate(now.getDate() + dayOffset);

      // Generate 4 slots per day (9 AM, 11 AM, 2 PM, 4 PM)
      const hours = [9, 11, 14, 16];
      for (const h of hours) {
        const startTime = new Date(baseDate.setHours(h, 0, 0, 0));
        const endTime = new Date(baseDate.setHours(h, 45, 0, 0));

        await prisma.availabilitySlot.create({
          data: {
            providerId: pid,
            startTime,
            endTime,
            status: SlotStatus.AVAILABLE,
          },
        });
        totalSlots++;
      }
    }
  }

  console.log(`📅 Created ${totalSlots} Availability Slots across ${providerIds.length} Providers`);
  console.log('🎉 CareFlow Database Seeding Complete!');
}

main()
  .catch((e) => {
    console.error('❌ Seeder Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
