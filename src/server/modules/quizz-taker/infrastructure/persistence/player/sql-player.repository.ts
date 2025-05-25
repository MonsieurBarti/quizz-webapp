import { injectable } from 'inversify';
import { eq } from 'drizzle-orm';
import { db } from '@/server/db';
import { player } from '@/server/db/schema';
import { Player } from '@/server/modules/quizz-taker/domain/player/player';
import type { PlayerRepository } from '@/server/modules/quizz-taker/domain/player/player.repository';
import { PlayerMapper } from './player.mapper';

@injectable()
export class SqlPlayerRepository implements PlayerRepository {
	async findByEmail({ email }: { email: string }): Promise<Player | null> {
		const result = await db.query.player.findFirst({ where: eq(player.email, email) });
		return result ? PlayerMapper.toDomain(result) : null;
	}

	async save(domainPlayer: Player): Promise<void> {
		await db
			.insert(player)
			.values(PlayerMapper.toPersistence(domainPlayer))
			.onConflictDoUpdate({
				target: player.id,
				set: {
					name: domainPlayer.name,
					email: domainPlayer.email,
				},
			});
	}

	async findById({ id }: { id: string }): Promise<Player | null> {
		const result = await db.query.player.findFirst({ where: eq(player.id, id) });
		return result ? PlayerMapper.toDomain(result) : null;
	}
}
