import { Answer, AnswerProps } from '@/server/modules/quizz-taker/domain/answer/answer';
import { answer } from '@/server/db/schema';
import type { InferSelectModel, InferInsertModel } from 'drizzle-orm';

export type AnswerSchemaSelect = InferSelectModel<typeof answer>;
export type AnswerSchemaInsert = InferInsertModel<typeof answer>;

export class AnswerMapper {
	/**
	 * Converts a Drizzle answer record (select model) to an Answer domain entity.
	 * @param raw - The raw answer data from the database.
	 * @returns An Answer domain entity.
	 */
	static toDomain(raw: AnswerSchemaSelect): Answer {
		const answerProps: AnswerProps = {
			id: raw.id,
			questionId: raw.questionId,
			text: raw.text,
			isCorrect: raw.isCorrect,
			order: raw.order,
			nextQuestionId: raw.nextQuestionId,
		};
		return Answer.create(answerProps);
	}
}
