import { z } from 'zod';
import { QUIZZ_CREATOR_TOKENS } from '@quizz-creator/quizz-creator.tokens';
import type { QuestionRepository } from '@quizz-creator/domain/question/question.repository';
import type { Question } from '@quizz-creator/domain/question/question';
import { inject } from 'inversify';

export const GetAllQuestionsQueryProps = z.object({
	quizzId: z.string().uuid(),
});

export type GetAllQuestionsQueryProps = z.infer<typeof GetAllQuestionsQueryProps>;

export class GetAllQuestionsQuery {
	constructor(public readonly props: GetAllQuestionsQueryProps) {}
}

export class GetAllQuestionsQueryHandler {
	constructor(
		@inject(QUIZZ_CREATOR_TOKENS.QUESTION_REPOSITORY)
		private readonly questionRepository: QuestionRepository,
	) {}

	public async execute({ props }: GetAllQuestionsQuery): Promise<Question[]> {
		return this.questionRepository.findByQuizzId({ quizzId: props.quizzId });
	}
}
