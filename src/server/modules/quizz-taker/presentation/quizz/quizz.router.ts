import { createTRPCRouter, publicProcedure } from '@/server/api/trpc';
import { db } from '@/server/db';
import { and, eq } from 'drizzle-orm';
import { quizz } from '@/server/db/schema';
import { GetQuizzByIdQueryProps, QuizzOutput } from './types';

export const quizzRouter = createTRPCRouter({
	getAllQuizz: publicProcedure.output(QuizzOutput.array()).query(async _ => {
		const results = await db.query.quizz.findMany({
			where: eq(quizz.isPublished, true),
			with: { createdBy: { columns: { name: true } } },
		});
		return results.map(quizz => ({
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
			const result = await db.query.quizz.findFirst({
				where: and(eq(quizz.id, input.id), eq(quizz.isPublished, true)),
				with: { createdBy: { columns: { name: true } } },
			});

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
