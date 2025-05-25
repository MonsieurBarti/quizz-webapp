import { Question, QuestionProps } from '@quizz-creator/domain/question/question';
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

	/**
	 * Converts a Question domain entity to a Drizzle question record (insert model).
	 * @param question - The Question domain entity.
	 * @returns An object suitable for inserting into the Drizzle questions table.
	 */
	static toPersistence(question: Question): QuestionSchemaInsert {
		const persistenceRecord: QuestionSchemaInsert = {
			id: question.id,
			quizId: question.quizzId,
			text: question.text,
			order: question.order,
			imageUrl: question.imageUrl,
		};
		return persistenceRecord;
	}
}
