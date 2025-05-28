import type { AnswerReader } from '@quizz-taker/domain/answer/answer.reader';
import { db } from '@/server/db';
import { answer } from '@/server/db/schema';
import { eq } from 'drizzle-orm';
import type { Answer } from '@quizz-taker/domain/answer/answer';

export class SqlAnswerReader implements AnswerReader {
	public async findById(id: string): Promise<Answer | null> {
		const result = await db.query.answer.findFirst({
			where: eq(answer.id, id),
		});
		return result
			? {
					id: result.id,
					isCorrect: result.isCorrect,
			  }
			: null;
	}
}
