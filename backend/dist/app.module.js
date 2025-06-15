"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const app_controller_1 = require("./app.controller");
const app_service_1 = require("./app.service");
const auth_module_1 = require("./modules/auth/auth.module");
const prisma_module_1 = require("./prisma/prisma.module");
const logging_module_1 = require("./common/modules/logging.module");
const gemini_module_1 = require("./modules/gemini/gemini.module");
const images_module_1 = require("./modules/images/images.module");
const treatments_module_1 = require("./modules/treatments/treatments.module");
const throttler_1 = require("@nestjs/throttler");
const core_1 = require("@nestjs/core");
const patients_module_1 = require("./modules/patients/patients.module");
const organizations_module_1 = require("./modules/organizations/organizations.module");
const clinician_patient_assignments_module_1 = require("./modules/clinician-patient-assignments/clinician-patient-assignments.module");
const clinicians_module_1 = require("./modules/clinicians/clinicians.module");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({
                isGlobal: true,
                envFilePath: '.env',
            }),
            throttler_1.ThrottlerModule.forRoot([{
                    ttl: 60,
                    limit: 10,
                }]),
            logging_module_1.LoggingModule,
            prisma_module_1.PrismaModule,
            auth_module_1.AuthModule,
            clinicians_module_1.CliniciansModule,
            patients_module_1.PatientsModule,
            organizations_module_1.OrganizationsModule,
            clinician_patient_assignments_module_1.ClinicianPatientAssignmentsModule,
            treatments_module_1.TreatmentsModule,
            images_module_1.ImagesModule,
            gemini_module_1.GeminiModule,
        ],
        controllers: [app_controller_1.AppController],
        providers: [
            app_service_1.AppService,
            core_1.Reflector,
        ],
    })
], AppModule);
