import { z } from 'zod';
import { inject, injectable } from 'inversify';
import { QUIZZ_TAKER_TOKENS } from '@quizz-taker/quizz-taker.tokens';
import type { QuizzReader } from '@quizz-taker/domain/quizz/quizz.reader';
import type { Quizz } from '@quizz-taker/domain/quizz/quizz';

export const GetAllQuizzQueryProps = z.object({
	createdBy: z.string().uuid().nullable(),
});

export type GetAllQuizzQueryProps = z.infer<typeof GetAllQuizzQueryProps>;

export class GetAllQuizzQuery {
	constructor(public readonly props: GetAllQuizzQueryProps) {}
}

@injectable()
export class GetAllQuizzQueryHandler {
	constructor(
		@inject(QUIZZ_TAKER_TOKENS.QUIZZ_READER)
		private readonly quizzReader: QuizzReader,
	) {}

	public async execute({ props }: GetAllQuizzQuery): Promise<Quizz[]> {
		return this.quizzReader.findAll({ createdBy: props.createdBy });
	}
}
