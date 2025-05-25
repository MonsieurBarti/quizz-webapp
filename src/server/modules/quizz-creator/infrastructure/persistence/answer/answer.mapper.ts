import { Answer, AnswerProps } from '@quizz-creator/domain/answer/answer';
import { answer } from '@/server/db/schema';
import type { InferSelectModel, InferInsertModel } from 'drizzle-orm';

export type AnswerSchemaSelect = InferSelectModel<typeof answer>;
export type AnswerSchemaInsert = InferInsertModel<typeof answer>;

export class AnswerMapper {
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

	static toPersistence(answer: Answer): AnswerSchemaInsert {
		const persistenceRecord: AnswerSchemaInsert = {
			id: answer.id,
			questionId: answer.questionId,
			text: answer.text,
			isCorrect: answer.isCorrect,
			order: answer.order,
			nextQuestionId: answer.nextQuestionId,
		};
		return persistenceRecord;
	}
}
