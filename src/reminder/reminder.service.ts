import { CACHE_MANAGER } from '@nestjs/cache-manager';
import {
  BadRequestException,
  ForbiddenException,
  Inject,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { CacheService } from '../cache/cache.service';
import { getDatesInISO } from '../common/utils/getDatesInISO';
import { isValidScheduledDate } from '../common/utils/isValidScheduledDate';
import { isWithinCurrentDay } from '../common/utils/isWithinCurrentDay';
import { PrismaService } from '../prisma/prisma.service';
import { CreateReminderDto } from './dto/create-reminder.dto';
import { ReminderResponse } from './dto/scheduled-reminders.response.dto';
import { UpdateReminderDto } from './dto/update-reminder.dto';
import { MarkMessageAs } from './interfaces/mark-message-as-sent';

@Injectable()
export class ReminderService {
  constructor(
    private readonly prismaService: PrismaService,

    @Inject(CACHE_MANAGER) private readonly cacheService: CacheService,
  ) {}

  private readonly logger = new Logger(ReminderService.name);

  private readonly scheduledReminderTimeLimit = 30;

  public async getReminderById(id: string) {
    const reminder = await this.prismaService.reminder.findUnique({
      where: { id: id },
      include: {
        usersToReminder: {
          include: {
            contact: {
              select: {
                id: true,
                name: true,
                channel: true,
              },
            },
          },
        },
      },
    });

    if (!reminder) {
      throw new NotFoundException('Não foi possível encontrar o lembrete');
    }

    return reminder;
  }

  public async getUserReminders(userId: string) {
    return await this.prismaService.reminder.findMany({
      where: {
        ownerId: userId,
      },
      include: {
        usersToReminder: {
          include: {
            contact: {
              select: {
                id: true,
                name: true,
                channel: true,
              },
            },
          },
        },
      },
    });
  }

  // Busca os lembretes previamente agendados para o dia corrente
  public async getScheduledRemindersForToday() {
    const { startOfDay, endOfDay } = getDatesInISO();

    const firstHourOfDay = new Date(startOfDay);
    const lastHourOfDay = new Date(endOfDay);

    const startOfDayOnDb = Math.floor(firstHourOfDay.getTime() / 1000);
    const endOfDayOnDb = Math.floor(lastHourOfDay.getTime() / 1000);

    const startOfDayFormmatted = firstHourOfDay.toISOString();

    const scheduledReminders: ReminderResponse[] = await this.prismaService
      .$queryRaw`
      SELECT
        utr.id AS id,
        utr."reminderId" AS message_id,
        r.title AS message_title,
        r.description AS message_description,
        utr.status AS message_status,
        utr."createdAt" AS message_created_at,
        r.scheduled AS message_scheduled,
        utr."contactId" AS contact_id,
        c.identify AS contact_identify,
        c.channel AS contact_channel,
        u.email AS owner_email,
        r."ownerId" AS owner_id
      FROM
        "users_to_reminders" AS utr
      INNER JOIN
        contacts AS c ON utr."contactId" = c.id
      INNER JOIN
        reminders AS r ON utr."reminderId" = r.id
      INNER JOIN
        users AS u ON r."ownerId" = u.id
      WHERE
        EXTRACT(EPOCH FROM r.scheduled) BETWEEN ${startOfDayOnDb} AND ${endOfDayOnDb}
        AND utr.status = 'PENDING'
        AND r."isActivated" = true
      ORDER BY
        r.scheduled, c.channel;
      `;

    // Salva cada lembrete pela data/horário, o canal e o ID no cache
    for (const scheduledReminder of scheduledReminders) {
      const reminderDate = new Date(
        scheduledReminder.message_scheduled,
      ).setSeconds(0, 0);

      const date = new Date(reminderDate).toISOString();

      const key = `${date}_${scheduledReminder.contact_channel}_${scheduledReminder.id}`;

      await this.cacheService.set(
        key,
        scheduledReminder,
        24 * 60 * 60 * 1000, // TTL de 1 dia
      );
    }

    return {
      today: startOfDayFormmatted,
      reminders: scheduledReminders,
    };
  }

  public async create(reminderDto: CreateReminderDto) {
    const userToReminderConnect = reminderDto.usersToReminder.map(
      (contactId) => ({
        contactId,
      }),
    );

    // Verifica se a data de agendamento do lembrete é maior/igual que 30min do horário atual
    const validScheduledDate = isValidScheduledDate(
      reminderDto.scheduled,
      this.scheduledReminderTimeLimit,
    );

    if (!validScheduledDate) {
      throw new BadRequestException(
        'A data do agendamento deve ter 30min a frente da data atual.',
      );
    }

    const newReminder = await this.prismaService.reminder.create({
      data: {
        title: reminderDto.title,
        description: reminderDto.description,
        scheduled: reminderDto.scheduled,
        ownerId: reminderDto.ownerId,
        usersToReminder: {
          create: userToReminderConnect,
        },
      },
      include: {
        usersToReminder: {
          select: {
            id: true,
            status: true,
            contact: {
              select: {
                id: true,
                identify: true,
                channel: true,
              },
            },
          },
        },
        owner: {
          select: {
            email: true,
          },
        },
      },
    });

    // Verifica se a data de agendamento do lembrete está dentro do dia corrente
    const validWithinCurrentDay = isWithinCurrentDay(reminderDto.scheduled);

    if (validWithinCurrentDay) {
      const date = new Date(newReminder.scheduled);
      date.setSeconds(0, 0);
      const dateFormatted = new Date(date);

      for (const userToReminder of newReminder.usersToReminder) {
        const key = `${dateFormatted.toISOString()}_${userToReminder.contact.channel}_${userToReminder.id}`;
        const value: ReminderResponse = {
          id: userToReminder.id,
          message_id: newReminder.id,
          message_title: newReminder.title,
          message_description: newReminder.description,
          message_status: userToReminder.status,
          message_created_at: newReminder.createdAt,
          message_scheduled: newReminder.scheduled,
          owner_email: newReminder.owner.email,
          contact_id: userToReminder.contact.id,
          contact_identify: userToReminder.contact.identify,
          contact_channel: userToReminder.contact.channel,
        };

        await this.cacheService.set(
          key,
          value,
          24 * 60 * 60 * 1000, // TTL de 1 dia
        );
      }
    }

    return newReminder;
  }

  /**
   * Updates a reminder with the data.
   *
   * @param {string} id - The ID of the reminder to be updated.
   * @param {UpdateReminderDto} reminderDto - The DTO containing the update data.
   * @returns {Promise<Reminder>} - A promise that resolves when the update is complete.
   */
  public async update(id: string, reminderDto: UpdateReminderDto) {
    if (Object.keys(reminderDto).length === 0) {
      throw new BadRequestException('Nenhum campo foi atualizado');
    }

    // Verifica se a data de agendadamento do lembrete é maior/igual que 30min do horário atual
    const validScheduledDate = isValidScheduledDate(
      reminderDto.scheduled,
      this.scheduledReminderTimeLimit,
    );

    if (!validScheduledDate) {
      throw new BadRequestException(
        'A data do agendamento deve ter 30min a frente da data atual.',
      );
    }

    const reminder = await this.prismaService.reminder.findUnique({
      where: {
        id,
      },
      include: {
        usersToReminder: {
          select: {
            id: true,
            status: true,
            contact: {
              select: {
                id: true,
                identify: true,
                channel: true,
              },
            },
          },
        },
      },
    });

    if (!reminder) {
      throw new NotFoundException('Não foi possível encontrar o lembrete');
    }

    // Verifica se os contatos informados foram alterados, caso sim, se eles existem no banco
    if (reminderDto.usersToReminder) {
      const existingUserContactIds = reminder.usersToReminder.map(
        (user) => user.contact.id,
      );

      const areEquals =
        reminderDto.usersToReminder.length === existingUserContactIds.length &&
        reminderDto.usersToReminder.every((contactId) =>
          existingUserContactIds.includes(contactId),
        );

      if (!areEquals) {
        const validContacts = await this.prismaService.contact.findMany({
          where: {
            id: {
              in: reminderDto.usersToReminder,
            },
          },
          select: {
            id: true,
          },
        });

        const validContactIds = validContacts.map((contact) => contact.id);

        const invalidContacts = reminderDto.usersToReminder.filter(
          (id) => !validContactIds.includes(id),
        );

        if (invalidContacts.length > 0) {
          throw new BadRequestException(
            'Não é possível atualizar um lembrete inserindo um contato inexistente',
          );
        }
      }
    }

    const reminderUpdated = await this.prismaService.reminder.update({
      where: { id },
      data: {
        title: reminderDto.title,
        description: reminderDto.description,
        scheduled: reminderDto.scheduled,
        ownerId: reminderDto.ownerId,
        usersToReminder: {
          deleteMany: {},
          create: reminderDto.usersToReminder?.map((id) => ({
            contact: { connect: { id } },
          })),
        },
      },
      include: {
        usersToReminder: {
          select: {
            id: true,
            status: true,
            contact: {
              select: {
                id: true,

                identify: true,
                channel: true,
              },
            },
          },
        },
        owner: {
          select: {
            email: true,
          },
        },
      },
    });

    // Verifica se a data de agendamento do lembrete está dentro do dia corrente
    const validWithinCurrentDay = isWithinCurrentDay(reminderDto.scheduled);

    if (validWithinCurrentDay) {
      const oldDate = new Date(reminder.scheduled);
      oldDate.setSeconds(0, 0);
      const oldDateFormatted = new Date(oldDate);

      // Exclui do cache o lembrete salvo anteriormente
      for (const userToReminder of reminder.usersToReminder) {
        const key = `${oldDateFormatted.toISOString()}_${userToReminder.contact.channel}_${userToReminder.id}`;

        await this.cacheService.del(key);
      }

      const date = new Date(reminderUpdated.scheduled);
      date.setSeconds(0, 0);
      const dateFormatted = new Date(date);

      // Grava no cache o lembrete alterado
      for (const userToReminderUpdated of reminderUpdated.usersToReminder) {
        const key = `${dateFormatted.toISOString()}_${userToReminderUpdated.contact.channel}_${userToReminderUpdated.id}`;
        const value: ReminderResponse = {
          id: userToReminderUpdated.id,
          message_id: reminderUpdated.id,
          message_title: reminderUpdated.title,
          message_description: reminderUpdated.description,
          message_status: userToReminderUpdated.status,
          message_created_at: reminderUpdated.createdAt,
          message_scheduled: reminderUpdated.scheduled,
          owner_email: reminderUpdated.owner.email,
          contact_id: userToReminderUpdated.contact.id,
          contact_identify: userToReminderUpdated.contact.identify,
          contact_channel: userToReminderUpdated.contact.channel,
        };

        await this.cacheService.set(
          key,
          value,
          24 * 60 * 60 * 1000, // TTL de 1 dia
        );
      }
    }

    return reminderUpdated;
  }

  public async remove(reminderId: string, userId: string) {
    const reminder = await this.prismaService.reminder.findUnique({
      where: { id: reminderId, ownerId: userId },
      select: { id: true, ownerId: true },
    });

    if (!reminder) {
      throw new NotFoundException('Não foi possível encontrar o lembrete');
    }

    if (reminder.ownerId !== userId) {
      throw new ForbiddenException(
        'Você não tem permissão para remover este lembrete',
      );
    }

    await this.prismaService.reminder.delete({
      where: { id: reminderId },
      include: {
        usersToReminder: true,
      },
    });

    return true;
  }

  public async removeAll(userId: string) {
    const reminders = await this.prismaService.reminder.findMany({
      where: { ownerId: userId },
      select: { id: true },
    });

    if (reminders.length === 0) {
      throw new NotFoundException('Nenhum lembrete encontrado');
    }

    // dletando a tabela usersToReminder associada com o reminder
    await this.prismaService.usersToReminder.deleteMany({
      where: {
        reminderId: { in: reminders.map((reminder) => reminder.id) },
      },
    });

    // deletando o reminder
    await this.prismaService.reminder.deleteMany({
      where: { ownerId: userId },
    });

    return true;
  }

  public async changeAllMessageStatus(props: MarkMessageAs) {
    await this.prismaService.usersToReminder.updateMany({
      where: {
        id: {
          in: props.ids,
        },
      },
      data: {
        status: props.status,
      },
    });
  }
}
