import { NotFoundException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { Task } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { TaskStatus } from './dto/task-status.enum';
import { TasksService } from './tasks.service';

const makeTask = (overrides: Partial<Task> = {}): Task => ({
  id: 'task-1',
  title: 'Write tests',
  description: null,
  status: TaskStatus.TODO,
  dueDate: null,
  createdAt: new Date('2026-01-01T00:00:00.000Z'),
  ...overrides,
});

describe('TasksService', () => {
  let service: TasksService;

  const prismaMock = {
    task: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  };

  beforeEach(async () => {
    jest.resetAllMocks();

    const moduleRef = await Test.createTestingModule({
      providers: [
        TasksService,
        { provide: PrismaService, useValue: prismaMock },
      ],
    }).compile();

    service = moduleRef.get(TasksService);
  });

  describe('findAll', () => {
    it('returns newest first with no filter by default', async () => {
      const tasks = [makeTask()];
      prismaMock.task.findMany.mockResolvedValue(tasks);

      await expect(service.findAll()).resolves.toEqual(tasks);
      expect(prismaMock.task.findMany).toHaveBeenCalledWith({
        where: undefined,
        orderBy: { createdAt: 'desc' },
      });
    });

    it('filters by status', async () => {
      prismaMock.task.findMany.mockResolvedValue([]);

      await service.findAll({ status: TaskStatus.DONE });

      expect(prismaMock.task.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: { status: TaskStatus.DONE } }),
      );
    });

    it('sorts by due date ascending with nulls last by default', async () => {
      prismaMock.task.findMany.mockResolvedValue([]);

      await service.findAll({ sortBy: 'dueDate' });

      expect(prismaMock.task.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          orderBy: { dueDate: { sort: 'asc', nulls: 'last' } },
        }),
      );
    });

    it('respects an explicit descending order', async () => {
      prismaMock.task.findMany.mockResolvedValue([]);

      await service.findAll({ sortBy: 'dueDate', order: 'desc' });

      expect(prismaMock.task.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          orderBy: { dueDate: { sort: 'desc', nulls: 'last' } },
        }),
      );
    });
  });

  describe('findOne', () => {
    it('returns the task when it exists', async () => {
      const task = makeTask();
      prismaMock.task.findUnique.mockResolvedValue(task);

      await expect(service.findOne('task-1')).resolves.toBe(task);
    });

    it('throws NotFoundException when it does not exist', async () => {
      prismaMock.task.findUnique.mockResolvedValue(null);

      await expect(service.findOne('missing')).rejects.toBeInstanceOf(
        NotFoundException,
      );
    });
  });

  describe('create', () => {
    it('creates a task and converts dueDate to a Date', async () => {
      const created = makeTask({ title: 'New task' });
      prismaMock.task.create.mockResolvedValue(created);

      const result = await service.create({
        title: 'New task',
        dueDate: '2026-12-01',
      });

      expect(result).toBe(created);
      expect(prismaMock.task.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          title: 'New task',
          dueDate: new Date('2026-12-01'),
        }),
      });
    });
  });

  describe('update', () => {
    it('updates an existing task', async () => {
      const updated = makeTask({ status: TaskStatus.DONE });
      prismaMock.task.findUnique.mockResolvedValue(makeTask());
      prismaMock.task.update.mockResolvedValue(updated);

      const result = await service.update('task-1', {
        status: TaskStatus.DONE,
      });

      expect(result).toBe(updated);
      expect(prismaMock.task.update).toHaveBeenCalledWith({
        where: { id: 'task-1' },
        data: expect.objectContaining({ status: TaskStatus.DONE }),
      });
    });

    it('allows clearing the due date with null', async () => {
      prismaMock.task.findUnique.mockResolvedValue(makeTask());
      prismaMock.task.update.mockResolvedValue(makeTask());

      await service.update('task-1', { dueDate: null });

      expect(prismaMock.task.update).toHaveBeenCalledWith({
        where: { id: 'task-1' },
        data: expect.objectContaining({ dueDate: null }),
      });
    });

    it('throws NotFoundException and does not write when the task is missing', async () => {
      prismaMock.task.findUnique.mockResolvedValue(null);

      await expect(
        service.update('missing', { title: 'x' }),
      ).rejects.toBeInstanceOf(NotFoundException);
      expect(prismaMock.task.update).not.toHaveBeenCalled();
    });
  });

  describe('remove', () => {
    it('deletes an existing task', async () => {
      prismaMock.task.findUnique.mockResolvedValue(makeTask());
      prismaMock.task.delete.mockResolvedValue(makeTask());

      await expect(service.remove('task-1')).resolves.toBeUndefined();
      expect(prismaMock.task.delete).toHaveBeenCalledWith({
        where: { id: 'task-1' },
      });
    });

    it('throws NotFoundException and does not delete when missing', async () => {
      prismaMock.task.findUnique.mockResolvedValue(null);

      await expect(service.remove('missing')).rejects.toBeInstanceOf(
        NotFoundException,
      );
      expect(prismaMock.task.delete).not.toHaveBeenCalled();
    });
  });
});
