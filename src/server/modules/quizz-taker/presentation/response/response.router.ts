import { createTRPCRouter, publicProcedure } from '@/server/api/trpc';
import { ResponseOutput, SaveResponseCommandProps } from './types';
import { quizzTakerContainer } from '../../quizz-taker.container';
import { QUIZZ_TAKER_TOKENS } from '../../quizz-taker.tokens';
import {
	SaveResponseCommand,
	type SaveResponseCommandHandler,
} from '../../application/commands/save-response/save-response.command';
import {
	SaveAttemptCommand,
	type SaveAttemptCommandHandler,
} from '../../application/commands/save-attempt/save-attempt.command';

export const responseRouter = createTRPCRouter({
	saveResponse: publicProcedure
		.input(SaveResponseCommandProps)
		.output(ResponseOutput)
		.mutation(async ({ input }) => {
			const saveResponseCommandHandler = quizzTakerContainer.get<SaveResponseCommandHandler>(
				QUIZZ_TAKER_TOKENS.SAVE_RESPONSE_COMMAND_HANDLER,
			);

			const responseCommand = new SaveResponseCommand({
				questionId: input.questionId,
				attemptId: input.attemptId,
				answerId: input.answerId,
				timeTakenMs: input.timeTakenMs,
			});

			const response = await saveResponseCommandHandler.execute(responseCommand);

			const saveAttemptCommandHandler = quizzTakerContainer.get<SaveAttemptCommandHandler>(
				QUIZZ_TAKER_TOKENS.SAVE_ATTEMPT_COMMAND_HANDLER,
			);

			const attemptCommand = new SaveAttemptCommand({
				quizzId: input.quizzId,
				playerId: input.playerId,
				isCorrect: response.isCorrect,
			});

			await saveAttemptCommandHandler.execute(attemptCommand);

			return {
				id: response.id,
				attemptId: response.attemptId,
				questionId: response.questionId,
				answerId: response.answerId,
			};
		}),
});
