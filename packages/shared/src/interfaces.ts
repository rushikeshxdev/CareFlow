import { ProviderType, ServiceType, SlotStatus, AppointmentStatus, AppointmentType } from './enums';

export interface ProviderFilterQuery {
  providerType?: ProviderType;
  specialtyId?: string;
  city?: string;
  maxPrice?: number;
  minRating?: number;
  search?: string;
  sortBy?: 'score' | 'rating' | 'price' | 'experience';
}

export interface ProviderScoreWeights {
  specialty: number; // 0.35
  rating: number;    // 0.25
  availability: number; // 0.20
  location: number;  // 0.10
  price: number;     // 0.10
}

export interface AIIntentAnalysisRequest {
  concern: string;
  location?: string;
  userAge?: number;
  gender?: string;
}

export interface AIIntentAnalysisResponse {
  intent: 'find_doctor' | 'find_hospital' | 'diagnostic_test' | 'home_care' | 'general_query';
  recommendedSpecialty: string;
  recommendedServiceType: ServiceType;
  suggestedAction: string;
  urgency: 'routine' | 'urgent' | 'emergency';
  summary: string;
  keySymptoms: string[];
  disclaimer: string;
}

export interface SlotHoldRequest {
  slotId: string;
  patientId: string;
  holdDurationSeconds?: number;
}

export interface AppointmentCreateRequest {
  patientId: string;
  providerId: string;
  slotId: string;
  serviceId: string;
  type: AppointmentType;
  reason: string;
}
