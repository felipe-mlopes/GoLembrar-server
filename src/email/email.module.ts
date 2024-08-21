import { Module } from '@nestjs/common';
import { EmailScheduledService } from './email.service';
import { EmailController } from './email.controller';
import { PrismaService } from '../prisma/prisma.service';
import { CacheService } from '../cache/cache.service';
import { EmailModule } from '../../consumer-queue-email/email/email.module';
import { RabbitmqModule } from '../rabbitmq/rabbitmq.module';

@Module({
  imports: [EmailModule, RabbitmqModule],
  controllers: [EmailController],
  providers: [EmailScheduledService, PrismaService, CacheService],
  exports: [EmailScheduledService],
})
export class EmailScheduledModule {}
