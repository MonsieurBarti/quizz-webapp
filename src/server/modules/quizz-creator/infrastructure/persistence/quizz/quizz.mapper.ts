import { Quizz } from '@quizz-creator/domain/quizz/quizz';
import { quizz } from '@/server/db/schema';
import type { InferSelectModel, InferInsertModel } from 'drizzle-orm';

export type QuizzSchemaSelect = InferSelectModel<typeof quizz>;
export type QuizzSchemaInsert = InferInsertModel<typeof quizz>;

export class QuizzMapper {
	/**
	 * Converts a Drizzle quizz record (select model) to a Quizz domain entity.
	 * @param raw - The raw quizz data from the database.
	 * @returns A Quizz domain entity.
	 */
	static toDomain(raw: QuizzSchemaSelect): Quizz {
		return Quizz.create({
			id: raw.id,
			title: raw.title,
			description: raw.description,
			createdBy: raw.createdBy,
			isPublished: raw.isPublished,
		});
	}

	/**
	 * Converts a Quizz domain entity to a Drizzle quizz record (insert model).
	 * @param quizz - The Quizz domain entity.
	 * @returns An object suitable for inserting into the Drizzle quizz table.
	 */
	static toPersistence(quizz: Quizz): QuizzSchemaInsert {
		return {
			id: quizz.id,
			title: quizz.title,
			description: quizz.description,
			createdBy: quizz.createdBy,
			isPublished: quizz.isPublished,
		};
	}
}
