import { z } from 'zod';
import { injectable } from 'inversify';
import { db } from '@/server/db';
import { eq } from 'drizzle-orm';
import { quizz } from '@/server/db/schema';

export const GetAllQuizzQueryProps = z.object({
  userId: z.string().uuid(),
});

export type GetAllQuizzQueryProps = z.infer<typeof GetAllQuizzQueryProps>;

export class GetAllQuizzQuery {
  constructor(public readonly props: GetAllQuizzQueryProps) {}
}

@injectable()
export class GetAllQuizzQueryHandler {
  public async execute({ props }: GetAllQuizzQuery) {
    const results = await db.query.quizz.findMany({
      where: eq(quizz.createdBy, props.userId),
    });
    return results;
  }
}
