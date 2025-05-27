import { createTRPCRouter, publicProcedure } from '@/server/api/trpc';
import { db } from '@/server/db';
import { eq } from 'drizzle-orm';
import { answer } from '@/server/db/schema';
import { GetAllAnswersQueryProps, GetAnswerByIdQueryProps, AnswerOutput } from './types';

export const answerRouter = createTRPCRouter({
	getAllAnswers: publicProcedure
		.input(GetAllAnswersQueryProps)
		.output(AnswerOutput.array())
		.query(async ({ input }) => {
			const results = await db.query.answer.findMany({
				where: eq(answer.questionId, input.questionId),
			});
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
			const result = await db.query.answer.findFirst({
				where: eq(answer.id, input.id),
			});

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
