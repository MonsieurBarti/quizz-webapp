import { z } from 'zod';
import { inject, injectable } from 'inversify';
import { QUIZZ_CREATOR_TOKENS } from '@quizz-creator/quizz-creator.tokens';
import type { AnswerRepository } from '@quizz-creator/domain/answer/answer.repository';
import { AnswerNotFound } from '@quizz-creator/domain/errors/quizz-creator.errors';

export const DeleteAnswerCommandProps = z.object({
	id: z.string().uuid('Answer ID must be a valid UUID.'),
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
	) {}

	public async execute({ props }: DeleteAnswerCommand): Promise<void> {
		const existingAnswer = await this.answerRepository.findById({ id: props.id });
		if (!existingAnswer) {
			throw new AnswerNotFound(props.id);
		}

		await this.answerRepository.deleteById({ id: props.id });
	}
}
