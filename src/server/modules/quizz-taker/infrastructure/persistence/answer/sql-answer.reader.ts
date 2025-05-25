import { injectable } from 'inversify';
import { eq } from 'drizzle-orm';
import { db } from '@/server/db';
import { answer as answerTable } from '@/server/db/schema'; 
import type { Answer } from '@quizz-taker/domain/answer/answer';
import type { AnswerReader } from '@quizz-taker/domain/answer/answer.reader';
import { AnswerMapper } from './answer.mapper';

@injectable()
export class SqlAnswerReader implements AnswerReader {
	async findByQuestionId({ questionId }: { questionId: string }): Promise<Answer[]> {
		const results = await db.query.answer.findMany({
			where: eq(answerTable.questionId, questionId),
			orderBy: (answers, { asc }) => [asc(answers.order)],
		});
		return results.map(AnswerMapper.toDomain);
	}
}
