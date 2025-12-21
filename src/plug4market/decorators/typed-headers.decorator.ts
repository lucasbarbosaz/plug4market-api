// decorators/typed-headers.decorator.ts
import { createParamDecorator, ExecutionContext, BadRequestException } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';

export const TypedHeaders = createParamDecorator(
  async (value: any, ctx: ExecutionContext) => {
    const headers = ctx.switchToHttp().getRequest().headers;

    const dto = plainToInstance(value, headers, { excludeExtraneousValues: true });

    const errors = await validate(dto);

    if (errors.length > 0) {
      const messages = errors.map(err => Object.values(err.constraints || {})).flat();
      throw new BadRequestException(messages);
    }

    return dto;
  },
);