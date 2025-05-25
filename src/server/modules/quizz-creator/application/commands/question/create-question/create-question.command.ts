import 'reflect-metadata';
import { z } from 'zod';
import { inject, injectable } from 'inversify';
import { QUIZZ_CREATOR_TOKENS } from '@quizz-creator/quizz-creator.tokens';
import type { QuestionRepository } from '@quizz-creator/domain/question/question.repository';
import { Question, QuestionProps } from '@quizz-creator/domain/question/question';
import type { QuizzRepository } from '@quizz-creator/domain/quizz/quizz.repository';
import { QuizzNotFound } from '@quizz-creator/domain/errors/quizz-creator.errors';

export const CreateQuestionCommandProps = z.object({
	id: z.string().uuid().optional(),
	quizzId: z.string().uuid('Quizz ID must be a valid UUID'),
	text: z.string().min(1, 'Question text cannot be empty.').max(1000, 'Question text is too long.'),
	order: z.number().int().min(0, 'Order must be a non-negative integer.'),
	imageUrl: z.string().url('Invalid URL format for image.').nullable(),
});

export type CreateQuestionCommandProps = z.infer<typeof CreateQuestionCommandProps>;

export class CreateQuestionCommand {
	constructor(public readonly props: CreateQuestionCommandProps) {}
}

@injectable()
export class CreateQuestionCommandHandler {
	constructor(
		@inject(QUIZZ_CREATOR_TOKENS.QUESTION_REPOSITORY)
		private readonly questionRepository: QuestionRepository,
		@inject(QUIZZ_CREATOR_TOKENS.QUIZZ_REPOSITORY)
		private readonly quizzRepository: QuizzRepository,
	) {}

	public async execute({ props }: CreateQuestionCommand): Promise<Question> {
		const quizz = await this.quizzRepository.findById({ id: props.quizzId });
		if (!quizz) {
			throw new QuizzNotFound(props.quizzId);
		}
		const questionToCreateProps: QuestionProps = {
			id: props.id,
			quizzId: props.quizzId,
			text: props.text,
			order: props.order,
			imageUrl: props.imageUrl,
		};

		const question = Question.create(questionToCreateProps);
		await this.questionRepository.save(question);

		return question;
	}
}
