import { ProviderFilterQuery, AIIntentAnalysisRequest } from '@careflow/shared';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

async function fetchJson<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
    ...options,
  });

  if (!response.ok) {
    let errorMessage = `HTTP ${response.status} ${response.statusText}`;
    try {
      const errorData = await response.json();
      if (errorData.message) {
        errorMessage = Array.isArray(errorData.message) ? errorData.message.join(', ') : errorData.message;
      }
    } catch {
      // Ignore JSON parse errors for non-JSON responses
    }
    const error = new Error(errorMessage) as Error & { status?: number };
    error.status = response.status;
    throw error;
  }

  return response.json();
}

export interface ProviderItem {
  id: string;
  name: string;
  type: 'DOCTOR' | 'HOSPITAL' | 'DIAGNOSTIC_CENTER' | 'HOME_CARE';
  bio?: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  rating: number;
  reviewCount: number;
  experienceYears: number;
  consultationFee: number;
  profileImage?: string;
  matchScore?: number;
  specialties?: Array<{ specialty: { id: string; name: string; slug: string } }>;
  services?: Array<{ service: { id: string; name: string; slug: string }; customPrice?: number; durationMinutes?: number }>;
  availabilitySlots?: Array<{ id: string; startTime: string; endTime: string; status: 'AVAILABLE' | 'HELD' | 'BOOKED' | 'BLOCKED' }>;
}

export interface AvailabilitySlotItem {
  id: string;
  providerId?: string;
  startTime: string;
  endTime: string;
  status: 'AVAILABLE' | 'HELD' | 'BOOKED' | 'BLOCKED';
  heldByPatientId?: string;
  heldUntil?: string;
}

export interface AIAnalysisResult {
  aiAnalysis: {
    intent: 'find_doctor' | 'find_hospital' | 'diagnostic_test' | 'home_care' | 'general_query';
    recommendedSpecialty: string;
    recommendedServiceType: string;
    suggestedAction: string;
    urgency: 'routine' | 'urgent' | 'emergency';
    summary: string;
    keySymptoms: string[];
    disclaimer: string;
  };
  recommendedProviders: ProviderItem[];
  meta?: {
    validatedBy?: string;
    processedAt?: string;
    fallback?: boolean;
    reason?: string;
  };
}

export interface HoldSlotResponse {
  message: string;
  slot: AvailabilitySlotItem;
  expiresAt: string;
}

export interface AppointmentRecord {
  id: string;
  patientId: string;
  providerId: string;
  slotId: string;
  serviceId: string;
  type: 'IN_PERSON' | 'VIDEO_CONSULT' | 'HOME_VISIT';
  status: 'HELD' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED';
  reason?: string;
  createdAt: string;
  patient?: { id: string; user?: { name: string; email: string } };
  provider?: ProviderItem;
  slot?: AvailabilitySlotItem;
}

export const apiClient = {
  // Provider endpoints
  getProviders: async (query?: ProviderFilterQuery & { search?: string }): Promise<ProviderItem[]> => {
    const params = new URLSearchParams();
    if (query) {
      if (query.providerType) params.append('providerType', query.providerType);
      if (query.specialtyId) params.append('specialtyId', query.specialtyId);
      if (query.city) params.append('city', query.city);
      if (query.maxPrice) params.append('maxPrice', query.maxPrice.toString());
      if (query.minRating) params.append('minRating', query.minRating.toString());
      if (query.search) params.append('search', query.search);
      if (query.sortBy) params.append('sortBy', query.sortBy);
    }
    const queryString = params.toString() ? `?${params.toString()}` : '';
    return fetchJson<ProviderItem[]>(`/providers${queryString}`);
  },

  getProvider: async (id: string): Promise<ProviderItem> => {
    return fetchJson<ProviderItem>(`/providers/${id}`);
  },

  getSpecialties: async (): Promise<Array<{ id: string; name: string; slug: string; description?: string; icon?: string }>> => {
    return fetchJson('/specialties');
  },

  getServices: async (): Promise<Array<{ id: string; name: string; slug: string; serviceType: string }>> => {
    return fetchJson('/services');
  },

  getAvailability: async (providerId: string): Promise<AvailabilitySlotItem[]> => {
    return fetchJson<AvailabilitySlotItem[]>(`/availability/provider/${providerId}`);
  },

  // AI Endpoint
  analyzeConcern: async (payload: AIIntentAnalysisRequest): Promise<AIAnalysisResult> => {
    return fetchJson<AIAnalysisResult>('/ai/analyze-intent', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  // Appointment & Slot endpoints
  holdSlot: async (payload: { slotId: string; patientId: string }): Promise<HoldSlotResponse> => {
    return fetchJson<HoldSlotResponse>('/appointments/hold', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  createAppointment: async (payload: {
    patientId: string;
    providerId: string;
    slotId: string;
    serviceId: string;
    type?: string;
    reason?: string;
  }): Promise<AppointmentRecord> => {
    return fetchJson<AppointmentRecord>('/appointments', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  getAppointment: async (id: string): Promise<AppointmentRecord> => {
    return fetchJson<AppointmentRecord>(`/appointments/${id}`);
  },
};
