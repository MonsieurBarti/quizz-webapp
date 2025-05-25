import { Attempt, AttemptProps } from '@/server/modules/quizz-taker/domain/attempt/attempt';
import { attempt } from '@/server/db/schema';
import type { InferSelectModel, InferInsertModel } from 'drizzle-orm';

export type AttemptSchemaSelect = InferSelectModel<typeof attempt>;
export type AttemptSchemaInsert = InferInsertModel<typeof attempt>;

export class AttemptMapper {
	/**
	 * Converts a Drizzle attempt record (select model) to an Attempt domain entity.
	 * @param raw - The raw attempt data from the database.
	 * @returns An Attempt domain entity.
	 */
	static toDomain(raw: AttemptSchemaSelect): Attempt {
		const AttemptProps: AttemptProps = {
			id: raw.id,
			quizzId: raw.quizzId,
			playerId: raw.playerId,
			startedAt: raw.startedAt,
			completedAt: raw.completedAt,
			score: raw.score,
			totalQuestionsAnswered: raw.totalQuestionsAnswered,
		};
		return Attempt.create(AttemptProps);
	}

	/**
	 * Converts an Attempt domain entity to a Drizzle attempt record (insert model).
	 * @param Attempt - The Attempt domain entity to convert.
	 * @returns A Drizzle attempt record (insert model).
	 */
	static toPersistence(Attempt: Attempt): AttemptSchemaInsert {
		const persistenceRecord: AttemptSchemaInsert = {
			id: Attempt.id,
			quizzId: Attempt.quizzId,
			playerId: Attempt.playerId,
			startedAt: Attempt.startedAt,
			completedAt: Attempt.completedAt,
			score: Attempt.score,
			totalQuestionsAnswered: Attempt.totalQuestionsAnswered,
		};
		return persistenceRecord;
	}
}
