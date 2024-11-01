import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class EmailService {
  constructor(
    // private readonly mailerService: MailerService,
    // private readonly mailtrapService: MailtrapService,
    private readonly configService: ConfigService,
  ) {}

  async sendEmail(
    email: string,
    subject: string,
    context: string,
  ): Promise<boolean> {
    try {
      console.log(email, subject, context);
      // await this.mailerService.sendMail({
      //   to: email,
      //   from: this.configService.get('EMAIL_AUTH_USER'),
      //   subject: subject,
      //   html: `<b>${context}</b>`,
      // });
      // console.log('Email sent successfully by SMTP');
      return true;
    } catch (smtpError) {
      console.log('SMTP error:', smtpError);
      try {
        // await this.mailtrapService.sendEmail(email, subject, context);
        console.log('Email sent successfully by API');
        return true;
      } catch (apiError) {
        console.log('API error:', apiError);
        return false;
      }
    }
  }
}
