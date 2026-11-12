import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma, Task } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { QueryTasksDto } from './dto/query-tasks.dto';
import { UpdateTaskDto } from './dto/update-task.dto';

@Injectable()
export class TasksService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Lists tasks with optional status filter and sorting.
   * Defaults to newest first. When sorting by due date, tasks without
   * a due date are always placed last.
   */
  findAll(query: QueryTasksDto = {}): Promise<Task[]> {
    const { status, sortBy = 'createdAt' } = query;
    const order = query.order ?? (sortBy === 'createdAt' ? 'desc' : 'asc');

    const orderBy: Prisma.TaskOrderByWithRelationInput =
      sortBy === 'dueDate'
        ? { dueDate: { sort: order, nulls: 'last' } }
        : { createdAt: order };

    return this.prisma.task.findMany({
      where: status ? { status } : undefined,
      orderBy,
    });
  }

  /** Returns a single task or throws a 404. */
  async findOne(id: string): Promise<Task> {
    const task = await this.prisma.task.findUnique({ where: { id } });
    if (!task) {
      throw new NotFoundException(`Task with id "${id}" not found`);
    }
    return task;
  }

  create(dto: CreateTaskDto): Promise<Task> {
    return this.prisma.task.create({
      data: {
        title: dto.title,
        description: dto.description ?? undefined,
        status: dto.status,
        dueDate: dto.dueDate ? new Date(dto.dueDate) : undefined,
      },
    });
  }

  async update(id: string, dto: UpdateTaskDto): Promise<Task> {
    await this.findOne(id); // 404 if missing

    return this.prisma.task.update({
      where: { id },
      data: {
        title: dto.title,
        description: dto.description, // undefined = untouched, null = cleared
        status: dto.status,
        dueDate:
          dto.dueDate === undefined || dto.dueDate === null
            ? dto.dueDate
            : new Date(dto.dueDate),
      },
    });
  }

  async remove(id: string): Promise<void> {
    await this.findOne(id); // 404 if missing
    await this.prisma.task.delete({ where: { id } });
  }
}
