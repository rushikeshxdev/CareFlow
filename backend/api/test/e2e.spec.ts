import { PrismaClient, SlotStatus } from '@prisma/client';
import request = require('supertest');

const prisma = new PrismaClient();
const server = process.env.API_URL || 'http://localhost:3001';

async function runE2ETestSuite() {
  console.log('🧪 Starting CareFlow Full End-to-End User Journey Test Suite...\n');
  const timestamp = Date.now();

  try {
    // 1. Patient Registration
    console.log('[Step 1] Registering New Patient...');
    const userEmail = `e2e.patient.${timestamp}@example.com`;
    const regRes = await request(server)
      .post('/auth/register')
      .send({ name: 'E2E User', email: userEmail, password: 'Password123!' });

    if (regRes.status !== 201 || !regRes.body.accessToken) {
      throw new Error(`Registration failed: ${JSON.stringify(regRes.body)}`);
    }
    const token = regRes.body.accessToken;
    console.log('  ✅ Patient registered successfully.');

    // 2. Fetch Provider & Slot
    console.log('\n[Step 2] Finding Available Doctor Slot...');
    const provider = await prisma.provider.findFirst({
      where: {
        availabilitySlots: { some: { status: SlotStatus.AVAILABLE, appointment: null } },
      },
      include: {
        availabilitySlots: { where: { status: SlotStatus.AVAILABLE, appointment: null } },
        services: true,
      },
    });

    if (!provider || provider.availabilitySlots.length === 0) {
      throw new Error('No available slot found for E2E test.');
    }
    const slot = provider.availabilitySlots[0];
    const service = provider.services[0];

    // 3. Hold Slot (10-Minute Lock)
    console.log('\n[Step 3] Holding Availability Slot...');
    const holdRes = await request(server)
      .post('/appointments/hold')
      .set('Authorization', `Bearer ${token}`)
      .send({ slotId: slot.id });

    if (holdRes.status !== 201) {
      throw new Error(`Hold failed: ${JSON.stringify(holdRes.body)}`);
    }
    console.log('  ✅ Slot held successfully.');

    // 4. Confirm Appointment (Atomic Postgres Transaction)
    console.log('\n[Step 4] Confirming Appointment & Creating Care Journey...');
    const bookRes = await request(server)
      .post('/appointments')
      .set('Authorization', `Bearer ${token}`)
      .send({
        providerId: provider.id,
        slotId: slot.id,
        serviceId: service.serviceId || service.id,
        reason: 'E2E Comprehensive Health Check',
      });

    if (bookRes.status !== 201) {
      throw new Error(`Booking failed: ${JSON.stringify(bookRes.body)}`);
    }
    const apptId = bookRes.body.id;
    console.log(`  ✅ Appointment confirmed (ID: ${apptId}).`);

    // 5. Verify Care Journey
    console.log('\n[Step 5] Verifying Patient Care Journey Timeline...');
    const journeyRes = await request(server)
      .get('/care-journeys')
      .set('Authorization', `Bearer ${token}`);

    if (journeyRes.status !== 200 || journeyRes.body.length === 0) {
      throw new Error('Expected patient care journey to exist');
    }
    console.log(`  ✅ Care Journey timeline retrieved: "${journeyRes.body[0].title}".`);

    console.log('\n🎉 E2E TEST SUITE PASSED PERFECTLY!\n');
  } finally {
    await prisma.$disconnect();
  }
}

runE2ETestSuite().catch((err) => {
  console.error('❌ E2E Test Suite Failed:', err);
  process.exit(1);
});
