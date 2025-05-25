import { z } from 'zod';
import { inject, injectable } from 'inversify';
import { QUIZZ_CREATOR_TOKENS } from '@quizz-creator/quizz-creator.tokens';
import type { QuestionRepository } from '@quizz-creator/domain/question/question.repository';
import { Question, QuestionProps } from '@quizz-creator/domain/question/question';
import { QuestionNotFound } from '@quizz-creator/domain/errors/quizz-creator.errors';

export const UpdateQuestionCommandProps = z.object({
	id: z.string().uuid('Question ID must be a valid UUID.'),
	text: z.string().min(1, 'Question text cannot be empty.').max(500, 'Question text is too long.').optional(),
	order: z.number().int().min(0, 'Order must be a non-negative integer.').optional(),
	imageUrl: z.string().url('Invalid URL format for image.').nullable().optional(),
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
	) {}

	public async execute({ props }: UpdateQuestionCommand): Promise<Question> {
		const existingQuestion = await this.questionRepository.findById({ id: props.id });
		if (!existingQuestion) {
			throw new QuestionNotFound(props.id);
		}

		if (props.text !== undefined) existingQuestion.setText(props.text);
		if (props.order !== undefined) existingQuestion.setOrder(props.order);
		if (props.imageUrl !== undefined) existingQuestion.setImageUrl(props.imageUrl);

		await this.questionRepository.save(existingQuestion);
		return existingQuestion;
	}
}
