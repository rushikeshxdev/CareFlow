export const NOTIFICATION_QUEUE = 'notifications';
export const REMINDER_QUEUE = 'reminders';
export const CLEANUP_QUEUE = 'cleanup';

export const CLEANUP_REPEATABLE_JOB_ID = 'cleanup-expired-slot-holds';

export function getConfirmationDedupeKey(appointmentId: string): string {
  return `APPOINTMENT_CONFIRMED_${appointmentId}`;
}

export function getReminderDedupeKey(reminderType: string, appointmentId: string): string {
  return `REMINDER_${reminderType}_${appointmentId}`;
}
