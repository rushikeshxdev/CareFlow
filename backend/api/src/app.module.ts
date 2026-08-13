import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { HealthModule } from './modules/health/health.module';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { PatientsModule } from './modules/patients/patients.module';
import { ProvidersModule } from './modules/providers/providers.module';
import { SpecialtiesModule } from './modules/specialties/specialties.module';
import { ServicesModule } from './modules/services/services.module';
import { AvailabilityModule } from './modules/availability/availability.module';
import { AppointmentsModule } from './modules/appointments/appointments.module';
import { CareJourneysModule } from './modules/care-journeys/care-journeys.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { AiOrchestrationModule } from './modules/ai-orchestration/ai-orchestration.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.local', '.env'],
    }),
    HealthModule,
    AuthModule,
    UsersModule,
    PatientsModule,
    ProvidersModule,
    SpecialtiesModule,
    ServicesModule,
    AvailabilityModule,
    AppointmentsModule,
    CareJourneysModule,
    NotificationsModule,
    AiOrchestrationModule,
  ],
})
export class AppModule {}
