import 'reflect-metadata';
import { z } from 'zod';
import { inject, injectable } from 'inversify';
import { QUIZZ_CREATOR_TOKENS } from '@quizz-creator/quizz-creator.tokens';
import type { AnswerRepository } from '@quizz-creator/domain/answer/answer.repository';
import { Answer, AnswerProps } from '@quizz-creator/domain/answer/answer';
import type { QuestionRepository } from '@quizz-creator/domain/question/question.repository';
import type { QuizzRepository } from '@quizz-creator/domain/quizz/quizz.repository';
import {
	QuestionNotFound,
	QuizzNotFound,
	UnauthorizedQuizzAccess,
} from '@quizz-creator/domain/errors/quizz-creator.errors';

export const CreateAnswerCommandProps = z.object({
	id: z.string().uuid().nullable().optional(),
	questionId: z.string().uuid('Question ID must be a valid UUID'),
	text: z.string().min(1, 'Answer text cannot be empty.').max(500, 'Answer text is too long.'),
	isCorrect: z.boolean(),
	order: z.number().int().min(0, 'Order must be a non-negative integer.'),
	nextQuestionId: z.string().uuid('Next Question ID must be a valid UUID').nullable(),
	context: z.object({
		userId: z.string().uuid('User ID must be a valid UUID.'),
	}),
});

export type CreateAnswerCommandProps = z.infer<typeof CreateAnswerCommandProps>;

export class CreateAnswerCommand {
	constructor(public readonly props: CreateAnswerCommandProps) {}
}

@injectable()
export class CreateAnswerCommandHandler {
	constructor(
		@inject(QUIZZ_CREATOR_TOKENS.ANSWER_REPOSITORY)
		private readonly answerRepository: AnswerRepository,
		@inject(QUIZZ_CREATOR_TOKENS.QUESTION_REPOSITORY)
		private readonly questionRepository: QuestionRepository,
		@inject(QUIZZ_CREATOR_TOKENS.QUIZZ_REPOSITORY)
		private readonly quizzRepository: QuizzRepository,
	) {}

	public async execute({ props }: CreateAnswerCommand): Promise<Answer> {
		const question = await this.questionRepository.findById({ id: props.questionId });
		if (!question) {
			throw new QuestionNotFound(props.questionId);
		}

		const parentQuizz = await this.quizzRepository.findById({ id: question.quizzId });
		if (!parentQuizz) {
			throw new QuizzNotFound(question.quizzId);
		}

		if (parentQuizz.createdBy !== props.context.userId) {
			throw new UnauthorizedQuizzAccess(question.quizzId, props.context.userId);
		}

		const answerToCreateProps: AnswerProps = {
			id: props.id,
			questionId: props.questionId,
			text: props.text,
			isCorrect: props.isCorrect,
			order: props.order,
			nextQuestionId: props.nextQuestionId,
		};

		const answer = Answer.create(answerToCreateProps);
		await this.answerRepository.save(answer);

		return answer;
	}
}
