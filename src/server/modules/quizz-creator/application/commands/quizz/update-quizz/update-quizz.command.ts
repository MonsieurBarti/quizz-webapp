import { z } from 'zod';
import { inject, injectable } from 'inversify';
import { QUIZZ_CREATOR_TOKENS } from '@quizz-creator/quizz-creator.tokens';
import type { QuizzRepository } from '@quizz-creator/domain/quizz/quizz.repository';
import { Quizz } from '@quizz-creator/domain/quizz/quizz';
import { QuizzNotFound, UnauthorizedQuizzAccess } from '@quizz-creator/domain/errors/quizz-creator.errors';

export const UpdateQuizzCommandProps = z.object({
	id: z.string().uuid('Quizz ID must be a valid UUID.'),
	title: z.string().min(1, 'Quizz title cannot be empty.').max(500, 'Quizz title is too long.').optional(),
	description: z.string().max(500, 'Quizz description is too long.').optional(),
	isPublished: z.boolean().optional(),
	context: z.object({
		userId: z.string().uuid('User ID must be a valid UUID.'),
	}),
});

export type UpdateQuizzCommandProps = z.infer<typeof UpdateQuizzCommandProps>;

export class UpdateQuizzCommand {
	constructor(public readonly props: UpdateQuizzCommandProps) {}
}

@injectable()
export class UpdateQuizzCommandHandler {
	constructor(
		@inject(QUIZZ_CREATOR_TOKENS.QUIZZ_REPOSITORY)
		private readonly quizzRepository: QuizzRepository,
	) {}

	public async execute({ props }: UpdateQuizzCommand): Promise<Quizz> {
		const existingQuizz = await this.quizzRepository.findById({ id: props.id });

		if (!existingQuizz) {
			throw new QuizzNotFound(props.id);
		}

		if (existingQuizz.createdBy !== props.context.userId) {
			throw new UnauthorizedQuizzAccess(props.id, props.context.userId);
		}

		if (props.isPublished !== undefined) existingQuizz.setIsPublished(props.isPublished);
		if (props.title !== undefined) existingQuizz.setTitle(props.title);
		if (props.description !== undefined) existingQuizz.setDescription(props.description);

		await this.quizzRepository.save(existingQuizz);
		return existingQuizz;
	}
}
