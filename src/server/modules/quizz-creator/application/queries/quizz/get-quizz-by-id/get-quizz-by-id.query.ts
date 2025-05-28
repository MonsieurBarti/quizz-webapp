import { z } from 'zod';
import { injectable } from 'inversify';
import { db } from '@/server/db';
import { and, eq } from 'drizzle-orm';
import { quizz } from '@/server/db/schema';
import { QuizzNotFound } from '@/server/modules/quizz-creator/domain/errors/quizz-creator.errors';

export const GetQuizzByIdQueryProps = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
});

export type GetQuizzByIdQueryProps = z.infer<typeof GetQuizzByIdQueryProps>;

export class GetQuizzByIdQuery {
  constructor(public readonly props: GetQuizzByIdQueryProps) {}
}

@injectable()
export class GetQuizzByIdQueryHandler {
  public async execute({ props }: GetQuizzByIdQuery) {
    const result = await db.query.quizz.findFirst({
      where: and(eq(quizz.id, props.id), eq(quizz.createdBy, props.userId)),
    });

    if (!result) {
      throw new QuizzNotFound(props.id);
    }
    
    return result;
  }
}
