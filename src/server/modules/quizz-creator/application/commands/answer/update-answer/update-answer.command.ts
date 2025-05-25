import { z } from 'zod';
import { inject, injectable } from 'inversify';
import { QUIZZ_CREATOR_TOKENS } from '@quizz-creator/quizz-creator.tokens';
import type { AnswerRepository } from '@quizz-creator/domain/answer/answer.repository';
import { Answer, AnswerProps } from '@quizz-creator/domain/answer/answer';
import { AnswerNotFound } from '@quizz-creator/domain/errors/quizz-creator.errors';

export const UpdateAnswerCommandProps = z.object({
	id: z.string().uuid('Answer ID must be a valid UUID.'),
	text: z.string().min(1, 'Answer text cannot be empty.').max(500, 'Answer text is too long.').optional(),
	isCorrect: z.boolean().optional(),
	order: z.number().int().min(0, 'Order must be a non-negative integer.').optional(),
	nextQuestionId: z.string().uuid('Next Question ID must be a valid UUID').nullable().optional(),
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
	) {}

	public async execute({ props }: UpdateAnswerCommand): Promise<Answer> {
		const existingAnswer = await this.answerRepository.findById({ id: props.id });
		if (!existingAnswer) {
			throw new AnswerNotFound(props.id);
		}

		if (props.text !== undefined) existingAnswer.setText(props.text);
		if (props.isCorrect !== undefined) existingAnswer.setIsCorrect(props.isCorrect);
		if (props.order !== undefined) existingAnswer.setOrder(props.order);
		if (props.nextQuestionId !== undefined) existingAnswer.setNextQuestionId(props.nextQuestionId);

		await this.answerRepository.save(existingAnswer);
		return existingAnswer;
	}
}
