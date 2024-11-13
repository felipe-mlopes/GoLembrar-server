import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { EmailProducerService } from '../email/queue/producer/email-producer.service';
import { ReminderService } from '../reminder/reminder.service';

@Injectable()
export class TasksService implements OnModuleInit {
  constructor(
    private readonly reminderService: ReminderService,
    private readonly emailProducerService: EmailProducerService,
  ) {}

  private readonly logger = new Logger(TasksService.name);
  private delayInSendingToQueue = false;

  async onModuleInit() {
    await this.getTodayEMails();
  }

  @Cron('0 0 * * *') // Gets all messages of day, everyday
  async getTodayEMails() {
    const { today, reminders } =
      await this.reminderService.getScheduledRemindersForToday();

    this.logger.debug(
      `Number of reminders scheduled at ${today}: ${reminders.length}`,
    );
  }

  @Cron('* * * * *') // Every minute with delay of 100ms
  async sendScheduledRemindersToQueueByChannelEveryMinute() {
    const currentTime = new Date(new Date().setSeconds(0, 0)).toISOString();

    if (!this.delayInSendingToQueue) {
      this.delayInSendingToQueue = true;
      setTimeout(async () => {
        await this.executeTaskToSendEmailQueue(currentTime);
        this.delayInSendingToQueue = false; // Reset the delay execution flag
      }, 100);
    }
  }

  async executeTaskToSendEmailQueue(currentTimeFormatted: string) {
    const tasksCount =
      await this.emailProducerService.getScheduledEmailReminders(
        currentTimeFormatted,
      );

    this.logger.debug(
      `Called the send to queue routine at: ${currentTimeFormatted} with ${tasksCount} reminder(s)`,
    );
  }
}
