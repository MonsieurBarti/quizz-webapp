import 'reflect-metadata';
import { z } from 'zod';
import { inject, injectable } from 'inversify';
import { QUIZZ_CREATOR_TOKENS } from '@quizz-creator/quizz-creator.tokens';
import type { QuizzRepository } from '@quizz-creator/domain/quizz/quizz.repository';
import { Quizz, QuizzProps } from '@quizz-creator/domain/quizz/quizz';

export const CreateQuizzCommandProps = z.object({
	id: z.string().uuid().optional(),
	title: z
		.string()
		.min(1, 'Title must be at least 1 character long')
		.max(256, 'Title can be at most 256 characters long'),
	description: z.string().max(1024, 'Description can be at most 1024 characters long').nullable(),
	createdBy: z.string().uuid('Creator ID must be a valid UUID'),
});

export type CreateQuizzCommandProps = z.infer<typeof CreateQuizzCommandProps>;

export class CreateQuizzCommand {
	constructor(public readonly props: CreateQuizzCommandProps) {}
}

@injectable()
export class CreateQuizzCommandHandler {
	constructor(
		@inject(QUIZZ_CREATOR_TOKENS.QUIZZ_REPOSITORY)
		private readonly quizzRepository: QuizzRepository,
	) {}

	public async execute({ props }: CreateQuizzCommand): Promise<Quizz> {
		const quizzToCreateProps: QuizzProps = {
			id: props.id,
			title: props.title,
			description: props.description,
			createdBy: props.createdBy,
			isPublished: false,
		};

		const quizz = Quizz.create(quizzToCreateProps);
		await this.quizzRepository.save(quizz);

		return quizz;
	}
}
