import { MAILER_OPTIONS, MailerService } from '@nestjs-modules/mailer';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { vi } from 'vitest';
import { CacheService } from '../cache/cache.service';
import { EmailProducerService } from '../email/queue/producer/email-producer.service';
import { PrismaService } from '../prisma/prisma.service';
import { RabbitMQService } from '../rabbitmq/rabbitmq.service';
import { ReminderService } from '../reminder/reminder.service';
import { TasksService } from './tasks.service';

describe('TasksService', () => {
  let service: TasksService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ConfigService,
        TasksService,
        ReminderService,
        EmailProducerService,
        PrismaService,
        CacheService,
        { provide: CACHE_MANAGER, useValue: {} },
        RabbitMQService,
        { provide: MAILER_OPTIONS, useValue: {} },
        {
          provide: MailerService,
          useValue: {
            sendMail: vi.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<TasksService>(TasksService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
