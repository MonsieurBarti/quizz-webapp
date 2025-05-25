import { z } from 'zod';
import { inject, injectable } from 'inversify';
import { QUIZZ_TAKER_TOKENS } from '@quizz-taker/quizz-taker.tokens';
import type { QuestionReader } from '@quizz-taker/domain/question/question.reader';
import type { Question } from '@quizz-taker/domain/question/question';

export const GetAllQuestionsQueryProps = z.object({
	quizzId: z.string().uuid(),
});

export type GetAllQuestionsQueryProps = z.infer<typeof GetAllQuestionsQueryProps>;

export class GetAllQuestionsQuery {
	constructor(public readonly props: GetAllQuestionsQueryProps) {}
}

@injectable()
export class GetAllQuestionsQueryHandler {
	constructor(
		@inject(QUIZZ_TAKER_TOKENS.QUESTION_READER)
		private readonly questionReader: QuestionReader,
	) {}

	public async execute({ props }: GetAllQuestionsQuery): Promise<Question[]> {
		return this.questionReader.findByQuizzId({ quizzId: props.quizzId });
	}
}
