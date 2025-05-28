import 'reflect-metadata';
import { z } from 'zod';
import { inject, injectable } from 'inversify';
import { QUIZZ_TAKER_TOKENS } from '@quizz-taker/quizz-taker.tokens';
import type { ResponseRepository } from '@quizz-taker/domain/response/response.repository';
import { Response } from '@quizz-taker/domain/response/response';
import type { AnswerReader } from '@quizz-taker/domain/answer/answer.reader';
import { AnswerNotFound } from '@quizz-taker/domain/errors/quizz-taker.errors';

export const SaveResponseCommandProps = z.object({
	attemptId: z.string().uuid(),
	questionId: z.string().uuid(),
	answerId: z.string().uuid(),
	timeTakenMs: z.number().int().min(0, 'Time taken must be a non-negative integer.'),
});

export type SaveResponseCommandProps = z.infer<typeof SaveResponseCommandProps>;

export class SaveResponseCommand {
	constructor(public readonly props: SaveResponseCommandProps) {}
}

@injectable()
export class SaveResponseCommandHandler {
	constructor(
		@inject(QUIZZ_TAKER_TOKENS.RESPONSE_REPOSITORY)
		private readonly responseRepository: ResponseRepository,
		@inject(QUIZZ_TAKER_TOKENS.ANSWER_READER)
		private readonly answerReader: AnswerReader,
	) {}

	public async execute({ props }: SaveResponseCommand): Promise<Response> {
		const answer = await this.answerReader.findById(props.answerId);
		if (!answer) {
			throw new AnswerNotFound(props.answerId);
		}
		const response = Response.create({
			attemptId: props.attemptId,
			questionId: props.questionId,
			answerId: props.answerId,
			isCorrect: answer.isCorrect,
			timeTakenMs: props.timeTakenMs,
		});
		await this.responseRepository.save(response);
		return response;
	}
}
