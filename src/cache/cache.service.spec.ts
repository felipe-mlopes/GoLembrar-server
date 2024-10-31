import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Test, TestingModule } from '@nestjs/testing';
import { vi } from 'vitest';
import { CacheService } from './cache.service';

describe('CacheService', () => {
  let service: CacheService;
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
      providers: [
        CacheService,
        { provide: CACHE_MANAGER, useValue: mockCacheManager },
      ],
    }).compile();

    service = module.get<CacheService>(CacheService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should get a value from cache', async () => {
    mockCacheManager.get.mockResolvedValueOnce('testValue');
    const value = await service.get<string>('testKey');
    expect(value).toBe('testValue');
    expect(mockCacheManager.get).toHaveBeenCalledWith('testKey');
  });

  it('should set a value in cache', async () => {
    await service.set<string>('testKey', 'testValue', 1000);
    expect(mockCacheManager.set).toHaveBeenCalledWith(
      'testKey',
      'testValue',
      1000,
    );
  });

  it('should delete a key from cache', async () => {
    await service.del('testKey');
    expect(mockCacheManager.del).toHaveBeenCalledWith('testKey');
  });

  it('should reset the cache', async () => {
    await service.reset();
    expect(mockCacheManager.reset).toHaveBeenCalled();
  });

  it('should get all keys from cache', async () => {
    const keys = await service.getAll();
    expect(keys).toEqual([]);
    expect(mockCacheManager.store.keys).toHaveBeenCalled();
  });
});
