import { z } from 'zod';
import { inject, injectable } from 'inversify';
import { QUIZZ_TAKER_TOKENS } from '@quizz-taker/quizz-taker.tokens';
import type { AnswerReader } from '@quizz-taker/domain/answer/answer.reader';
import type { Answer } from '@quizz-taker/domain/answer/answer';

export const GetAllAnswersQueryProps = z.object({
	questionId: z.string().uuid(),
});

export type GetAllAnswersQueryProps = z.infer<typeof GetAllAnswersQueryProps>;

export class GetAllAnswersQuery {
	constructor(public readonly props: GetAllAnswersQueryProps) {}
}

@injectable()
export class GetAllAnswersQueryHandler {
	constructor(
		@inject(QUIZZ_TAKER_TOKENS.ANSWER_READER)
		private readonly answerReader: AnswerReader,
	) {}

	public async execute({ props }: GetAllAnswersQuery): Promise<Answer[]> {
		return this.answerReader.findByQuestionId({ questionId: props.questionId });
	}
}
