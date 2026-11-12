import { IsEnum, IsIn, IsOptional } from 'class-validator';
import { TaskStatus } from './task-status.enum';

export const SORTABLE_FIELDS = ['dueDate', 'createdAt'] as const;
export type SortableField = (typeof SORTABLE_FIELDS)[number];

export class QueryTasksDto {
  @IsOptional()
  @IsEnum(TaskStatus)
  status?: TaskStatus;

  @IsOptional()
  @IsIn(SORTABLE_FIELDS)
  sortBy?: SortableField;

  @IsOptional()
  @IsIn(['asc', 'desc'])
  order?: 'asc' | 'desc';
}
