import { Test, TestingModule } from '@nestjs/testing';
import { TreatmentsController } from '../../../src/modules/treatments/treatments.controller';
import { TreatmentsService } from '../../../src/modules/treatments/treatments.service';

const mockTreatmentsService = {
  findAllTreatmentTypes: jest.fn(),
  updateTreatmentType: jest.fn(),
  removeTreatmentType: jest.fn(),
};

describe('TreatmentsController (integration)', () => {
  let controller: TreatmentsController;
  let service: typeof mockTreatmentsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TreatmentsController],
      providers: [
        { provide: TreatmentsService, useValue: mockTreatmentsService },
      ],
    }).compile();

    controller = module.get<TreatmentsController>(TreatmentsController);
    service = module.get(TreatmentsService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findAllTreatmentTypes', () => {
    it('should return an array of treatment types', async () => {
      const mockTypes = [
        { id: 'id1', name: 'Type1', description: 'desc', isActive: true, createdAt: new Date(), updatedAt: new Date() },
      ];
      service.findAllTreatmentTypes.mockResolvedValue(mockTypes);
      const result = await controller.findAllTreatmentTypes();
      expect(result).toEqual(mockTypes);
      expect(service.findAllTreatmentTypes).toHaveBeenCalled();
    });
  });

  describe('updateTreatmentType', () => {
    it('should update and return a treatment type', async () => {
      const id = 'id1';
      const dto = { name: 'UpdatedType' };
      const mockType = { id, name: 'UpdatedType', description: 'desc', isActive: true, createdAt: new Date(), updatedAt: new Date() };
      service.updateTreatmentType = jest.fn().mockResolvedValue(mockType);
      const result = await controller.updateTreatmentType(id, dto as any);
      expect(result).toEqual(mockType);
      expect(service.updateTreatmentType).toHaveBeenCalledWith(id, dto);
    });
  });

  describe('removeTreatmentType', () => {
    it('should call service to deactivate a treatment type', async () => {
      const id = 'id1';
      service.removeTreatmentType = jest.fn().mockResolvedValue(undefined);
      await expect(controller.removeTreatmentType(id)).resolves.toBeUndefined();
      expect(service.removeTreatmentType).toHaveBeenCalledWith(id);
    });
  });
}); 