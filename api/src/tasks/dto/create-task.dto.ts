import { Transform } from 'class-transformer';
import {
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';
import { TaskStatus } from './task-status.enum';

export class CreateTaskDto {
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  title!: string;

  /** `null` is accepted so PATCH can clear the field. */
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  description?: string | null;

  @IsOptional()
  @IsEnum(TaskStatus)
  status?: TaskStatus;

  /** ISO 8601 date or datetime (e.g. "2026-12-01" or "2026-12-01T09:00:00Z"). `null` clears it. */
  @IsOptional()
  @IsDateString()
  dueDate?: string | null;
}
