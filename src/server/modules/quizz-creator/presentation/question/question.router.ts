import { createTRPCRouter, protectedProcedure } from '@/server/api/trpc';
import { quizzCreatorContainer } from '../../quizz-creator.container';
import { QUIZZ_CREATOR_TOKENS } from '../../quizz-creator.tokens';
import { GetAllQuestionsQueryProps, GetQuestionByIdQueryProps, QuestionOutput } from './types';

// Question Command and Query Imports
import {
	CreateQuestionCommand,
	CreateQuestionCommandHandler,
	CreateQuestionCommandProps,
} from '../../application/commands/question/create-question/create-question.command';
import {
	UpdateQuestionCommand,
	UpdateQuestionCommandHandler,
	UpdateQuestionCommandProps,
} from '../../application/commands/question/update-question/update-question.command';
import {
	DeleteQuestionCommand,
	DeleteQuestionCommandHandler,
	DeleteQuestionCommandProps,
} from '../../application/commands/question/delete-question/delete-question.command';
import { db } from '@/server/db';
import { eq } from 'drizzle-orm';
import { question } from '@/server/db/schema';

export const questionRouter = createTRPCRouter({
	createQuestion: protectedProcedure
		.input(CreateQuestionCommandProps.omit({ id: true, context: true }))
		.output(QuestionOutput)
		.mutation(async ({ input, ctx }) => {
			const createQuestionCommandHandler = quizzCreatorContainer.get<CreateQuestionCommandHandler>(
				QUIZZ_CREATOR_TOKENS.CREATE_QUESTION_COMMAND_HANDLER,
			);

			const command = new CreateQuestionCommand({
				...input,
				context: { userId: ctx.session.user.id }
			});
			const question = await createQuestionCommandHandler.execute(command);

			return {
				id: question.id,
				quizzId: question.quizzId,
				text: question.text,
				order: question.order,
				imageUrl: question.imageUrl,
			};
		}),
	updateQuestion: protectedProcedure
		.input(UpdateQuestionCommandProps.omit({ context: true }))
		.output(QuestionOutput)
		.mutation(async ({ input, ctx }) => {
			const updateQuestionCommandHandler = quizzCreatorContainer.get<UpdateQuestionCommandHandler>(
				QUIZZ_CREATOR_TOKENS.UPDATE_QUESTION_COMMAND_HANDLER,
			);

			const command = new UpdateQuestionCommand({
				...input,
				context: { userId: ctx.session.user.id }
			});
			const question = await updateQuestionCommandHandler.execute(command);

			return {
				id: question.id,
				quizzId: question.quizzId,
				text: question.text,
				order: question.order,
				imageUrl: question.imageUrl,
			};
		}),
	deleteQuestion: protectedProcedure.input(DeleteQuestionCommandProps.omit({ context: true })).mutation(async ({ input, ctx }) => {
		const deleteQuestionCommandHandler = quizzCreatorContainer.get<DeleteQuestionCommandHandler>(
			QUIZZ_CREATOR_TOKENS.DELETE_QUESTION_COMMAND_HANDLER,
		);

		const command = new DeleteQuestionCommand({
			...input,
			context: { userId: ctx.session.user.id }
		});
		await deleteQuestionCommandHandler.execute(command);
	}),
	getAllQuestions: protectedProcedure
		.input(GetAllQuestionsQueryProps)
		.output(QuestionOutput.array())
		.query(async ({ input }) => {
			const results = await db.query.question.findMany({
				where: eq(question.quizzId, input.quizzId),
				orderBy: (questions, { asc }) => [asc(questions.order)],
			});

			return results.map(question => ({
				id: question.id,
				quizzId: question.quizzId,
				text: question.text,
				order: question.order,
				imageUrl: question.imageUrl,
			}));
		}),
	getQuestionById: protectedProcedure
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
				  }
				: null;
		}),
});
