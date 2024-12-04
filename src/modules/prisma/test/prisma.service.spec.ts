import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../prisma.service';
import { ConfigService } from '@nestjs/config';
import { PrismaClient } from '@prisma/client';

describe('PrismaService', () => {
  let prismaService: PrismaService;
  let configService: ConfigService;

  const mockConfigService = {
    get: jest.fn((key: string) => {
      if (key === 'DATABASE_URL') {
        return 'mysql://user:password@localhost:3306/mydb';
      }
    }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PrismaService,
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    prismaService = module.get<PrismaService>(PrismaService);
    configService = module.get<ConfigService>(ConfigService);
  });

  it('should be defined', () => {
    expect(prismaService).toBeDefined();
  });

  it('should get the database URL from ConfigService', () => {
    expect(configService.get).toHaveBeenCalledWith('DATABASE_URL');
    expect(prismaService).toBeInstanceOf(PrismaClient);
  });

  describe('onModuleInit', () => {
    it('should connect to the database', async () => {
      const connectSpy = jest
        .spyOn(prismaService, '$connect')
        .mockResolvedValue();

      await prismaService.onModuleInit();

      expect(connectSpy).toHaveBeenCalled();
    });
  });

  describe('onModuleDestroy', () => {
    it('should disconnect from the database', async () => {
      const disconnectSpy = jest
        .spyOn(prismaService, '$disconnect')
        .mockResolvedValue();

      await prismaService.onModuleDestroy();

      expect(disconnectSpy).toHaveBeenCalled();
    });
  });
});
