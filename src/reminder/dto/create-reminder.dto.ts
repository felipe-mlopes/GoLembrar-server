import { ApiProperty } from '@nestjs/swagger';
import {
  ArrayNotEmpty,
  ArrayUnique,
  IsArray,
  IsDateString,
  IsNotEmpty,
  IsString,
  IsUUID,
} from 'class-validator';

export class CreateReminderDto {
  @IsNotEmpty()
  @IsString()
  @ApiProperty({ example: 'Reminder title' })
  title: string;

  @IsNotEmpty()
  @IsString()
  @ApiProperty({ example: 'Reminder description' })
  description: string;

  @IsNotEmpty()
  @IsDateString()
  @ApiProperty({ example: '2021-09-01T00:00:00.000Z' })
  scheduled: Date;

  @IsNotEmpty()
  @IsArray()
  @ArrayNotEmpty()
  @ArrayUnique()
  @IsUUID('4', { each: true })
  @ApiProperty({
    example: [
      'f0b9cfd9-5987-49a6-90f7-944552bebee8',
      '11e80f14-0604-41d4-b150-337e64858fb2',
    ],
  })
  usersToReminder: string[];

  @ApiProperty({ example: 'UUID of reminder sender' })
  ownerId: string;
}
