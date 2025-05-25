import { Player, PlayerProps } from '@/server/modules/quizz-taker/domain/player/player';
import { player } from '@/server/db/schema';
import type { InferSelectModel, InferInsertModel } from 'drizzle-orm';

export type PlayerSchemaSelect = InferSelectModel<typeof player>;
export type PlayerSchemaInsert = InferInsertModel<typeof player>;

export class PlayerMapper {
	/**
	 * Converts a Drizzle player record (select model) to a Player domain entity.
	 * @param raw - The raw player data from the database.
	 * @returns A Player domain entity.
	 */
	static toDomain(raw: PlayerSchemaSelect): Player {
		const PlayerProps: PlayerProps = {
			id: raw.id,
			name: raw.name,
			email: raw.email,
		};
		return Player.create(PlayerProps);
	}

	/**
	 * Converts a Player domain entity to a Drizzle player record (insert model).
	 * @param Player - The Player domain entity to convert.
	 * @returns A Drizzle player record (insert model).
	 */
	static toPersistence(Player: Player): PlayerSchemaInsert {
		const persistenceRecord: PlayerSchemaInsert = {
			id: Player.id,
			name: Player.name,
			email: Player.email,
		};
		return persistenceRecord;
	}
}
