import { z } from 'zod';
import { inject, injectable } from 'inversify';
import { QUIZZ_CREATOR_TOKENS } from '@quizz-creator/quizz-creator.tokens';
import type { Answer } from '@quizz-creator/domain/answer/answer';
import type { AnswerRepository } from '@quizz-creator/domain/answer/answer.repository';

export const GetAnswerByIdQueryProps = z.object({
	id: z.string().uuid(),
});
export type GetAnswerByIdQueryProps = z.infer<typeof GetAnswerByIdQueryProps>;

export class GetAnswerByIdQuery {
	constructor(public readonly props: GetAnswerByIdQueryProps) {}
}

@injectable()
export class GetAnswerByIdQueryHandler {
	constructor(@inject(QUIZZ_CREATOR_TOKENS.ANSWER_REPOSITORY) private readonly answerRepository: AnswerRepository) {}

	public async execute({ props }: GetAnswerByIdQuery): Promise<Answer | null> {
		return this.answerRepository.findById({ id: props.id });
	}
}
