import { createTRPCRouter, protectedProcedure } from '@/server/api/trpc';
import { quizzCreatorContainer } from '../../quizz-creator.container';
import { QUIZZ_CREATOR_TOKENS } from '../../quizz-creator.tokens';
import { GetAllQuestionsQueryProps, GetQuestionByIdQueryProps, QuestionOutput } from './types';

// Command Imports
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

// Query Imports
import { GetAllQuestionsQuery, GetAllQuestionsQueryHandler } from '../../application/queries/question/get-all-questions/get-all-questions.query';
import { GetQuestionByIdQuery, GetQuestionByIdQueryHandler } from '../../application/queries/question/get-question-by-id/get-question-by-id.query';

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
			const getAllQuestionsQueryHandler = quizzCreatorContainer.get<GetAllQuestionsQueryHandler>(
				QUIZZ_CREATOR_TOKENS.GET_ALL_QUESTIONS_QUERY_HANDLER
			);

			const query = new GetAllQuestionsQuery({ quizzId: input.quizzId });
			const results = await getAllQuestionsQueryHandler.execute(query);

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
			const getQuestionByIdQueryHandler = quizzCreatorContainer.get<GetQuestionByIdQueryHandler>(
				QUIZZ_CREATOR_TOKENS.GET_QUESTION_BY_ID_QUERY_HANDLER
			);

			try {
				const query = new GetQuestionByIdQuery({ id: input.id });
				const result = await getQuestionByIdQueryHandler.execute(query);

				return {
					id: result.id,
					quizzId: result.quizzId,
					text: result.text,
					order: result.order,
					imageUrl: result.imageUrl,
				};
			} catch (error) {
				if (error instanceof Error && error.name === 'QuestionNotFound') {
					return null;
				}
				throw error;
			}
		}),
});
