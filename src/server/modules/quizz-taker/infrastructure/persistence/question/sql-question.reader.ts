import { injectable } from 'inversify';
import { eq, and, gt, asc } from 'drizzle-orm';
import { db } from '@/server/db';
import { question } from '@/server/db/schema';
import type { Question } from '@/server/modules/quizz-taker/domain/question/question';
import type { QuestionReader } from '@/server/modules/quizz-taker/domain/question/question.reader';
import { QuestionMapper } from './question.mapper';

@injectable()
export class SqlQuestionReader implements QuestionReader {
  async findById({ id }: { id: string }): Promise<Question | null> {
    const result = await db.query.question.findFirst({
      where: eq(question.id, id),
    });
    return result ? QuestionMapper.toDomain(result) : null;
  }

  async findByQuizzId({ quizzId }: { quizzId: string }): Promise<Question[]> {
    const results = await db.query.question.findMany({
      where: eq(question.quizId, quizzId),
      orderBy: (questions, { asc }) => [asc(questions.order)],
    });

    return results.map(QuestionMapper.toDomain);
  }

  async findNextQuestion({ quizzId, currentQuestionId }: { quizzId: string; currentQuestionId: string | null }): Promise<Question | null> {
    if (currentQuestionId === null) {
      const result = await db.query.question.findFirst({
        where: eq(question.quizId, quizzId),
        orderBy: (questions, { asc }) => [asc(questions.order)],
      });
      return result ? QuestionMapper.toDomain(result) : null;
    }

    const currentQ = await db.query.question.findFirst({
      columns: {
        order: true,
      },
      where: and(eq(question.id, currentQuestionId), eq(question.quizId, quizzId)),
    });

    if (!currentQ) {
      return null; 
    }

    const nextResult = await db.query.question.findFirst({
      where: and(eq(question.quizId, quizzId), gt(question.order, currentQ.order)),
      orderBy: (questions, { asc }) => [asc(questions.order)],
    });

    return nextResult ? QuestionMapper.toDomain(nextResult) : null;
  }
}
