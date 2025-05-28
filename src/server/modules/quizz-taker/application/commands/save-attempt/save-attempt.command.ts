import 'reflect-metadata';
import { z } from 'zod';
import { inject, injectable } from 'inversify';
import { QUIZZ_TAKER_TOKENS } from '@quizz-taker/quizz-taker.tokens';
import type { AttemptRepository } from '@quizz-taker/domain/attempt/attempt.repository';
import { Attempt } from '@quizz-taker/domain/attempt/attempt';

export const SaveAttemptCommandProps = z.object({
	quizzId: z.string().uuid(),
	playerId: z.string().uuid(),
	completedAt: z.date().optional(),
	isCorrect: z.boolean(),
});

export type SaveAttemptCommandProps = z.infer<typeof SaveAttemptCommandProps>;

export class SaveAttemptCommand {
	constructor(public readonly props: SaveAttemptCommandProps) {}
}

@injectable()
export class SaveAttemptCommandHandler {
	constructor(
		@inject(QUIZZ_TAKER_TOKENS.ATTEMPT_REPOSITORY)
		private readonly attemptRepository: AttemptRepository,
	) {}

	public async execute({ props }: SaveAttemptCommand): Promise<Attempt> {
		let attempt: Attempt | null;
		attempt = await this.attemptRepository.findByPlayerIdAndQuizzId({
			playerId: props.playerId,
			quizzId: props.quizzId,
		});
		if (!attempt) {
			attempt = Attempt.create({
				quizzId: props.quizzId,
				playerId: props.playerId,
				startedAt: new Date(),
				completedAt: null,
			});
		}
		if (props.isCorrect) {
			attempt.incrementScore();
		}
		attempt.incrementTotalQuestionsAnswered();
		attempt.complete();
		await this.attemptRepository.save(attempt);
		return attempt;
	}
}
