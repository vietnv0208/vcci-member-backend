import { Test, TestingModule } from '@nestjs/testing';
import { DatabaseSeederService } from './database-seeder.service';
import { PrismaService } from '../../common/prisma.service';

describe('DatabaseSeederService', () => {
  let service: DatabaseSeederService;
  let prismaService: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DatabaseSeederService,
        {
          provide: PrismaService,
          useValue: {
            $executeRawUnsafe: jest.fn(),
            category: {
              count: jest.fn(),
            },
            businessCategory: {
              count: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    service = module.get<DatabaseSeederService>(DatabaseSeederService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should check seed status', async () => {
    const mockOrgTypesCount = 7;
    const mockBusinessCategoriesCount = 123;
    
    jest.spyOn(prismaService.category, 'count').mockResolvedValue(mockOrgTypesCount);
    jest.spyOn(prismaService.businessCategory, 'count').mockResolvedValue(mockBusinessCategoriesCount);

    const status = await service.checkSeedStatus();

    expect(status).toEqual({
      organizationTypesCount: mockOrgTypesCount,
      businessCategoriesCount: mockBusinessCategoriesCount,
    });
    expect(prismaService.category.count).toHaveBeenCalledWith({
      where: {
        type: 'ORGANIZATION_TYPE',
        deleted: false,
      },
    });
    expect(prismaService.businessCategory.count).toHaveBeenCalledWith({
      where: {
        isActive: true,
      },
    });
  });

  describe('runAllSeeds', () => {
    it('should find seed files in prisma/seeds directory', async () => {
      // Mock executeRawUnsafe để không thực thi SQL
      jest.spyOn(prismaService, '$executeRawUnsafe').mockResolvedValue(0);

      const result = await service.runAllSeeds();

      // Nếu có seed files, success sẽ là true và seedsExecuted sẽ có items
      expect(result.success).toBe(true);
      expect(result.executionTime).toBeGreaterThanOrEqual(0);
      
      // Kiểm tra nếu có seed file organization_types
      if (result.seedsExecuted.length > 0) {
        expect(result.seedsExecuted).toContain('20250115_organization_types.sql');
      }
    });
  });

  describe('safeDeploymentSeed', () => {
    it('should run deployment seed and check status', async () => {
      jest.spyOn(service, 'checkSeedStatus').mockResolvedValue({
        organizationTypesCount: 7,
        businessCategoriesCount: 123,
      });
      jest.spyOn(service, 'runAllSeeds').mockResolvedValue({
        success: true,
        message: 'Success',
        seedsExecuted: [],
        errors: [],
        executionTime: 100,
      });

      const result = await service.safeDeploymentSeed();

      expect(result.success).toBe(true);
      expect(result.message).toContain('Organization types: 7');
      expect(result.message).toContain('Business categories: 123');
    });
  });
});

