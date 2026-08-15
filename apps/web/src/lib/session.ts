import { AIAnalysisResult, AppointmentRecord, ProviderItem } from './api';

const KEYS = {
  AI_RESULT: 'careflow_ai_result',
  SELECTED_SLOT: 'careflow_selected_slot',
  SELECTED_SLOT_TIME: 'careflow_selected_slot_time',
  PROVIDER_ID: 'careflow_provider_id',
  SELECTED_PROVIDER: 'careflow_selected_provider',
  CONFIRMED_APPOINTMENT: 'careflow_confirmed_appointment',
  PATIENT_ID: 'careflow_patient_id',
};

export const sessionManager = {
  // AI Results
  setAiResult: (data: AIAnalysisResult) => {
    if (typeof window !== 'undefined') {
      sessionStorage.setItem(KEYS.AI_RESULT, JSON.stringify(data));
    }
  },
  getAiResult: (): AIAnalysisResult | null => {
    if (typeof window === 'undefined') return null;
    const raw = sessionStorage.getItem(KEYS.AI_RESULT);
    if (!raw) return null;
    try {
      return JSON.parse(raw);
    } catch {
      return null;
    }
  },

  // Selected Provider
  setSelectedProvider: (provider: ProviderItem) => {
    if (typeof window !== 'undefined') {
      sessionStorage.setItem(KEYS.PROVIDER_ID, provider.id);
      sessionStorage.setItem(KEYS.SELECTED_PROVIDER, JSON.stringify(provider));
    }
  },
  getSelectedProvider: (): ProviderItem | null => {
    if (typeof window === 'undefined') return null;
    const raw = sessionStorage.getItem(KEYS.SELECTED_PROVIDER);
    if (!raw) return null;
    try {
      return JSON.parse(raw);
    } catch {
      return null;
    }
  },
  getProviderId: (): string | null => {
    if (typeof window === 'undefined') return null;
    return sessionStorage.getItem(KEYS.PROVIDER_ID);
  },

  // Selected Slot
  setSelectedSlot: (slotId: string, slotTime?: string) => {
    if (typeof window !== 'undefined') {
      sessionStorage.setItem(KEYS.SELECTED_SLOT, slotId);
      if (slotTime) {
        sessionStorage.setItem(KEYS.SELECTED_SLOT_TIME, slotTime);
      }
    }
  },
  getSelectedSlotId: (): string | null => {
    if (typeof window === 'undefined') return null;
    return sessionStorage.getItem(KEYS.SELECTED_SLOT);
  },
  getSelectedSlotTime: (): string | null => {
    if (typeof window === 'undefined') return null;
    return sessionStorage.getItem(KEYS.SELECTED_SLOT_TIME);
  },

  // Confirmed Appointment
  setConfirmedAppointment: (appointment: AppointmentRecord) => {
    if (typeof window !== 'undefined') {
      sessionStorage.setItem(KEYS.CONFIRMED_APPOINTMENT, JSON.stringify(appointment));
    }
  },
  getConfirmedAppointment: (): AppointmentRecord | null => {
    if (typeof window === 'undefined') return null;
    const raw = sessionStorage.getItem(KEYS.CONFIRMED_APPOINTMENT);
    if (!raw) return null;
    try {
      return JSON.parse(raw);
    } catch {
      return null;
    }
  },

  // Clear booking workflow state
  clearBookingSession: () => {
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem(KEYS.SELECTED_SLOT);
      sessionStorage.removeItem(KEYS.SELECTED_SLOT_TIME);
      sessionStorage.removeItem(KEYS.PROVIDER_ID);
      sessionStorage.removeItem(KEYS.SELECTED_PROVIDER);
    }
  },
};
