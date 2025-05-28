import { Test, TestingModule } from '@nestjs/testing';
import { TreatmentsService } from '../../../src/modules/treatments/treatments.service';
import { PrismaService } from '../../../src/prisma/prisma.service';
import { ConflictException } from '@nestjs/common';

const mockPrismaService = {
  treatmentType: {
    create: jest.fn(),
    findMany: jest.fn(),
    findUnique: jest.fn(),
    update: jest.fn(),
  },
  treatmentRecord: {
    create: jest.fn(),
    findMany: jest.fn(),
    findUnique: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
};

describe('TreatmentsService', () => {
  let service: TreatmentsService;
  let prisma: typeof mockPrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TreatmentsService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<TreatmentsService>(TreatmentsService);
    prisma = module.get(PrismaService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createTreatmentType', () => {
    it('should create and return a treatment type', async () => {
      const dto = { name: 'Type1', description: 'desc' };
      const mockType = { ...dto, id: 'id1', isActive: true, createdAt: new Date(), updatedAt: new Date() };
      prisma.treatmentType.create.mockResolvedValue(mockType);
      const result = await service.createTreatmentType(dto as any);
      expect(result.name).toBe('Type1');
      expect(prisma.treatmentType.create).toHaveBeenCalledWith({ data: dto });
    });

    it('should throw ConflictException on duplicate name', async () => {
      const dto = { name: 'Type1', description: 'desc' };
      const error = { code: 'P2002' };
      prisma.treatmentType.create.mockRejectedValue(error);
      await expect(service.createTreatmentType(dto as any)).rejects.toThrow(ConflictException);
    });
  });

  describe('updateTreatmentType', () => {
    it('should update and return a treatment type', async () => {
      const id = 'id1';
      const dto = { name: 'UpdatedType' };
      const mockType = { id, name: 'UpdatedType', description: 'desc', isActive: true, createdAt: new Date(), updatedAt: new Date() };
      prisma.treatmentType.update.mockResolvedValue(mockType);
      const result = await service.updateTreatmentType(id, dto as any);
      expect(result.name).toBe('UpdatedType');
      expect(prisma.treatmentType.update).toHaveBeenCalledWith({ where: { id }, data: dto });
    });
    it('should throw NotFoundException if not found', async () => {
      const id = 'id404';
      const dto = { name: 'UpdatedType' };
      const error = { code: 'P2025' };
      prisma.treatmentType.update.mockRejectedValue(error);
      await expect(service.updateTreatmentType(id, dto as any)).rejects.toThrow('Treatment type with ID "id404" not found');
    });
  });

  describe('removeTreatmentType', () => {
    it('should deactivate a treatment type', async () => {
      const id = 'id1';
      prisma.treatmentType.update.mockResolvedValue({});
      await expect(service.removeTreatmentType(id)).resolves.toBeUndefined();
      expect(prisma.treatmentType.update).toHaveBeenCalledWith({ where: { id }, data: { isActive: false } });
    });
    it('should throw NotFoundException if not found', async () => {
      const id = 'id404';
      const error = { code: 'P2025' };
      prisma.treatmentType.update.mockRejectedValue(error);
      await expect(service.removeTreatmentType(id)).rejects.toThrow('Treatment type with ID "id404" not found');
    });
  });

  describe('createTreatmentRecord', () => {
    it('should create and return a treatment record', async () => {
      const dto = {
        date: new Date().toISOString(),
        notes: 'note',
        totalPrice: 100,
        currency: 'USD',
        patientId: 'pid',
        treatmentTypeId: 'tid',
      };
      const clinicianId = 'cid';
      const mockRecord = {
        ...dto,
        id: 'rid',
        clinicianId,
        patientId: dto.patientId,
        treatmentTypeId: dto.treatmentTypeId,
        treatmentType: { id: 'tid', name: 'Type', description: '', isActive: true, createdAt: new Date(), updatedAt: new Date() },
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      prisma.treatmentRecord.create.mockResolvedValue(mockRecord);
      const result = await service.createTreatmentRecord(dto as any, clinicianId);
      expect(result.id).toBe('rid');
      expect(prisma.treatmentRecord.create).toHaveBeenCalled();
    });
  });
}); 