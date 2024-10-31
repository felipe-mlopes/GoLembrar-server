import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { EmailListenerController } from '../events/email-listener/email-listener.controller';
import { PrismaService } from '../prisma/prisma.service';
import { EmailService } from './email.service';

@Module({
  imports: [ConfigModule.forRoot()],
  controllers: [EmailListenerController],
  providers: [EmailService, PrismaService, ConfigService],
  exports: [EmailService],
})
export class EmailModule {}
