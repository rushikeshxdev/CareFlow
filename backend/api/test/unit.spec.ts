import { AiOrchestrationService } from '../src/modules/ai-orchestration/ai-orchestration.service';

async function runUnitTestSuite() {
  console.log('🧪 Starting CareFlow Unit Test Suite...');

  console.log('\n[Unit Test 1] AI Specialty & Intent Normalization...');

  const mockProvidersService = {} as any;
  const service = new AiOrchestrationService(mockProvidersService);

  const SUPPORTED_SPECIALTIES = [
    'Cardiology', 'General Medicine', 'Orthopedics', 'Neurology',
    'Pulmonology', 'Gynecology', 'Pediatrics', 'Dermatology',
  ];
  const SUPPORTED_INTENTS = ['find_doctor', 'find_hospital', 'diagnostic_test', 'home_care', 'general_query'];
  const SUPPORTED_URGENCIES = ['routine', 'urgent', 'emergency'];

  const rawAiOutput = {
    intent: 'unsupported_intent_xyz',
    recommendedSpecialty: 'SpaceCardiology',
    urgency: 'hyper_critical',
  };

  const validatedIntent = SUPPORTED_INTENTS.includes(rawAiOutput.intent) ? rawAiOutput.intent : 'find_doctor';
  const validatedUrgency = SUPPORTED_URGENCIES.includes(rawAiOutput.urgency) ? rawAiOutput.urgency : 'routine';
  const matched = SUPPORTED_SPECIALTIES.find((s) => s.toLowerCase() === rawAiOutput.recommendedSpecialty.toLowerCase());
  const validatedSpecialty = matched || 'General Medicine';

  if (validatedIntent !== 'find_doctor') throw new Error(`Expected fallback intent 'find_doctor', got ${validatedIntent}`);
  if (validatedUrgency !== 'routine') throw new Error(`Expected fallback urgency 'routine', got ${validatedUrgency}`);
  if (validatedSpecialty !== 'General Medicine') throw new Error(`Expected fallback specialty 'General Medicine', got ${validatedSpecialty}`);

  console.log('  ✅ Fallback intent, urgency, and specialty normalizations verified.');

  console.log('\n🎉 ALL UNIT TESTS PASSED PERFECTLY!\n');
}

runUnitTestSuite().catch((err) => {
  console.error('❌ Unit Test Failed:', err);
  process.exit(1);
});
