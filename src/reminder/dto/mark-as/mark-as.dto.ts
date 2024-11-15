import { ApiProperty } from '@nestjs/swagger';
import { Status } from '@prisma/client';
import { ArrayNotEmpty, IsArray, IsEnum, IsNumber } from 'class-validator';
import { MarkMessageAs } from '../../interfaces/mark-message-as-sent';

export class MarkAsDto implements MarkMessageAs {
  @ApiProperty({
    description: 'Array of reminder IDs to mark as...',
    type: [Number],
    example: [1, 2, 3],
    isArray: true,
  })
  @IsArray()
  @ArrayNotEmpty()
  @IsNumber({}, { each: true })
  ids: number[];

  @ApiProperty({
    description: 'Status to mark the reminders like...',
    enum: Status,
    example: Status.SENT,
  })
  @IsEnum(Status)
  status: Status;
}
