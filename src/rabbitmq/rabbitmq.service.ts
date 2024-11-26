import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import amqp from 'amqplib';

@Injectable()
export class RabbitMQService implements OnModuleInit, OnModuleDestroy {
  constructor(private configService: ConfigService) {}

  private connection: amqp.Connection;
  private channel: amqp.Channel;
  private readonly logger = new Logger(RabbitMQService.name);
  private readonly rabbitmqUrl = this.configService.get<string>('RABBITMQ_URL');

  async onModuleInit() {
    await this.connect();
  }

  async connect() {
    try {
      this.connection = await amqp.connect(this.rabbitmqUrl);
      this.channel = await this.connection.createChannel();
      this.logger.log('Connected to RabbitMQ');
    } catch (error) {
      this.logger.error(
        `Failed to connect to RabbitMQ: ${this.rabbitmqUrl}`,
        error,
      );
    }
  }

  public getChannel(): amqp.Channel {
    if (!this.channel) {
      this.logger.error('RabbitMQ channel is not established yet');
    }
    return this.channel;
  }

  public async sendToQueue(queue: string, message: Buffer) {
    if (!this.channel) {
      this.logger.error('RabbitMQ channel is not established');
      return;
    }

    await this.channel.assertQueue(queue, { durable: true });
    this.channel.sendToQueue(queue, message);
    this.logger.debug(`Message sent to queue: ${queue}`);
  }

  public async consumeQueue<T>(queue: string, timeout = 1000): Promise<T[]> {
    const results: T[] = [];

    if (!this.channel) {
      this.logger.error('RabbitMQ channel is not established');
      return;
    }

    await this.channel.assertQueue(queue, { durable: true });

    return new Promise((resolve) => {
      setTimeout(() => {
        this.channel.cancel('consumer_tag');
        resolve(results);
      }, timeout);

      this.channel.consume(
        queue,
        async (msg) => {
          if (msg !== null) {
            try {
              const parsedMessage: T = JSON.parse(msg.content.toString());
              results.push(parsedMessage);
              this.channel.ack(msg);
            } catch (error) {
              this.logger.error('Error processing message', error);
              this.channel.nack(msg);
            }
          }
        },
        { noAck: false, consumerTag: 'consumer_tag' },
      );
    });
  }

  async onModuleDestroy() {
    if (this.channel) {
      await this.channel.close();
    }
    if (this.connection) {
      await this.connection.close();
    }
  }
}
