import { Channel, Status } from '@prisma/client';

export interface ReminderResponse {
  id: number;
  message_id: string;
  message_title: string;
  message_description: string;
  message_status: Status;
  message_created_at: string | Date;
  message_scheduled: string | Date;
  owner_email: string;
  contact_id: string;
  contact_identify: string;
  contact_channel: Channel;
}
