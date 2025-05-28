import { createTRPCRouter, publicProcedure } from '@/server/api/trpc';
import { GetAllAnswersQueryProps, GetAnswerByIdQueryProps, AnswerOutput } from './types';
import { quizzTakerContainer } from '../../quizz-taker.container';
import { QUIZZ_TAKER_TOKENS } from '../../quizz-taker.tokens';
import type { GetAllAnswersQueryHandler } from '../../application/queries/answer/get-all-answers/get-all-answers.query';
import type { GetAnswerByIdQueryHandler } from '../../application/queries/answer/get-answer-by-id/get-answer-by-id.query';

export const answerRouter = createTRPCRouter({
	getAllAnswers: publicProcedure
		.input(GetAllAnswersQueryProps)
		.output(AnswerOutput.array())
		.query(async ({ input }) => {
			const getAllAnswersQueryHandler = quizzTakerContainer.get<GetAllAnswersQueryHandler>(
				QUIZZ_TAKER_TOKENS.GET_ALL_ANSWERS_QUERY_HANDLER,
			);
			const results = await getAllAnswersQueryHandler.execute({ props: input });

			return results.map(answer => ({
				id: answer.id,
				text: answer.text,
				order: answer.order,
				updatedAt: answer.updatedAt,
			}));
		}),
	getAnswerById: publicProcedure
		.input(GetAnswerByIdQueryProps)
		.output(AnswerOutput.nullable())
		.query(async ({ input }) => {
			const getAnswerByIdQueryHandler = quizzTakerContainer.get<GetAnswerByIdQueryHandler>(
				QUIZZ_TAKER_TOKENS.GET_ANSWER_BY_ID_QUERY_HANDLER,
			);
			const result = await getAnswerByIdQueryHandler.execute({ props: input });

			return result
				? {
						id: result.id,
						text: result.text,
						order: result.order,
						updatedAt: result.updatedAt,
				  }
				: null;
		}),
});
