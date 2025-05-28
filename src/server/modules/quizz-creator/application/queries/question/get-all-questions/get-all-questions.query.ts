import { z } from 'zod';
import { injectable } from 'inversify';
import { db } from '@/server/db';
import { eq } from 'drizzle-orm';
import { question } from '@/server/db/schema';

export const GetAllQuestionsQueryProps = z.object({
  quizzId: z.string().uuid(),
});

export type GetAllQuestionsQueryProps = z.infer<typeof GetAllQuestionsQueryProps>;

export class GetAllQuestionsQuery {
  constructor(public readonly props: GetAllQuestionsQueryProps) {}
}

@injectable()
export class GetAllQuestionsQueryHandler {
  public async execute({ props }: GetAllQuestionsQuery) {
    const results = await db.query.question.findMany({
      where: eq(question.quizzId, props.quizzId),
      orderBy: (questions, { asc }) => [asc(questions.order)],
    });
    
    return results;
  }
}
