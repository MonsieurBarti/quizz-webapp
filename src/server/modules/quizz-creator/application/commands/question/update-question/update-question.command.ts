import { z } from 'zod';
import { inject, injectable } from 'inversify';
import { QUIZZ_CREATOR_TOKENS } from '@quizz-creator/quizz-creator.tokens';
import type { QuestionRepository } from '@quizz-creator/domain/question/question.repository';
import { Question, QuestionProps } from '@quizz-creator/domain/question/question';
import type { QuizzRepository } from '@quizz-creator/domain/quizz/quizz.repository';
import {
	QuestionNotFound,
	QuizzNotFound,
	UnauthorizedQuestionAccess,
} from '@quizz-creator/domain/errors/quizz-creator.errors';

export const UpdateQuestionCommandProps = z.object({
	id: z.string().uuid('Question ID must be a valid UUID.'),
	text: z.string().min(1, 'Question text cannot be empty.').max(500, 'Question text is too long.').optional(),
	order: z.number().int().min(0, 'Order must be a non-negative integer.').optional(),
	imageUrl: z.string().url('Invalid URL format for image.').nullable().optional(),
	context: z.object({
		userId: z.string().uuid('User ID must be a valid UUID.'),
	}),
});

export type UpdateQuestionCommandProps = z.infer<typeof UpdateQuestionCommandProps>;

export class UpdateQuestionCommand {
	constructor(public readonly props: UpdateQuestionCommandProps) {}
}

@injectable()
export class UpdateQuestionCommandHandler {
	constructor(
		@inject(QUIZZ_CREATOR_TOKENS.QUESTION_REPOSITORY)
		private readonly questionRepository: QuestionRepository,
		@inject(QUIZZ_CREATOR_TOKENS.QUIZZ_REPOSITORY)
		private readonly quizzRepository: QuizzRepository,
	) {}

	public async execute({ props }: UpdateQuestionCommand): Promise<Question> {
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

		if (props.text !== undefined) existingQuestion.setText(props.text);
		if (props.order !== undefined) existingQuestion.setOrder(props.order);
		if (props.imageUrl !== undefined) existingQuestion.setImageUrl(props.imageUrl);

		await this.questionRepository.save(existingQuestion);
		return existingQuestion;
	}
}
