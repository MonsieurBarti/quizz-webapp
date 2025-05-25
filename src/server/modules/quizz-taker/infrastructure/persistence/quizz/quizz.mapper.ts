import { Quizz } from '@/server/modules/quizz-taker/domain/quizz/quizz';
import { quizz } from '@/server/db/schema';
import type { InferSelectModel } from 'drizzle-orm';

export type QuizzSchemaSelect = InferSelectModel<typeof quizz>;

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
}
