import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import * as cookieParser from 'cookie-parser';
import * as request from 'supertest';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function runSecurityTestSuite() {
  console.log('🧪 Starting CareFlow Phase 3 Security & Ownership Verification Suite...');

  const app = await NestFactory.create(AppModule, { logger: ['error', 'warn'] });
  app.use(cookieParser());
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
  await app.listen(0);

  const server = app.getHttpServer();

  try {
    // ----------------------------------------------------
    // Test 1: Patient Self-Registration
    // ----------------------------------------------------
    console.log('\n[Test 1] Patient Registration & Password Policy...');
    const testEmail = `test.patient.${Date.now()}@example.com`;
    
    // Weak password should fail validation
    const weakPassRes = await request(server)
      .post('/auth/register')
      .send({ name: 'Test Patient', email: testEmail, password: 'simple' });
    
    if (weakPassRes.status !== 400) {
      throw new Error(`Expected 400 for weak password, got ${weakPassRes.status}`);
    }
    console.log('  ✅ Weak password rejected with 400 Bad Request');

    // Valid registration
    const regRes = await request(server)
      .post('/auth/register')
      .send({ name: 'Security Test Patient', email: testEmail, password: 'Password123!' });

    if (regRes.status !== 201 || !regRes.body.accessToken || !regRes.body.user?.patientId) {
      throw new Error(`Registration failed: ${JSON.stringify(regRes.body)}`);
    }
    const patientA = regRes.body;
    console.log(`  ✅ Patient A Registered successfully. Role: ${patientA.user.role}, PatientID: ${patientA.user.patientId}`);

    // Duplicate email registration should fail with 409 Conflict
    const dupRes = await request(server)
      .post('/auth/register')
      .send({ name: 'Duplicate Patient', email: testEmail, password: 'Password123!' });

    if (dupRes.status !== 409) {
      throw new Error(`Expected 409 for duplicate email, got ${dupRes.status}`);
    }
    console.log('  ✅ Duplicate email rejected with 409 Conflict');

    // ----------------------------------------------------
    // Test 2: Login & Password Hash Verification
    // ----------------------------------------------------
    console.log('\n[Test 2] Login & Generic Error Messages...');
    
    // Invalid credentials
    const invalidLogin = await request(server)
      .post('/auth/login')
      .send({ email: testEmail, password: 'WrongPassword123!' });

    if (invalidLogin.status !== 401 || invalidLogin.body.message !== 'Invalid email or password.') {
      throw new Error(`Expected 401 generic message, got ${invalidLogin.status}`);
    }
    console.log('  ✅ Invalid password returns generic 401 Unauthorized');

    // Valid login
    const validLogin = await request(server)
      .post('/auth/login')
      .send({ email: testEmail, password: 'Password123!' });

    if (validLogin.status !== 200 || !validLogin.body.accessToken) {
      throw new Error(`Login failed: ${JSON.stringify(validLogin.body)}`);
    }
    const patientAToken = validLogin.body.accessToken;
    const patientARefreshToken = validLogin.body.refreshToken;
    console.log('  ✅ Valid login returned access token and refresh token');

    // ----------------------------------------------------
    // Test 3: Authenticated /auth/me Endpoint
    // ----------------------------------------------------
    console.log('\n[Test 3] GET /auth/me Endpoint...');
    
    const unauthMe = await request(server).get('/auth/me');
    if (unauthMe.status !== 401) {
      throw new Error(`Expected 401 for unauthenticated /auth/me, got ${unauthMe.status}`);
    }
    console.log('  ✅ Unauthenticated /auth/me blocked with 401');

    const meRes = await request(server)
      .get('/auth/me')
      .set('Authorization', `Bearer ${patientAToken}`);

    if (meRes.status !== 200 || meRes.body.email !== testEmail) {
      throw new Error(`GET /auth/me failed: ${JSON.stringify(meRes.body)}`);
    }
    console.log(`  ✅ GET /auth/me succeeded for authenticated user: ${meRes.body.name}`);

    // ----------------------------------------------------
    // Test 4: Single-use Refresh Token Rotation & Revocation
    // ----------------------------------------------------
    console.log('\n[Test 4] Refresh Token Rotation & Revocation...');
    
    const refreshRes1 = await request(server)
      .post('/auth/refresh')
      .send({ refreshToken: patientARefreshToken });

    if (refreshRes1.status !== 200 || !refreshRes1.body.accessToken || !refreshRes1.body.refreshToken) {
      throw new Error(`Token refresh failed: ${JSON.stringify(refreshRes1.body)}`);
    }
    const newRefreshToken = refreshRes1.body.refreshToken;
    console.log('  ✅ Token rotated successfully. Received new refresh token.');

    // Reusing old refresh token must be detected and rejected
    const reuseRes = await request(server)
      .post('/auth/refresh')
      .send({ refreshToken: patientARefreshToken });

    if (reuseRes.status !== 401) {
      throw new Error(`Expected 401 for refresh token reuse, got ${reuseRes.status}`);
    }
    console.log('  ✅ Refresh token reuse detected & revoked with 401 Unauthorized');

    // ----------------------------------------------------
    // Test 5: Resource Ownership & Impersonation Prevention
    // ----------------------------------------------------
    console.log('\n[Test 5] Patient Resource Ownership & Impersonation Prevention...');

    // Register Patient B
    const emailB = `test.patientB.${Date.now()}@example.com`;
    const regB = await request(server)
      .post('/auth/register')
      .send({ name: 'Patient B', email: emailB, password: 'Password123!' });
    const patientBToken = regB.body.accessToken;
    const patientBId = regB.body.user.patientId;

    // Find available slot
    const slot = await prisma.availabilitySlot.findFirst({ where: { status: 'AVAILABLE', appointment: null } });
    if (!slot) throw new Error('No available slot found for testing');

    // Patient A holds slot but attempts to send Patient B's ID in body
    const holdRes = await request(server)
      .post('/appointments/hold')
      .set('Authorization', `Bearer ${patientAToken}`)
      .send({ slotId: slot.id, patientId: patientBId }); // Impersonation attempt!

    if (holdRes.status !== 201) {
      throw new Error(`Hold slot failed: ${JSON.stringify(holdRes.body)}`);
    }
    
    // Check that hold was saved under Patient A's ID, NOT Patient B's ID
    const updatedSlot = await prisma.availabilitySlot.findUnique({ where: { id: slot.id } });
    if (updatedSlot?.heldByPatientId !== patientA.user.patientId) {
      throw new Error(`Impersonation flaw! Slot held by ${updatedSlot?.heldByPatientId} instead of Patient A (${patientA.user.patientId})`);
    }
    console.log('  ✅ Impersonation blocked: Slot hold automatically bound to authenticated Patient A ID.');

    // Patient A creates appointment
    const apptRes = await request(server)
      .post('/appointments')
      .set('Authorization', `Bearer ${patientAToken}`)
      .send({
        providerId: slot.providerId,
        slotId: slot.id,
        serviceId: 'general-consultation',
        type: 'IN_PERSON',
        reason: 'Security Verification Visit',
      });

    if (apptRes.status !== 201) {
      throw new Error(`Appointment creation failed: ${JSON.stringify(apptRes.body)}`);
    }
    const appointmentId = apptRes.body.id;
    console.log(`  ✅ Appointment created by Patient A: ${appointmentId}`);

    // Patient B attempts to view Patient A's appointment
    const leakViewRes = await request(server)
      .get(`/appointments/${appointmentId}`)
      .set('Authorization', `Bearer ${patientBToken}`);

    if (leakViewRes.status !== 404) {
      throw new Error(`Expected 404 when Patient B attempts to view Patient A appointment, got ${leakViewRes.status}`);
    }
    console.log('  ✅ Resource Scanning Blocked: Patient B received 404 Not Found when requesting Patient A appointment.');

    // Patient B attempts to cancel Patient A's appointment
    const leakCancelRes = await request(server)
      .patch(`/appointments/${appointmentId}/cancel`)
      .set('Authorization', `Bearer ${patientBToken}`);

    if (leakCancelRes.status !== 404) {
      throw new Error(`Expected 404 when Patient B attempts to cancel Patient A appointment, got ${leakCancelRes.status}`);
    }
    console.log('  ✅ Unauthorized Cancellation Blocked: Patient B received 404 Not Found.');

    // Patient B attempts to view Patient A's patient profile
    const leakProfileRes = await request(server)
      .get(`/patients/${patientA.user.patientId}`)
      .set('Authorization', `Bearer ${patientBToken}`);

    if (leakProfileRes.status !== 404) {
      throw new Error(`Expected 404 when Patient B attempts to view Patient A profile, got ${leakProfileRes.status}`);
    }
    console.log('  ✅ Patient Profile Protected: Patient B received 404 Not Found.');

    // ----------------------------------------------------
    // Test 6: Concurrency Protection Regression Check
    // ----------------------------------------------------
    console.log('\n[Test 6] Concurrency Protection Regression Check...');
    const slot2 = await prisma.availabilitySlot.findFirst({ where: { status: 'AVAILABLE' } });
    if (!slot2) throw new Error('No second slot available for concurrency test');

    const [concReq1, concReq2] = await Promise.all([
      request(server)
        .post('/appointments/hold')
        .set('Authorization', `Bearer ${patientAToken}`)
        .send({ slotId: slot2.id }),
      request(server)
        .post('/appointments/hold')
        .set('Authorization', `Bearer ${patientBToken}`)
        .send({ slotId: slot2.id }),
    ]);

    const statuses = [concReq1.status, concReq2.status].sort();
    if (statuses[0] !== 201 || statuses[1] !== 409) {
      throw new Error(`Expected [201, 409] for concurrent holds, got [${statuses.join(', ')}]`);
    }
    console.log('  ✅ Concurrency Protection Verified: 1 Request Succeeded (201), 1 Request Rejected (409).');

    console.log('\n🎉 ALL PHASE 3 SECURITY & OWNERSHIP TESTS PASSED PERFECTLY!\n');
  } finally {
    await app.close();
    await prisma.$disconnect();
  }
}

runSecurityTestSuite().catch((err) => {
  console.error('\n❌ Security Test Suite Failed:', err.stack || err);
  process.exit(1);
});
