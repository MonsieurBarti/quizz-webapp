import { createTRPCRouter, protectedProcedure } from '@/server/api/trpc';
import { quizzCreatorContainer } from '../../quizz-creator.container';
import { QUIZZ_CREATOR_TOKENS } from '../../quizz-creator.tokens';
import { AnswerOutput, GetAllAnswersQueryProps, GetAnswerByIdQueryProps } from './types';
import { db } from '@/server/db';
import { eq } from 'drizzle-orm';
import { answer } from '@/server/db/schema';

// Answer Command and Query Imports
import {
	CreateAnswerCommand,
	CreateAnswerCommandHandler,
	CreateAnswerCommandProps,
} from '../../application/commands/answer/create-answer/create-answer.command';
import {
	UpdateAnswerCommand,
	UpdateAnswerCommandHandler,
	UpdateAnswerCommandProps,
} from '../../application/commands/answer/update-answer/update-answer.command';
import {
	DeleteAnswerCommand,
	DeleteAnswerCommandHandler,
	DeleteAnswerCommandProps,
} from '../../application/commands/answer/delete-answer/delete-answer.command';

export const answerRouter = createTRPCRouter({
	createAnswer: protectedProcedure
		.input(CreateAnswerCommandProps.omit({ id: true, context: true }))
		.output(AnswerOutput)
		.mutation(async ({ input, ctx }) => {
			const createAnswerCommandHandler = quizzCreatorContainer.get<CreateAnswerCommandHandler>(
				QUIZZ_CREATOR_TOKENS.CREATE_ANSWER_COMMAND_HANDLER,
			);

			const command = new CreateAnswerCommand({
				...input,
				context: { userId: ctx.session.user.id }
			});
			const answer = await createAnswerCommandHandler.execute(command);

			return {
				id: answer.id,
				questionId: answer.questionId,
				text: answer.text,
				isCorrect: answer.isCorrect,
				order: answer.order,
				nextQuestionId: answer.nextQuestionId,
			};
		}),
	updateAnswer: protectedProcedure
		.input(UpdateAnswerCommandProps.omit({ context: true }))
		.output(AnswerOutput)
		.mutation(async ({ input, ctx }) => {
			const updateAnswerCommandHandler = quizzCreatorContainer.get<UpdateAnswerCommandHandler>(
				QUIZZ_CREATOR_TOKENS.UPDATE_ANSWER_COMMAND_HANDLER,
			);

			const command = new UpdateAnswerCommand({
				...input,
				context: { userId: ctx.session.user.id }
			});
			const answer = await updateAnswerCommandHandler.execute(command);

			return {
				id: answer.id,
				questionId: answer.questionId,
				text: answer.text,
				isCorrect: answer.isCorrect,
				order: answer.order,
				nextQuestionId: answer.nextQuestionId,
			};
		}),
	deleteAnswer: protectedProcedure.input(DeleteAnswerCommandProps.omit({ context: true })).mutation(async ({ input, ctx }) => {
		const deleteAnswerCommandHandler = quizzCreatorContainer.get<DeleteAnswerCommandHandler>(
			QUIZZ_CREATOR_TOKENS.DELETE_ANSWER_COMMAND_HANDLER,
		);

		const command = new DeleteAnswerCommand({
			...input,
			context: { userId: ctx.session.user.id }
		});
		await deleteAnswerCommandHandler.execute(command);
	}),
	getAllAnswers: protectedProcedure
		.input(GetAllAnswersQueryProps)
		.output(AnswerOutput.array())
		.query(async ({ input }) => {
			const results = await db.query.answer.findMany({ where: eq(answer.questionId, input.questionId) });

			return results.map(answer => ({
				id: answer.id,
				questionId: answer.questionId,
				text: answer.text,
				isCorrect: answer.isCorrect,
				order: answer.order,
				nextQuestionId: answer.nextQuestionId,
			}));
		}),
	getAnswerById: protectedProcedure
		.input(GetAnswerByIdQueryProps)
		.output(AnswerOutput.nullable())
		.query(async ({ input }) => {
			const result = await db.query.answer.findFirst({ where: eq(answer.id, input.id) });

			return result
				? {
						id: result.id,
						questionId: result.questionId,
						text: result.text,
						isCorrect: result.isCorrect,
						order: result.order,
						nextQuestionId: result.nextQuestionId,
				  }
				: null;
		}),
});
