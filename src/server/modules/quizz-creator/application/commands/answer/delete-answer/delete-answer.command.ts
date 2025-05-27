import { z } from 'zod';
import { inject, injectable } from 'inversify';
import { QUIZZ_CREATOR_TOKENS } from '@quizz-creator/quizz-creator.tokens';
import type { AnswerRepository } from '@quizz-creator/domain/answer/answer.repository';
import type { QuestionRepository } from '@quizz-creator/domain/question/question.repository';
import type { QuizzRepository } from '@quizz-creator/domain/quizz/quizz.repository';
import {
	AnswerNotFound,
	QuestionNotFound,
	QuizzNotFound,
	UnauthorizedAnswerAccess,
} from '@quizz-creator/domain/errors/quizz-creator.errors';

export const DeleteAnswerCommandProps = z.object({
	id: z.string().uuid('Answer ID must be a valid UUID.'),
	context: z.object({
		userId: z.string().uuid('User ID must be a valid UUID.'),
	}),
});

export type DeleteAnswerCommandProps = z.infer<typeof DeleteAnswerCommandProps>;

export class DeleteAnswerCommand {
	constructor(public readonly props: DeleteAnswerCommandProps) {}
}

@injectable()
export class DeleteAnswerCommandHandler {
	constructor(
		@inject(QUIZZ_CREATOR_TOKENS.ANSWER_REPOSITORY)
		private readonly answerRepository: AnswerRepository,
		@inject(QUIZZ_CREATOR_TOKENS.QUESTION_REPOSITORY)
		private readonly questionRepository: QuestionRepository,
		@inject(QUIZZ_CREATOR_TOKENS.QUIZZ_REPOSITORY)
		private readonly quizzRepository: QuizzRepository,
	) {}

	public async execute({ props }: DeleteAnswerCommand): Promise<void> {
		const existingAnswer = await this.answerRepository.findById({ id: props.id });
		if (!existingAnswer) {
			throw new AnswerNotFound(props.id);
		}

		const parentQuestion = await this.questionRepository.findById({ id: existingAnswer.questionId });
		if (!parentQuestion) {
			throw new QuestionNotFound(existingAnswer.questionId);
		}

		const parentQuizz = await this.quizzRepository.findById({ id: parentQuestion.quizzId });
		if (!parentQuizz) {
			throw new QuizzNotFound(parentQuestion.quizzId);
		}

		if (parentQuizz.createdBy !== props.context.userId) {
			throw new UnauthorizedAnswerAccess(props.id, props.context.userId);
		}

		await this.answerRepository.deleteById({ id: props.id });
	}
}
