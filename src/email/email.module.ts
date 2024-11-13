import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { EmailListenerController } from '../events/email-listener/email-listener.controller';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  imports: [ConfigModule.forRoot()],
  controllers: [EmailListenerController],
  providers: [PrismaService, ConfigService],
  exports: [],
})
export class EmailModule {}
