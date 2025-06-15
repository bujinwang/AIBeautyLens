import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtStrategy } from './strategies/jwt.strategy';
import { LocalStrategy } from './strategies/local.strategy';
import { CliniciansModule } from '../clinicians/clinicians.module';
import { PatientsModule } from '../patients/patients.module'; // Import PatientsModule

@Module({
 imports: [
   CliniciansModule, // Replace UsersModule with CliniciansModule
   PatientsModule, // Add PatientsModule
   PassportModule,
    JwtModule.registerAsync({
      imports: [ConfigModule], // Ensures ConfigService is available for this factory
      useFactory: async (configService: ConfigService) => {
        const secret = configService.get<string>('JWT_SECRET');
        console.log(`[AuthModule] JWT_SECRET from ConfigService: ${secret ? 'Loaded' : 'NOT LOADED'}`); // Diagnostic log
        if (!secret) {
          throw new Error('[AuthModule] FATAL: JWT_SECRET is undefined. Check .env and ConfigModule setup.');
        }
        const expiresIn = configService.get<string>('JWT_EXPIRATION_TIME') || '60m';
        console.log(`[AuthModule] JWT expiresIn: ${expiresIn}`); // Diagnostic log
        return {
          secret: secret,
          signOptions: { expiresIn: expiresIn },
        };
      },
      inject: [ConfigService],
    }),
    ConfigModule, // Re-adding ConfigModule here. Even if global, ensuring it's explicitly
                  // available to AuthModule might help resolve DI for JwtModule.registerAsync.
  ],
  providers: [AuthService, LocalStrategy, JwtStrategy, ConfigService],
  controllers: [AuthController],
  exports: [AuthService],
})
export class AuthModule {}
