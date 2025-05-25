import { z } from 'zod';
import { inject, injectable } from 'inversify';
import { QUIZZ_TAKER_TOKENS } from '@quizz-taker/quizz-taker.tokens';
import type { QuestionReader } from '@quizz-taker/domain/question/question.reader';
import type { Question } from '@quizz-taker/domain/question/question';

export const GetNextQuestionQueryProps = z.object({
	quizzId: z.string().uuid(),
	questionId: z.string().uuid().nullable(),
});

export type GetNextQuestionQueryProps = z.infer<typeof GetNextQuestionQueryProps>;

export class GetNextQuestionQuery {
	constructor(public readonly props: GetNextQuestionQueryProps) {}
}

@injectable()
export class GetNextQuestionQueryHandler {
	constructor(
		@inject(QUIZZ_TAKER_TOKENS.QUESTION_READER)
		private readonly questionReader: QuestionReader,
	) {}

	public async execute({ props }: GetNextQuestionQuery): Promise<Question | null> {
		return this.questionReader.findNextQuestion({ quizzId: props.quizzId, currentQuestionId: props.questionId });
	}
}
