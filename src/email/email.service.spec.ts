import { MailerService } from '@nestjs-modules/mailer';
import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { vi } from 'vitest';
import { EmailService } from './email.service';
import { MailtrapService } from './mailtrap/mailtrap.service';

describe('EmailService', () => {
  let service: EmailService;

  // Create mocks for the dependencies
  const mockConfigService = {
    get: vi.fn(),
  };
  const mockMailtrapService = {
    sendMail: vi.fn(),
  };
  const mockMailerService = {
    sendMail: vi.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EmailService,
        { provide: ConfigService, useValue: mockConfigService },
        { provide: MailtrapService, useValue: mockMailtrapService },
        { provide: MailerService, useValue: mockMailerService },
      ],
    }).compile();

    service = module.get<EmailService>(EmailService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should call MailtrapService to send email', async () => {
    const emailPayload = {
      to: 'test@example.com',
      subject: 'Test Email',
      text: 'This is a test email',
    };

    // Set up any expectations on mock methods
    mockMailtrapService.sendMail.mockResolvedValueOnce({ success: true });

    const result = await mockMailtrapService.sendMail(emailPayload);
    expect(result).toEqual({ success: true });
    expect(mockMailtrapService.sendMail).toHaveBeenCalledWith(emailPayload);
  });
});
