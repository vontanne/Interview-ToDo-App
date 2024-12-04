import { validate } from 'class-validator';
import { TodoOptionsDto } from '../dto/todo-options.dto';
import { TodoStatusEnum } from '../enum/todo-status.enum';

describe('TodoOptionsDto', () => {
  it('should pass validation with valid values', async () => {
    const dto = new TodoOptionsDto();
    dto.status = TodoStatusEnum.PENDING;
    dto.priority = 2;
    dto.page = 1;
    dto.limit = 10;

    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  it('should fail validation with invalid status', async () => {
    const dto = new TodoOptionsDto();
    dto.status = 'INVALID_STATUS' as TodoStatusEnum;

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].constraints?.isEnum).toContain(
      'status must be a valid TodoStatus',
    );
  });

  it('should fail validation with negative page', async () => {
    const dto = new TodoOptionsDto();
    dto.page = -1;

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].constraints?.min).toContain(
      'page must be greater than or equal to 1',
    );
  });

  it('should fail validation with priority out of range', async () => {
    const dto = new TodoOptionsDto();
    dto.priority = 5;

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].constraints?.max).toContain(
      'priority must be less than or equal to 3',
    );
  });
});
