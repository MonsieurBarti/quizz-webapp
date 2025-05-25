import { z } from 'zod';
import { inject, injectable } from 'inversify';
import { QUIZZ_TAKER_TOKENS } from '@quizz-taker/quizz-taker.tokens';
import type { QuizzReader } from '@quizz-taker/domain/quizz/quizz.reader';
import type { Quizz } from '@quizz-taker/domain/quizz/quizz';

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
		@inject(QUIZZ_TAKER_TOKENS.QUIZZ_READER)
		private readonly quizzReader: QuizzReader,
	) {}

	public async execute({ props }: GetQuizzByIdQuery): Promise<Quizz | null> {
		return this.quizzReader.findById({ id: props.id });
	}
}
