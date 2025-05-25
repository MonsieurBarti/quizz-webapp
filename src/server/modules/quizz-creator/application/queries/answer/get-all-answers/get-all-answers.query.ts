import { z } from 'zod';
import { QUIZZ_CREATOR_TOKENS } from '@quizz-creator/quizz-creator.tokens';
import { inject } from 'inversify';
import type { AnswerRepository } from '@quizz-creator/domain/answer/answer.repository';
import type { Answer } from '@quizz-creator/domain/answer/answer';

export const GetAllAnswersQueryProps = z.object({
	questionId: z.string().uuid(),
});

export type GetAllAnswersQueryProps = z.infer<typeof GetAllAnswersQueryProps>;

export class GetAllAnswersQuery {
	constructor(public readonly props: GetAllAnswersQueryProps) {}
}

export class GetAllAnswersQueryHandler {
	constructor(
		@inject(QUIZZ_CREATOR_TOKENS.ANSWER_REPOSITORY)
		private readonly answerRepository: AnswerRepository,
	) {}

	public async execute({ props }: GetAllAnswersQuery): Promise<Answer[]> {
		return this.answerRepository.findByQuestionId({ questionId: props.questionId });
	}
}
