import { z } from 'zod';
import { inject, injectable } from 'inversify';
import { QUIZZ_CREATOR_TOKENS } from '@quizz-creator/quizz-creator.tokens';
import type { AnswerRepository } from '@quizz-creator/domain/answer/answer.repository';
import { Answer, AnswerProps } from '@quizz-creator/domain/answer/answer';
import type { QuestionRepository } from '@quizz-creator/domain/question/question.repository';
import type { QuizzRepository } from '@quizz-creator/domain/quizz/quizz.repository';
import {
	AnswerNotFound,
	QuestionNotFound,
	QuizzNotFound,
	UnauthorizedAnswerAccess,
} from '@quizz-creator/domain/errors/quizz-creator.errors';

export const UpdateAnswerCommandProps = z.object({
	id: z.string().uuid('Answer ID must be a valid UUID.'),
	text: z.string().min(1, 'Answer text cannot be empty.').max(500, 'Answer text is too long.').optional(),
	isCorrect: z.boolean().optional(),
	order: z.number().int().min(0, 'Order must be a non-negative integer.').optional(),
	nextQuestionId: z.string().uuid('Next Question ID must be a valid UUID').nullable().optional(),
	context: z.object({
		userId: z.string().uuid('User ID must be a valid UUID.'),
	}),
});

export type UpdateAnswerCommandProps = z.infer<typeof UpdateAnswerCommandProps>;

export class UpdateAnswerCommand {
	constructor(public readonly props: UpdateAnswerCommandProps) {}
}

@injectable()
export class UpdateAnswerCommandHandler {
	constructor(
		@inject(QUIZZ_CREATOR_TOKENS.ANSWER_REPOSITORY)
		private readonly answerRepository: AnswerRepository,
		@inject(QUIZZ_CREATOR_TOKENS.QUESTION_REPOSITORY)
		private readonly questionRepository: QuestionRepository,
		@inject(QUIZZ_CREATOR_TOKENS.QUIZZ_REPOSITORY)
		private readonly quizzRepository: QuizzRepository,
	) {}

	public async execute({ props }: UpdateAnswerCommand): Promise<Answer> {
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

		if (props.text !== undefined) existingAnswer.setText(props.text);
		if (props.isCorrect !== undefined) existingAnswer.setIsCorrect(props.isCorrect);
		if (props.order !== undefined) existingAnswer.setOrder(props.order);
		if (props.nextQuestionId !== undefined) existingAnswer.setNextQuestionId(props.nextQuestionId);

		await this.answerRepository.save(existingAnswer);
		return existingAnswer;
	}
}
