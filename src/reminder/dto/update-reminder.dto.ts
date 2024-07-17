import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsInt, IsOptional, IsString } from 'class-validator';

export class UpdateReminderDto {
  @IsOptional()
  @IsString()
  @ApiProperty({ example: 'Reminder title', required: false })
  title?: string;

  @IsOptional()
  @IsString()
  @ApiProperty({ example: 'Reminder description', required: false })
  description?: string;

  @IsOptional()
  @IsDateString()
  @ApiProperty({ example: '2021-09-01T00:00:00.000Z', required: false })
  scheduled?: Date;
}
