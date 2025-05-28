import { createTRPCRouter, protectedProcedure } from '@/server/api/trpc';
import { quizzCreatorContainer } from '../../quizz-creator.container';
import { QUIZZ_CREATOR_TOKENS } from '../../quizz-creator.tokens';
import { AnswerOutput, GetAllAnswersQueryProps, GetAnswerByIdQueryProps } from './types';

// Command Imports
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

// Query Imports
import { GetAllAnswersQuery, GetAllAnswersQueryHandler } from '../../application/queries/answer/get-all-answers/get-all-answers.query';
import { GetAnswerByIdQuery, GetAnswerByIdQueryHandler } from '../../application/queries/answer/get-answer-by-id/get-answer-by-id.query';

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
			const getAllAnswersQueryHandler = quizzCreatorContainer.get<GetAllAnswersQueryHandler>(
				QUIZZ_CREATOR_TOKENS.GET_ALL_ANSWERS_QUERY_HANDLER
			);

			const query = new GetAllAnswersQuery({ questionId: input.questionId });
			const results = await getAllAnswersQueryHandler.execute(query);

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
			const getAnswerByIdQueryHandler = quizzCreatorContainer.get<GetAnswerByIdQueryHandler>(
				QUIZZ_CREATOR_TOKENS.GET_ANSWER_BY_ID_QUERY_HANDLER
			);

			try {
				const query = new GetAnswerByIdQuery({ id: input.id });
				const result = await getAnswerByIdQueryHandler.execute(query);

				return {
					id: result.id,
					questionId: result.questionId,
					text: result.text,
					isCorrect: result.isCorrect,
					order: result.order,
					nextQuestionId: result.nextQuestionId,
				};
			} catch (error) {
				if (error instanceof Error && error.name === 'AnswerNotFound') {
					return null;
				}
				throw error;
			}
		}),
});
