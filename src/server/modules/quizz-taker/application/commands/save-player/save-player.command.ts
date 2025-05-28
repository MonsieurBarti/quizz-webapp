import 'reflect-metadata';
import { z } from 'zod';
import { inject, injectable } from 'inversify';
import { QUIZZ_TAKER_TOKENS } from '@quizz-taker/quizz-taker.tokens';
import type { PlayerRepository } from '@quizz-taker/domain/player/player.repository';
import { Player } from '@quizz-taker/domain/player/player';

export const SavePlayerCommandProps = z.object({
	email: z.string().email(),
	name: z.string().max(256).nullable(),
});

export type SavePlayerCommandProps = z.infer<typeof SavePlayerCommandProps>;

export class SavePlayerCommand {
	constructor(public readonly props: SavePlayerCommandProps) {}
}

@injectable()
export class SavePlayerCommandHandler {
	constructor(
		@inject(QUIZZ_TAKER_TOKENS.PLAYER_REPOSITORY)
		private readonly playerRepository: PlayerRepository,
	) {}

	public async execute({ props }: SavePlayerCommand): Promise<Player> {
		const existingPlayer = await this.playerRepository.findByEmail({ email: props.email });
		if (existingPlayer) return existingPlayer;
		const player = Player.create({ email: props.email, name: props.name });
		await this.playerRepository.save(player);
		return player;
	}
}
