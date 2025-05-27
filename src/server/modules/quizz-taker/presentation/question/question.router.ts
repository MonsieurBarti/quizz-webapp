import { createTRPCRouter, publicProcedure } from '@/server/api/trpc';
import { db } from '@/server/db';
import { eq } from 'drizzle-orm';
import { question } from '@/server/db/schema';
import { GetAllQuestionsQueryProps, GetQuestionByIdQueryProps, QuestionOutput } from './types';

export const questionRouter = createTRPCRouter({
	getAllQuestions: publicProcedure
		.input(GetAllQuestionsQueryProps)
		.output(QuestionOutput.array())
		.query(async ({ input }) => {
			const results = await db.query.question.findMany({
				where: eq(question.quizzId, input.quizzId),
			});
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
			const result = await db.query.question.findFirst({
				where: eq(question.id, input.id),
			});

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
