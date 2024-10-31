import { Module } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AccessTokenGuard } from '../auth/guards/access-token/access-token.guard';
import { EmailModule } from '../email/email.module';
import { EmailService } from '../email/email.service';
import { MailtrapService } from '../email/mailtrap/mailtrap.service';
import { PrismaService } from '../prisma/prisma.service';
import { RabbitmqModule } from '../rabbitmq/rabbitmq.module';
import { UserController } from './user.controller';
import { UserService } from './user.service';

@Module({
  imports: [RabbitmqModule, EmailModule],
  controllers: [UserController],
  providers: [
    UserService,
    PrismaService,
    AccessTokenGuard,
    JwtService,
    EmailService,
    MailtrapService,
  ],
  exports: [UserService],
})
export class UserModule {}
