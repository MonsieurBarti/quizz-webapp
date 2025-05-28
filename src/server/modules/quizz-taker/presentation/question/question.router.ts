import { createTRPCRouter, publicProcedure } from '@/server/api/trpc';
import { GetAllQuestionsQueryProps, GetQuestionByIdQueryProps, QuestionOutput } from './types';
import { quizzTakerContainer } from '../../quizz-taker.container';
import { QUIZZ_TAKER_TOKENS } from '../../quizz-taker.tokens';
import type { GetAllQuestionsQueryHandler } from '../../application/queries/question/get-all-questions/get-all-questions.query';
import type { GetQuestionByIdQueryHandler } from '../../application/queries/question/get-question-by-id/get-question-by-id.query';

export const questionRouter = createTRPCRouter({
	getAllQuestions: publicProcedure
		.input(GetAllQuestionsQueryProps)
		.output(QuestionOutput.array())
		.query(async ({ input }) => {
			const getAllQuestionsQueryHandler = quizzTakerContainer.get<GetAllQuestionsQueryHandler>(
				QUIZZ_TAKER_TOKENS.GET_ALL_QUIZZ_QUERY_HANDLER,
			);
			const results = await getAllQuestionsQueryHandler.execute({ props: input });

			return results.map(question => ({
				id: question.id,
				quizzId: question.quizzId,
				text: question.text,
				order: question.order,
				imageUrl: question.imageUrl,
				updatedAt: question.updatedAt,
			}));
		}),
	getQuestionById: publicProcedure
		.input(GetQuestionByIdQueryProps)
		.output(QuestionOutput.nullable())
		.query(async ({ input }) => {
			const getQuestionByIdQueryHandler = quizzTakerContainer.get<GetQuestionByIdQueryHandler>(
				QUIZZ_TAKER_TOKENS.GET_QUIZZ_BY_ID_QUERY_HANDLER,
			);
			const result = await getQuestionByIdQueryHandler.execute({ props: input });

			return result
				? {
						id: result.id,
						quizzId: result.quizzId,
						text: result.text,
						order: result.order,
						imageUrl: result.imageUrl,
						updatedAt: result.updatedAt,
				  }
				: null;
		}),
});
