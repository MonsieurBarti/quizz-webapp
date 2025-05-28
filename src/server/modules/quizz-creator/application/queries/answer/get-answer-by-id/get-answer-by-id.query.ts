import { z } from 'zod';
import { injectable } from 'inversify';
import { db } from '@/server/db';
import { eq } from 'drizzle-orm';
import { answer } from '@/server/db/schema';
import { AnswerNotFound } from '@/server/modules/quizz-creator/domain/errors/quizz-creator.errors';

export const GetAnswerByIdQueryProps = z.object({
  id: z.string().uuid(),
});

export type GetAnswerByIdQueryProps = z.infer<typeof GetAnswerByIdQueryProps>;

export class GetAnswerByIdQuery {
  constructor(public readonly props: GetAnswerByIdQueryProps) {}
}

@injectable()
export class GetAnswerByIdQueryHandler {
  public async execute({ props }: GetAnswerByIdQuery) {
    const result = await db.query.answer.findFirst({
      where: eq(answer.id, props.id),
    });

    if (!result) {
      throw new AnswerNotFound(props.id);
    }
    
    return result;
  }
}
