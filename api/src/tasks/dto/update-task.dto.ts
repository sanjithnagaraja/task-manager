import { PartialType } from '@nestjs/mapped-types';
import { CreateTaskDto } from './create-task.dto';

/** All fields from CreateTaskDto become optional for PATCH. */
export class UpdateTaskDto extends PartialType(CreateTaskDto) {}
