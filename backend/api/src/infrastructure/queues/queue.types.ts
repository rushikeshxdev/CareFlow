export interface NotificationJobPayload {
  type: 'APPOINTMENT_CONFIRMED';
  appointmentId: string;
  userId: string;
  patientId: string;
}

export interface ReminderJobPayload {
  reminderType: 'DAY_BEFORE' | 'HOUR_BEFORE';
  appointmentId: string;
  userId: string;
  patientId: string;
}

export interface CleanupJobPayload {
  jobType: 'EXPIRED_SLOT_CLEANUP';
}
