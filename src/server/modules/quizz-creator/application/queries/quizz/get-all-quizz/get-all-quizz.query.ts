import { z } from 'zod';
import { QUIZZ_CREATOR_TOKENS } from '@quizz-creator/quizz-creator.tokens';
import type { QuizzRepository } from '@quizz-creator/domain/quizz/quizz.repository';
import type { Quizz } from '@quizz-creator/domain/quizz/quizz';
import { inject } from 'inversify';

export const GetAllQuizzQueryProps = z.object({
	createdBy: z.string().uuid(),
});

export type GetAllQuizzQueryProps = z.infer<typeof GetAllQuizzQueryProps>;

export class GetAllQuizzQuery {
	constructor(public readonly props: GetAllQuizzQueryProps) {}
}

export class GetAllQuizzQueryHandler {
	constructor(
		@inject(QUIZZ_CREATOR_TOKENS.QUIZZ_REPOSITORY)
		private readonly quizzRepository: QuizzRepository,
	) {}

	public async execute({ props }: GetAllQuizzQuery): Promise<Quizz[]> {
		return this.quizzRepository.findByCreatorId({ creatorId: props.createdBy });
	}
}
