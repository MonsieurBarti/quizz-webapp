import { z } from 'zod';
import { inject, injectable } from 'inversify';
import { QUIZZ_CREATOR_TOKENS } from '@quizz-creator/quizz-creator.tokens';
import type { QuizzRepository } from '@quizz-creator/domain/quizz/quizz.repository';
import type { Quizz } from '@quizz-creator/domain/quizz/quizz';

export const GetQuizzByIdQueryProps = z.object({
	id: z.string().uuid(),
});

export type GetQuizzByIdQueryProps = z.infer<typeof GetQuizzByIdQueryProps>;

export class GetQuizzByIdQuery {
	constructor(public readonly props: GetQuizzByIdQueryProps) {}
}

@injectable()
export class GetQuizzByIdQueryHandler {
	constructor(
		@inject(QUIZZ_CREATOR_TOKENS.QUIZZ_REPOSITORY)
		private readonly quizzRepository: QuizzRepository,
	) {}

	public async execute({ props }: GetQuizzByIdQuery): Promise<Quizz | null> {
		return this.quizzRepository.findById({ id: props.id });
	}
}
