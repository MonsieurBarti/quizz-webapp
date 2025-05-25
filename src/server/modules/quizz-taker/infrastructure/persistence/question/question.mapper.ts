import { Question, QuestionProps } from '@/server/modules/quizz-taker/domain/question/question';
import { question } from '@/server/db/schema';
import type { InferSelectModel, InferInsertModel } from 'drizzle-orm';

export type QuestionSchemaSelect = InferSelectModel<typeof question>;
export type QuestionSchemaInsert = InferInsertModel<typeof question>;

export class QuestionMapper {
	/**
	 * Converts a Drizzle question record (select model) to a Question domain entity.
	 * @param raw - The raw question data from the database.
	 * @returns A Question domain entity.
	 */
	static toDomain(raw: QuestionSchemaSelect): Question {
		const questionProps: QuestionProps = {
			id: raw.id,
			quizzId: raw.quizId,
			text: raw.text,
			order: raw.order,
			imageUrl: raw.imageUrl,
		};
		return Question.create(questionProps);
	}
}
