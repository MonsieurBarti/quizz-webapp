import { createTRPCRouter, publicProcedure } from '@/server/api/trpc';
import { AttemptOutput, SaveAttemptCommandProps } from './types';
import { quizzTakerContainer } from '../../quizz-taker.container';
import { QUIZZ_TAKER_TOKENS } from '../../quizz-taker.tokens';
import {
	SaveAttemptCommand,
	type SaveAttemptCommandHandler,
} from '../../application/commands/save-attempt/save-attempt.command';

export const attemptRouter = createTRPCRouter({
	saveAttempt: publicProcedure
		.input(SaveAttemptCommandProps)
		.output(AttemptOutput)
		.mutation(async ({ input }) => {
			const saveAttemptCommandHandler = quizzTakerContainer.get<SaveAttemptCommandHandler>(
				QUIZZ_TAKER_TOKENS.SAVE_ATTEMPT_COMMAND_HANDLER,
			);

			const command = new SaveAttemptCommand({
				quizzId: input.quizzId,
				playerId: input.playerId,
				isCorrect: input.isCorrect,
				completedAt: input.completedAt,
			});

			const attempt = await saveAttemptCommandHandler.execute(command);

			return {
				id: attempt.id,
				quizzId: attempt.quizzId,
				playerId: attempt.playerId,
			};
		}),
});
