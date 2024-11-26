import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Test, TestingModule } from '@nestjs/testing';
import { vi } from 'vitest';
import { CacheService } from '../cache/cache.service';
import { PrismaService } from '../prisma/prisma.service';
import { ReminderController } from './reminder.controller';
import { ReminderService } from './reminder.service';

describe('ReminderController', () => {
  let controller: ReminderController;
  const mockCacheManager = {
    get: vi.fn(),
    set: vi.fn(),
    del: vi.fn(),
    reset: vi.fn(),
    store: {
      keys: vi.fn().mockResolvedValue([]),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ReminderController],
      providers: [
        PrismaService,
        ReminderService,
        CacheService,
        { provide: CACHE_MANAGER, useValue: mockCacheManager },
      ],
    }).compile();

    controller = module.get<ReminderController>(ReminderController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
