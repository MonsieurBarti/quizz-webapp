import { z } from 'zod';
import { inject, injectable } from 'inversify';
import { QUIZZ_CREATOR_TOKENS } from '@quizz-creator/quizz-creator.tokens';
import type { QuestionRepository } from '@quizz-creator/domain/question/question.repository';
import { QuestionNotFound } from '@quizz-creator/domain/errors/quizz-creator.errors';

export const DeleteQuestionCommandProps = z.object({
	id: z.string().uuid('Question ID must be a valid UUID.'),
});

export type DeleteQuestionCommandProps = z.infer<typeof DeleteQuestionCommandProps>;

export class DeleteQuestionCommand {
	constructor(public readonly props: DeleteQuestionCommandProps) {}
}

@injectable()
export class DeleteQuestionCommandHandler {
	constructor(
		@inject(QUIZZ_CREATOR_TOKENS.QUESTION_REPOSITORY)
		private readonly questionRepository: QuestionRepository,
	) {}

	public async execute({ props }: DeleteQuestionCommand): Promise<void> {
		const existingQuestion = await this.questionRepository.findById({ id: props.id });
		if (!existingQuestion) {
			throw new QuestionNotFound(props.id);
		}

		await this.questionRepository.deleteById({ id: props.id });
	}
}
