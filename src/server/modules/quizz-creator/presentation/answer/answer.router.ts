import { createTRPCRouter, protectedProcedure } from '@/server/api/trpc';
import { quizzCreatorContainer } from '../../quizz-creator.container';
import { QUIZZ_CREATOR_TOKENS } from '../../quizz-creator.tokens';
import { AnswerOutput } from './types';

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
import {
	GetAllAnswersQuery,
	GetAllAnswersQueryHandler,
	GetAllAnswersQueryProps,
} from '../../application/queries/answer/get-all-answers/get-all-answers.query';
import {
	GetAnswerByIdQuery,
	GetAnswerByIdQueryHandler,
	GetAnswerByIdQueryProps,
} from '../../application/queries/answer/get-answer-by-id/get-answer-by-id.query';

export const answerRouter = createTRPCRouter({
	createAnswer: protectedProcedure
		.input(CreateAnswerCommandProps.omit({ id: true }))
		.output(AnswerOutput)
		.mutation(async ({ input }) => {
			const createAnswerCommandHandler = quizzCreatorContainer.get<CreateAnswerCommandHandler>(
				QUIZZ_CREATOR_TOKENS.CREATE_ANSWER_COMMAND_HANDLER,
			);

			const command = new CreateAnswerCommand({ ...input });
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
		.input(UpdateAnswerCommandProps)
		.output(AnswerOutput)
		.mutation(async ({ input }) => {
			const updateAnswerCommandHandler = quizzCreatorContainer.get<UpdateAnswerCommandHandler>(
				QUIZZ_CREATOR_TOKENS.UPDATE_ANSWER_COMMAND_HANDLER,
			);

			const command = new UpdateAnswerCommand(input);
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
	deleteAnswer: protectedProcedure.input(DeleteAnswerCommandProps).mutation(async ({ input }) => {
		const deleteAnswerCommandHandler = quizzCreatorContainer.get<DeleteAnswerCommandHandler>(
			QUIZZ_CREATOR_TOKENS.DELETE_ANSWER_COMMAND_HANDLER,
		);

		const command = new DeleteAnswerCommand(input);
		await deleteAnswerCommandHandler.execute(command);
	}),
	getAllAnswers: protectedProcedure
		.input(GetAllAnswersQueryProps)
		.output(AnswerOutput.array())
		.query(async ({ input }) => {
			const getAllAnswersQueryHandler = quizzCreatorContainer.get<GetAllAnswersQueryHandler>(
				QUIZZ_CREATOR_TOKENS.GET_ALL_ANSWERS_QUERY_HANDLER,
			);

			const query = new GetAllAnswersQuery({ questionId: input.questionId });
			const answers = await getAllAnswersQueryHandler.execute(query);

			return answers.map(answer => ({
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
				QUIZZ_CREATOR_TOKENS.GET_ANSWER_BY_ID_QUERY_HANDLER,
			);

			const answer = await getAnswerByIdQueryHandler.execute(new GetAnswerByIdQuery(input));

			return answer
				? {
						id: answer.id,
						questionId: answer.questionId,
						text: answer.text,
						isCorrect: answer.isCorrect,
						order: answer.order,
						nextQuestionId: answer.nextQuestionId,
				  }
				: null;
		}),
});
