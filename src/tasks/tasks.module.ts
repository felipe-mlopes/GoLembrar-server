import { Module } from '@nestjs/common';
import { CacheService } from '../cache/cache.service';
import { EmailModule } from '../email/email.module';
import { EmailConsumerModule } from '../email/queue/consumer/email-consumer.module';
import { EmailConsumerService } from '../email/queue/consumer/email-consumer.service';
import { EmailProducerModule } from '../email/queue/producer/email-producer.module';
import { EmailProducerService } from '../email/queue/producer/email-producer.service';
import { PrismaService } from '../prisma/prisma.service';
import { RabbitmqModule } from '../rabbitmq/rabbitmq.module';
import { ReminderService } from '../reminder/reminder.service';
import { TasksService } from './tasks.service';

@Module({
  imports: [
    EmailProducerModule,
    EmailConsumerModule,
    EmailModule,
    RabbitmqModule,
  ],
  providers: [
    TasksService,
    ReminderService,
    EmailProducerService,
    EmailConsumerService,
    PrismaService,
    CacheService,
  ],
  exports: [TasksService],
})
export class TasksModule {}
