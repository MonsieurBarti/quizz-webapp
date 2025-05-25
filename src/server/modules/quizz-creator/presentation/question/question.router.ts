import { createTRPCRouter, protectedProcedure } from '@/server/api/trpc';
import { quizzCreatorContainer } from '../../quizz-creator.container';
import { QUIZZ_CREATOR_TOKENS } from '../../quizz-creator.tokens';
import { QuestionOutput } from './types';

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
import {
	GetAllQuestionsQuery,
	GetAllQuestionsQueryHandler,
	GetAllQuestionsQueryProps,
} from '../../application/queries/question/get-all-questions/get-all-questions.query';
import {
	GetQuestionByIdQuery,
	GetQuestionByIdQueryHandler,
	GetQuestionByIdQueryProps,
} from '../../application/queries/question/get-question-by-id/get-question-by-id.query';

export const questionRouter = createTRPCRouter({
	createQuestion: protectedProcedure
		.input(CreateQuestionCommandProps.omit({ id: true }))
		.output(QuestionOutput)
		.mutation(async ({ input }) => {
			const createQuestionCommandHandler = quizzCreatorContainer.get<CreateQuestionCommandHandler>(
				QUIZZ_CREATOR_TOKENS.CREATE_QUESTION_COMMAND_HANDLER,
			);

			const command = new CreateQuestionCommand({ ...input });
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
		.input(UpdateQuestionCommandProps)
		.output(QuestionOutput)
		.mutation(async ({ input }) => {
			const updateQuestionCommandHandler = quizzCreatorContainer.get<UpdateQuestionCommandHandler>(
				QUIZZ_CREATOR_TOKENS.UPDATE_QUESTION_COMMAND_HANDLER,
			);

			const command = new UpdateQuestionCommand(input);
			const question = await updateQuestionCommandHandler.execute(command);

			return {
				id: question.id,
				quizzId: question.quizzId,
				text: question.text,
				order: question.order,
				imageUrl: question.imageUrl,
			};
		}),
	deleteQuestion: protectedProcedure.input(DeleteQuestionCommandProps).mutation(async ({ input }) => {
		const deleteQuestionCommandHandler = quizzCreatorContainer.get<DeleteQuestionCommandHandler>(
			QUIZZ_CREATOR_TOKENS.DELETE_QUESTION_COMMAND_HANDLER,
		);

		const command = new DeleteQuestionCommand(input);
		await deleteQuestionCommandHandler.execute(command);
	}),
	getAllQuestions: protectedProcedure
		.input(GetAllQuestionsQueryProps)
		.output(QuestionOutput.array())
		.query(async ({ input }) => {
			const getAllQuestionsQueryHandler = quizzCreatorContainer.get<GetAllQuestionsQueryHandler>(
				QUIZZ_CREATOR_TOKENS.GET_ALL_QUESTIONS_QUERY_HANDLER,
			);

			const query = new GetAllQuestionsQuery({ quizzId: input.quizzId });
			const questions = await getAllQuestionsQueryHandler.execute(query);

			return questions.map(question => ({
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
				QUIZZ_CREATOR_TOKENS.GET_QUESTION_BY_ID_QUERY_HANDLER,
			);

			const question = await getQuestionByIdQueryHandler.execute(new GetQuestionByIdQuery(input));

			return question
				? {
						id: question.id,
						quizzId: question.quizzId,
						text: question.text,
						order: question.order,
						imageUrl: question.imageUrl,
				  }
				: null;
		}),
});
