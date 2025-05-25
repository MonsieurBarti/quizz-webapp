import { z } from 'zod';
import { inject, injectable } from 'inversify';
import { QUIZZ_CREATOR_TOKENS } from '@quizz-creator/quizz-creator.tokens';
import type { Question } from '@quizz-creator/domain/question/question';
import type { QuestionRepository } from '@quizz-creator/domain/question/question.repository';

export const GetQuestionByIdQueryProps = z.object({
	id: z.string().uuid(),
});
export type GetQuestionByIdQueryProps = z.infer<typeof GetQuestionByIdQueryProps>;

export class GetQuestionByIdQuery {
	constructor(public readonly props: GetQuestionByIdQueryProps) {}
}

@injectable()
export class GetQuestionByIdQueryHandler {
	constructor(
		@inject(QUIZZ_CREATOR_TOKENS.QUESTION_REPOSITORY) private readonly questionRepository: QuestionRepository,
	) {}

	public async execute({ props }: GetQuestionByIdQuery): Promise<Question | null> {
		return this.questionRepository.findById({ id: props.id });
	}
}
