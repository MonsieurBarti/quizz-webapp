import { z } from 'zod';
import { inject, injectable } from 'inversify';
import { QUIZZ_CREATOR_TOKENS } from '@quizz-creator/quizz-creator.tokens';
import type { QuizzRepository } from '@quizz-creator/domain/quizz/quizz.repository';
import { QuizzNotFound } from '@quizz-creator/domain/errors/quizz-creator.errors';

export const DeleteQuizzCommandProps = z.object({
	id: z.string().uuid('Quizz ID must be a valid UUID.'),
});

export type DeleteQuizzCommandProps = z.infer<typeof DeleteQuizzCommandProps>;

export class DeleteQuizzCommand {
	constructor(public readonly props: DeleteQuizzCommandProps) {}
}

@injectable()
export class DeleteQuizzCommandHandler {
	constructor(
		@inject(QUIZZ_CREATOR_TOKENS.QUIZZ_REPOSITORY)
		private readonly quizzRepository: QuizzRepository,
	) {}

	public async execute({ props }: DeleteQuizzCommand): Promise<void> {
		const existingQuizz = await this.quizzRepository.findById({ id: props.id });
		if (!existingQuizz) {
			throw new QuizzNotFound(props.id);
		}

		await this.quizzRepository.deleteById({ id: props.id });
	}
}
