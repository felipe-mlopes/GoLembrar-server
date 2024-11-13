import { Logger, Module } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { CacheService } from '../cache/cache.service';
import { PrismaService } from '../prisma/prisma.service';
import { ReminderController } from './reminder.controller';
import { ReminderService } from './reminder.service';

@Module({
  controllers: [ReminderController],
  providers: [ReminderService, PrismaService, JwtService, CacheService, Logger],
  exports: [ReminderService],
})
export class ReminderModule {}
