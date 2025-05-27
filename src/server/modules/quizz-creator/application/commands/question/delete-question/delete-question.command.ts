import { z } from 'zod';
import { inject, injectable } from 'inversify';
import { QUIZZ_CREATOR_TOKENS } from '@quizz-creator/quizz-creator.tokens';
import type { QuestionRepository } from '@quizz-creator/domain/question/question.repository';
import type { QuizzRepository } from '@quizz-creator/domain/quizz/quizz.repository';
import {
	QuestionNotFound,
	QuizzNotFound,
	UnauthorizedQuestionAccess,
} from '@quizz-creator/domain/errors/quizz-creator.errors';

export const DeleteQuestionCommandProps = z.object({
	id: z.string().uuid('Question ID must be a valid UUID.'),
	context: z.object({
		userId: z.string().uuid('User ID must be a valid UUID.'),
	}),
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
		@inject(QUIZZ_CREATOR_TOKENS.QUIZZ_REPOSITORY)
		private readonly quizzRepository: QuizzRepository,
	) {}

	public async execute({ props }: DeleteQuestionCommand): Promise<void> {
		const existingQuestion = await this.questionRepository.findById({ id: props.id });
		if (!existingQuestion) {
			throw new QuestionNotFound(props.id);
		}

		const parentQuizz = await this.quizzRepository.findById({ id: existingQuestion.quizzId });
		if (!parentQuizz) {
			throw new QuizzNotFound(existingQuestion.quizzId);
		}

		if (parentQuizz.createdBy !== props.context.userId) {
			throw new UnauthorizedQuestionAccess(props.id, props.context.userId);
		}

		await this.questionRepository.deleteById({ id: props.id });
	}
}
