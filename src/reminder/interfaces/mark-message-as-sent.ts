import { Status } from '@prisma/client';

export interface MarkMessageAs {
  ids: number[];
  status: Status;
}
