import { injectable } from 'inversify';
import type { Player } from '@quizz-taker/domain/player/player';
import type { PlayerRepository } from '@quizz-taker/domain/player/player.repository';

@injectable()
export class InMemoryPlayerRepository implements PlayerRepository {
	private readonly players: Map<string, Player> = new Map();

	async findByEmail({ email }: { email: string }): Promise<Player | null> {
		for (const player of this.players.values()) {
			if (player.email === email) {
				return Promise.resolve(player);
			}
		}
		return Promise.resolve(null);
	}

	async save(player: Player): Promise<void> {
		this.players.set(player.id, player);
		return Promise.resolve();
	}

	public clear(): void {
		this.players.clear();
	}

	public seed(players: Player[]): void {
		this.clear();
		players.forEach(p => this.players.set(p.id, p));
	}
}