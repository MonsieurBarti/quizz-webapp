import { createTRPCRouter, publicProcedure } from '@/server/api/trpc';
import { PlayerOutput, SavePlayerProps } from './types';
import { quizzTakerContainer } from '../../quizz-taker.container';
import { QUIZZ_TAKER_TOKENS } from '../../quizz-taker.tokens';
import {
	SavePlayerCommand,
	type SavePlayerCommandHandler,
} from '../../application/commands/save-player/save-player.command';

export const playerRouter = createTRPCRouter({
	savePlayer: publicProcedure
		.input(SavePlayerProps)
		.output(PlayerOutput)
		.mutation(async ({ input }) => {
			const savePlayerCommandHandler = quizzTakerContainer.get<SavePlayerCommandHandler>(
				QUIZZ_TAKER_TOKENS.SAVE_PLAYER_COMMAND_HANDLER,
			);
			const command = new SavePlayerCommand({
				name: input.name,
				email: input.email,
			});

			const player = await savePlayerCommandHandler.execute(command);

			return {
				id: player.id,
				name: player.name,
				email: player.email,
			};
		}),
});
