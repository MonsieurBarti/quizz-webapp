import { createTRPCRouter, protectedProcedure } from '@/server/api/trpc';
import { quizzCreatorContainer } from '../../quizz-creator.container';
import { QUIZZ_CREATOR_TOKENS } from '../../quizz-creator.tokens';
import { QuizzOutput } from './types';

// Quizz Command and Query Imports
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
import {
	GetAllQuizzQuery,
	type GetAllQuizzQueryHandler,
} from '../../application/queries/quizz/get-all-quizz/get-all-quizz.query';
import {
	GetQuizzByIdQuery,
	GetQuizzByIdQueryHandler,
	GetQuizzByIdQueryProps,
} from '../../application/queries/quizz/get-quizz-by-id/get-quizz-by-id.query';

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
		.input(UpdateQuizzCommandProps)
		.output(QuizzOutput)
		.mutation(async ({ input }) => {
			const updateQuizzCommandHandler = quizzCreatorContainer.get<UpdateQuizzCommandHandler>(
				QUIZZ_CREATOR_TOKENS.UPDATE_QUIZZ_COMMAND_HANDLER,
			);

			const command = new UpdateQuizzCommand(input);
			const quizz = await updateQuizzCommandHandler.execute(command);

			return {
				id: quizz.id,
				title: quizz.title,
				description: quizz.description,
				isPublished: quizz.isPublished,
				createdBy: quizz.createdBy,
			};
		}),
	deleteQuizz: protectedProcedure.input(DeleteQuizzCommandProps).mutation(async ({ input }) => {
		const deleteQuizzCommandHandler = quizzCreatorContainer.get<DeleteQuizzCommandHandler>(
			QUIZZ_CREATOR_TOKENS.DELETE_QUIZZ_COMMAND_HANDLER,
		);

		const command = new DeleteQuizzCommand(input);
		await deleteQuizzCommandHandler.execute(command);
	}),
	getAllQuizz: protectedProcedure.output(QuizzOutput.array()).query(async ({ ctx }) => {
		const getAllQuizzQueryHandler = quizzCreatorContainer.get<GetAllQuizzQueryHandler>(
			QUIZZ_CREATOR_TOKENS.GET_ALL_QUIZZ_QUERY_HANDLER,
		);

		const query = new GetAllQuizzQuery({ createdBy: ctx.session.user.id });
		const quizzes = await getAllQuizzQueryHandler.execute(query); // Renamed to quizzes for clarity

		return quizzes.map(quizz => ({
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
		.query(async ({ input }) => {
			const getQuizzByIdQueryHandler = quizzCreatorContainer.get<GetQuizzByIdQueryHandler>(
				QUIZZ_CREATOR_TOKENS.GET_QUIZZ_BY_ID_QUERY_HANDLER,
			);

			const quizz = await getQuizzByIdQueryHandler.execute(new GetQuizzByIdQuery(input));

			return quizz
				? {
						id: quizz.id,
						title: quizz.title,
						description: quizz.description,
						isPublished: quizz.isPublished,
						createdBy: quizz.createdBy,
				  }
				: null;
		}),
});
