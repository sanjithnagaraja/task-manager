import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { CreateTaskDto } from './create-task.dto';

const check = (payload: Record<string, unknown>) =>
  validate(plainToInstance(CreateTaskDto, payload));

describe('CreateTaskDto validation', () => {
  it('accepts a minimal valid payload', async () => {
    expect(await check({ title: 'Ship it' })).toHaveLength(0);
  });

  it('accepts a full valid payload', async () => {
    const errors = await check({
      title: 'Ship it',
      description: 'Before Friday',
      status: 'IN_PROGRESS',
      dueDate: '2026-12-01',
    });
    expect(errors).toHaveLength(0);
  });

  it('rejects a missing title', async () => {
    const errors = await check({});
    expect(errors.map((e) => e.property)).toContain('title');
  });

  it('rejects a whitespace-only title (trimmed to empty)', async () => {
    const errors = await check({ title: '   ' });
    expect(errors.map((e) => e.property)).toContain('title');
  });

  it('rejects an invalid status', async () => {
    const errors = await check({ title: 'x', status: 'BLOCKED' });
    expect(errors.map((e) => e.property)).toContain('status');
  });

  it('rejects an invalid dueDate', async () => {
    const errors = await check({ title: 'x', dueDate: 'tomorrow' });
    expect(errors.map((e) => e.property)).toContain('dueDate');
  });
});
