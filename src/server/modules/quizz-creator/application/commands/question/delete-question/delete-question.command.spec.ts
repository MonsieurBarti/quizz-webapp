import 'reflect-metadata';
import { describe, it, expect, beforeEach } from 'vitest';
import {
	DeleteQuestionCommand,
	DeleteQuestionCommandHandler,
	DeleteQuestionCommandProps,
} from './delete-question.command';
import { InMemoryQuestionRepository } from '@quizz-creator/infrastructure/persistence/question/in-memory-question.repository';
import { InMemoryQuizzRepository } from '@quizz-creator/infrastructure/persistence/quizz/in-memory-quizz.repository';
import { QuestionBuilder } from '@quizz-creator/domain/question/question.builder';
import { QuizzBuilder } from '@quizz-creator/domain/quizz/quizz.builder';
import { QuestionNotFound, UnauthorizedQuestionAccess } from '@quizz-creator/domain/errors/quizz-creator.errors';
import { Question } from '@quizz-creator/domain/question/question';

describe('DeleteQuestionCommandHandler', () => {
	let questionRepository: InMemoryQuestionRepository;
	let quizzRepository: InMemoryQuizzRepository;
	let handler: DeleteQuestionCommandHandler;
	let questionBuilder: QuestionBuilder;
	let quizzBuilder: QuizzBuilder;
	let existingQuestion: Question;
	const userId = '11111111-1111-1111-1111-111111111111';
	const differentUserId = '22222222-2222-2222-2222-222222222222';

	beforeEach(async () => {
		questionRepository = new InMemoryQuestionRepository();
		quizzRepository = new InMemoryQuizzRepository();
		handler = new DeleteQuestionCommandHandler(questionRepository, quizzRepository);
		questionBuilder = new QuestionBuilder();
		quizzBuilder = new QuizzBuilder();

		const parentQuizz = quizzBuilder.withCreatedBy(userId).build();
		await quizzRepository.save(parentQuizz);

		existingQuestion = questionBuilder.withQuizzId(parentQuizz.id).build();
		await questionRepository.save(existingQuestion);
	});

	it('should delete an existing answer successfully', async () => {
		// Arrange
		const parentQuizz = quizzBuilder.withCreatedBy(userId).build();
		await quizzRepository.save(parentQuizz);
		
		const questionToDelete = questionBuilder.withQuizzId(parentQuizz.id).build();
		await questionRepository.save(questionToDelete);
		expect(await questionRepository.findById({ id: questionToDelete.id! })).toBeDefined(); // Ensure it's there

		const commandProps: DeleteQuestionCommandProps = {
			id: questionToDelete.id!,
			context: { userId }
		};
		const command = new DeleteQuestionCommand(commandProps);

		// Act
		await handler.execute(command);

		// Assert
		const deletedQuestion = await questionRepository.findById({ id: questionToDelete.id! });
		expect(deletedQuestion).toBeNull();
	});

	it('should throw QuestionNotFound if the answer to delete does not exist', async () => {
		// Arrange
		const nonExistentQuestionId = '00000000-0000-0000-0000-000000000000';
		const commandProps: DeleteQuestionCommandProps = {
			id: nonExistentQuestionId,
			context: { userId }
		};
		const command = new DeleteQuestionCommand(commandProps);

		// Act & Assert
		await expect(handler.execute(command)).rejects.toThrow(QuestionNotFound);
		await expect(handler.execute(command)).rejects.toThrow(
			`Question with ID "${nonExistentQuestionId}" not found.`,
		);
	});

	it('should throw UnauthorizedQuestionAccess if user is not the owner of the parent quizz', async () => {
		// Arrange
		const parentQuizz = quizzBuilder.withCreatedBy(userId).build();
		await quizzRepository.save(parentQuizz);

		const question = questionBuilder
			.withQuizzId(parentQuizz.id)
			.build();
		await questionRepository.save(question);

		const commandProps: DeleteQuestionCommandProps = {
			id: question.id!,
			context: { userId: differentUserId } // Different user trying to delete
		};
		const command = new DeleteQuestionCommand(commandProps);

		// Act & Assert
		await expect(handler.execute(command)).rejects.toThrow(UnauthorizedQuestionAccess);
	});
});
