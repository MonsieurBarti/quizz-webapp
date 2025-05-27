import { createTRPCRouter, protectedProcedure } from '@/server/api/trpc';
import { quizzCreatorContainer } from '../../quizz-creator.container';
import { QUIZZ_CREATOR_TOKENS } from '../../quizz-creator.tokens';
import { GetQuizzByIdQueryProps, QuizzOutput } from './types';

import {
	CreateQuizzCommand,
	CreateQuizzCommandHandler,
	CreateQuizzCommandProps,
} from '../../application/commands/quizz/create-quizz/create-quizz.command';
import {
	UpdateQuizzCommand,
	UpdateQuizzCommandHandler,
	UpdateQuizzCommandProps,
} from '../../application/commands/quizz/update-quizz/update-quizz.command';
import {
	DeleteQuizzCommand,
	DeleteQuizzCommandHandler,
	DeleteQuizzCommandProps,
} from '../../application/commands/quizz/delete-quizz/delete-quizz.command';
import { db } from '@/server/db';
import { and, eq } from 'drizzle-orm';
import { quizz } from '@/server/db/schema';

export const quizzRouter = createTRPCRouter({
	createQuizz: protectedProcedure
		.input(CreateQuizzCommandProps.omit({ createdBy: true, id: true }))
		.output(QuizzOutput)
		.mutation(async ({ input, ctx }) => {
			const createQuizzCommandHandler = quizzCreatorContainer.get<CreateQuizzCommandHandler>(
				QUIZZ_CREATOR_TOKENS.CREATE_QUIZZ_COMMAND_HANDLER,
			);

			const command = new CreateQuizzCommand({ ...input, createdBy: ctx.session.user.id });
			const quizz = await createQuizzCommandHandler.execute(command);

			return {
				id: quizz.id,
				title: quizz.title,
				description: quizz.description,
				isPublished: quizz.isPublished,
				createdBy: quizz.createdBy,
			};
		}),
	updateQuizz: protectedProcedure
		.input(UpdateQuizzCommandProps.omit({ context: true }))
		.output(QuizzOutput)
		.mutation(async ({ input, ctx }) => {
			const updateQuizzCommandHandler = quizzCreatorContainer.get<UpdateQuizzCommandHandler>(
				QUIZZ_CREATOR_TOKENS.UPDATE_QUIZZ_COMMAND_HANDLER,
			);

			const command = new UpdateQuizzCommand({
				...input,
				context: { userId: ctx.session.user.id },
			});
			const quizz = await updateQuizzCommandHandler.execute(command);

			return {
				id: quizz.id,
				title: quizz.title,
				description: quizz.description,
				isPublished: quizz.isPublished,
				createdBy: quizz.createdBy,
			};
		}),
	deleteQuizz: protectedProcedure
		.input(DeleteQuizzCommandProps.omit({ context: true }))
		.mutation(async ({ input, ctx }) => {
			const deleteQuizzCommandHandler = quizzCreatorContainer.get<DeleteQuizzCommandHandler>(
				QUIZZ_CREATOR_TOKENS.DELETE_QUIZZ_COMMAND_HANDLER,
			);

			const command = new DeleteQuizzCommand({
				...input,
				context: { userId: ctx.session.user.id },
			});
			await deleteQuizzCommandHandler.execute(command);
		}),
	getAllQuizz: protectedProcedure.output(QuizzOutput.array()).query(async ({ ctx }) => {
		const results = await db.query.quizz.findMany({ where: eq(quizz.createdBy, ctx.session.user.id) });
		return results.map(quizz => ({
			id: quizz.id,
			title: quizz.title,
			description: quizz.description,
			isPublished: quizz.isPublished,
			createdBy: quizz.createdBy,
		}));
	}),
	getQuizzById: protectedProcedure
		.input(GetQuizzByIdQueryProps)
		.output(QuizzOutput.nullable())
		.query(async ({ input, ctx }) => {
			const result = await db.query.quizz.findFirst({
				where: and(eq(quizz.id, input.id), eq(quizz.createdBy, ctx.session.user.id)),
			});

			return result
				? {
						id: result.id,
						title: result.title,
						description: result.description,
						isPublished: result.isPublished,
						createdBy: result.createdBy,
				  }
				: null;
		}),
});
