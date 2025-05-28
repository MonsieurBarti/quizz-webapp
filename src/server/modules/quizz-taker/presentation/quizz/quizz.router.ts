import { createTRPCRouter, publicProcedure } from '@/server/api/trpc';
import { GetQuizzByIdQueryProps, QuizzOutput } from './types';
import { quizzTakerContainer } from '../../quizz-taker.container';
import { QUIZZ_TAKER_TOKENS } from '../../quizz-taker.tokens';
import type { GetAllQuizzQueryHandler } from '../../application/queries/quizz/get-all-quizz/get-all-quizz.query';
import type { GetQuizzByIdQueryHandler } from '../../application/queries/quizz/get-quizz-by-id/get-quizz-by-id.query';

export const quizzRouter = createTRPCRouter({
	getAllQuizz: publicProcedure.output(QuizzOutput.array()).query(async _ => {
		const getAllQuizzQueryHandler = quizzTakerContainer.get<GetAllQuizzQueryHandler>(
			QUIZZ_TAKER_TOKENS.GET_ALL_QUIZZ_QUERY_HANDLER,
		);

		const quizz = await getAllQuizzQueryHandler.execute();

		return quizz.map(quizz => ({
			id: quizz.id,
			title: quizz.title,
			description: quizz.description,
			createdBy: quizz.createdBy.name ?? 'Unknown',
			updatedAt: quizz.updatedAt,
		}));
	}),
	getQuizzById: publicProcedure
		.input(GetQuizzByIdQueryProps)
		.output(QuizzOutput.nullable())
		.query(async ({ input }) => {
			const getQuizzByIdQueryHandler = quizzTakerContainer.get<GetQuizzByIdQueryHandler>(
				QUIZZ_TAKER_TOKENS.GET_QUIZZ_BY_ID_QUERY_HANDLER,
			);

			const result = await getQuizzByIdQueryHandler.execute({ props: input });

			return result
				? {
						id: result.id,
						title: result.title,
						description: result.description,
						createdBy: result.createdBy.name ?? 'Unknown',
						updatedAt: result.updatedAt,
				  }
				: null;
		}),
});
