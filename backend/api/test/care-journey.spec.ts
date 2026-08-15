import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import * as cookieParser from 'cookie-parser';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/common/prisma.service';
import { CareJourneysService } from '../src/modules/care-journeys/care-journeys.service';
import { SlotStatus, AppointmentStatus } from '@prisma/client';

async function runCareJourneyTestSuite() {
  console.log('🧪 Starting CareFlow Care Journey & Transaction Test Suite...\n');

  const moduleFixture: TestingModule = await Test.createTestingModule({
    imports: [AppModule],
  }).compile();

  const app: INestApplication = moduleFixture.createNestApplication();
  app.use(cookieParser());
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  await app.init();
  const server = app.getHttpServer();
  const prisma = app.get(PrismaService);
  const careJourneysService = app.get(CareJourneysService);

  try {
    // ----------------------------------------------------
    // Setup: Register Patient A & Patient B
    // ----------------------------------------------------
    const timestamp = Date.now();
    const emailA = `testpatient_a_${timestamp}@careflow.test`;
    const emailB = `testpatient_b_${timestamp}@careflow.test`;

    const regA = await request(server)
      .post('/auth/register')
      .send({ name: 'Journey Patient A', email: emailA, password: 'Password123!' });

    const tokenA = regA.body.accessToken;
    const patientIdA = regA.body.user.patientId;

    const regB = await request(server)
      .post('/auth/register')
      .send({ name: 'Journey Patient B', email: emailB, password: 'Password123!' });

    const tokenB = regB.body.accessToken;
    const patientIdB = regB.body.user.patientId;

    // Find an available slot for testing (where appointment is null)
    const provider = await prisma.provider.findFirst({
      where: {
        availabilitySlots: {
          some: {
            status: SlotStatus.AVAILABLE,
            appointment: null,
          },
        },
      },
      include: {
        availabilitySlots: {
          where: {
            status: SlotStatus.AVAILABLE,
            appointment: null,
          },
        },
        services: true,
      },
    });

    if (!provider || provider.availabilitySlots.length === 0 || provider.services.length === 0) {
      throw new Error('No available provider slot found in database for testing');
    }

    const testSlot = provider.availabilitySlots[0];
    const testService = provider.services[0];

    // ----------------------------------------------------
    // Test 1: Automatic CareJourney & CareEvent Creation
    // ----------------------------------------------------
    console.log('[Test 1] CareJourney Creation on Appointment Confirmation...');

    const holdRes = await request(server)
      .post('/appointments/hold')
      .set('Authorization', `Bearer ${tokenA}`)
      .send({ slotId: testSlot.id });

    if (holdRes.status !== 201) {
      throw new Error(`Hold failed: ${JSON.stringify(holdRes.body)}`);
    }

    const bookRes = await request(server)
      .post('/appointments')
      .set('Authorization', `Bearer ${tokenA}`)
      .send({
        providerId: provider.id,
        slotId: testSlot.id,
        serviceId: testService.serviceId,
        reason: 'Routine cardiovascular checkup',
      });

    if (bookRes.status !== 201) {
      throw new Error(`Booking failed: ${JSON.stringify(bookRes.body)}`);
    }

    const createdAppointment = bookRes.body;
    console.log(`  ✅ Appointment confirmed: ${createdAppointment.id}`);

    // Fetch Patient A care journeys
    const journeysResA = await request(server)
      .get('/care-journeys')
      .set('Authorization', `Bearer ${tokenA}`);

    if (journeysResA.status !== 200 || journeysResA.body.length === 0) {
      throw new Error(`Expected care journey for Patient A, got: ${JSON.stringify(journeysResA.body)}`);
    }

    const journeyA = journeysResA.body[0];
    console.log(`  ✅ CareJourney automatically created: "${journeyA.title}" (ID: ${journeyA.id})`);
    
    if (!journeyA.events || journeyA.events.length === 0) {
      throw new Error('Expected CareEvent inside CareJourney');
    }

    const initialEvent = journeyA.events[0];
    if (initialEvent.appointmentId !== createdAppointment.id) {
      throw new Error(`Expected CareEvent appointmentId to equal ${createdAppointment.id}, got ${initialEvent.appointmentId}`);
    }

    console.log(`  ✅ CareEvent created with status CONFIRMED & linked to appointment: ${initialEvent.id}`);

    // ----------------------------------------------------
    // Test 2: Idempotency Verification
    // ----------------------------------------------------
    console.log('\n[Test 2] Idempotency Verification...');

    await prisma.$transaction(async (tx) => {
      await careJourneysService.ensureJourneyAndEventForAppointment(tx, createdAppointment);
    });

    const recheckJourneysResA = await request(server)
      .get('/care-journeys')
      .set('Authorization', `Bearer ${tokenA}`);

    if (recheckJourneysResA.body.length !== 1 || recheckJourneysResA.body[0].events.length !== 1) {
      throw new Error('Idempotency check failed: Duplicate CareJourney or CareEvent created!');
    }

    console.log('  ✅ Repeated journey creation request executed idempotently (1 Journey, 1 Event).');

    // ----------------------------------------------------
    // Test 3: Resource Ownership Isolation (Scanning Protection)
    // ----------------------------------------------------
    console.log('\n[Test 3] Resource Ownership Isolation & Scanning Protection...');

    const journeysResB = await request(server)
      .get('/care-journeys')
      .set('Authorization', `Bearer ${tokenB}`);

    if (journeysResB.status !== 200 || journeysResB.body.length !== 0) {
      throw new Error('Patient B should have 0 care journeys');
    }
    console.log('  ✅ Patient B sees 0 care journeys (Patient A journeys hidden)');

    const unauthorizedDetailRes = await request(server)
      .get(`/care-journeys/${journeyA.id}`)
      .set('Authorization', `Bearer ${tokenB}`);

    if (unauthorizedDetailRes.status !== 404) {
      throw new Error(`Expected 404 Not Found for cross-patient access, got ${unauthorizedDetailRes.status}`);
    }
    console.log('  ✅ Patient B received 404 Not Found attempting to access Patient A CareJourney.');

    // ----------------------------------------------------
    // Test 4: Status Sync on Cancellation
    // ----------------------------------------------------
    console.log('\n[Test 4] Status Sync on Cancellation...');

    const cancelRes = await request(server)
      .patch(`/appointments/${createdAppointment.id}/cancel`)
      .set('Authorization', `Bearer ${tokenA}`);

    if (cancelRes.status !== 200) {
      throw new Error(`Cancellation failed: ${JSON.stringify(cancelRes.body)}`);
    }

    const updatedJourneyRes = await request(server)
      .get(`/care-journeys/${journeyA.id}`)
      .set('Authorization', `Bearer ${tokenA}`);

    const cancelledEvent = updatedJourneyRes.body.events.find(
      (e: any) => e.appointmentId === createdAppointment.id,
    );

    if (!cancelledEvent || cancelledEvent.status !== 'CANCELLED') {
      throw new Error(`Expected CareEvent status CANCELLED, got ${cancelledEvent?.status}`);
    }

    console.log('  ✅ CareEvent status updated to CANCELLED in sync with appointment cancellation.');

    // ----------------------------------------------------
    // Test 5: Atomic Transaction Rollback Verification
    // ----------------------------------------------------
    console.log('\n[Test 5] Atomic Transaction Rollback Verification...');

    const rollbackSlot = await prisma.availabilitySlot.findFirst({
      where: { status: SlotStatus.AVAILABLE, appointment: null },
    });

    if (rollbackSlot) {
      let rollbackTriggered = false;
      try {
        await prisma.$transaction(async (tx) => {
          // 1. Mark slot booked
          await tx.availabilitySlot.update({
            where: { id: rollbackSlot.id },
            data: { status: SlotStatus.BOOKED },
          });

          // 2. Create appointment
          await tx.appointment.create({
            data: {
              id: `rollback_appt_${timestamp}`,
              patientId: patientIdA,
              providerId: provider.id,
              slotId: rollbackSlot.id,
              serviceId: testService.serviceId || testService.id,
              status: AppointmentStatus.CONFIRMED,
            },
          });

          // 3. Intentionally throw error to force rollback
          throw new Error('SIMULATED_TRANSACTION_FAILURE');
        });
      } catch (err: any) {
        if (err?.message === 'SIMULATED_TRANSACTION_FAILURE') {
          rollbackTriggered = true;
        } else {
          console.error('Unexpected error in Test 5:', err);
        }
      }

      if (!rollbackTriggered) {
        throw new Error('Expected simulated failure exception to trigger');
      }

      // Verify slot is STILL AVAILABLE and appointment does NOT exist
      const verifiedSlot = await prisma.availabilitySlot.findUnique({
        where: { id: rollbackSlot.id },
      });
      const verifiedAppt = await prisma.appointment.findUnique({
        where: { id: `rollback_appt_${timestamp}` },
      });

      if (verifiedSlot?.status !== SlotStatus.AVAILABLE || verifiedAppt !== null) {
        throw new Error('Transaction rollback failed: Slot or Appointment persisted after error!');
      }

      console.log('  ✅ Transaction Rollback Verified: Slot remained AVAILABLE and Appointment uncommitted.');
    }

    // ----------------------------------------------------
    // Test 6: Concurrency Lock Regression Test
    // ----------------------------------------------------
    console.log('\n[Test 6] Concurrency Protection Regression Check...');

    const concSlot = await prisma.availabilitySlot.findFirst({
      where: { status: SlotStatus.AVAILABLE, appointment: null },
    });

    if (concSlot) {
      const [req1, req2] = await Promise.all([
        request(server)
          .post('/appointments/hold')
          .set('Authorization', `Bearer ${tokenA}`)
          .send({ slotId: concSlot.id }),
        request(server)
          .post('/appointments/hold')
          .set('Authorization', `Bearer ${tokenB}`)
          .send({ slotId: concSlot.id }),
      ]);

      const statuses = [req1.status, req2.status].sort();
      if (statuses[0] !== 201 || statuses[1] !== 409) {
        throw new Error(`Expected one 201 and one 409 for concurrent hold, got: ${statuses.join(', ')}`);
      }

      console.log('  ✅ Concurrency Protection Verified: 1 Request Succeeded (201), 1 Request Rejected (409).');
    }

    console.log('\n🎉 ALL CARE JOURNEY & TRANSACTION TESTS PASSED PERFECTLY!\n');
  } finally {
    await app.close();
  }
}

runCareJourneyTestSuite().catch((err) => {
  console.error('❌ Care Journey Test Suite Failed:', err);
  process.exit(1);
});
