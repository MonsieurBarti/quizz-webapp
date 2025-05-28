import 'reflect-metadata';
import { describe, it, expect, beforeEach } from 'vitest';
import {
	CreateQuestionCommand,
	CreateQuestionCommandHandler,
	CreateQuestionCommandProps,
} from './create-question.command';
import { InMemoryQuestionRepository } from '@quizz-creator/infrastructure/persistence/question/in-memory-question.repository';
import { InMemoryQuizzRepository } from '@quizz-creator/infrastructure/persistence/quizz/in-memory-quizz.repository';
import { QuestionBuilder } from '@quizz-creator/domain/question/question.builder';
import { QuizzBuilder } from '@quizz-creator/domain/quizz/quizz.builder';
import { QuizzNotFound, UnauthorizedQuizzAccess } from '@quizz-creator/domain/errors/quizz-creator.errors';
import crypto from 'crypto';

describe('CreateQuestionCommandHandler', () => {
	let handler: CreateQuestionCommandHandler;
	let questionRepository: InMemoryQuestionRepository;
	let quizzRepository: InMemoryQuizzRepository;
	const userId = '11111111-1111-1111-1111-111111111111';
	const differentUserId = '22222222-2222-2222-2222-222222222222';

	beforeEach(() => {
		questionRepository = new InMemoryQuestionRepository();
		quizzRepository = new InMemoryQuizzRepository();
		handler = new CreateQuestionCommandHandler(questionRepository, quizzRepository);
	});

	it('should create and save a new question for an existing quizz', async () => {
		// Arrange
		const existingQuizz = new QuizzBuilder().withCreatedBy(userId).build();
		await quizzRepository.save(existingQuizz);

		const questionId = crypto.randomUUID();
		const builtQuestion = new QuestionBuilder()
			.withId(questionId)
			.withQuizzId(existingQuizz.id)
			.withText('What is the capital of France?')
			.withOrder(1)
			.build();

		const commandProps: CreateQuestionCommandProps = {
			id: builtQuestion.id,
			quizzId: builtQuestion.quizzId,
			text: builtQuestion.text,
			order: builtQuestion.order,
			imageUrl: builtQuestion.imageUrl,
			context: { userId }
		};
		const command = new CreateQuestionCommand(commandProps);

		// Act
		await handler.execute(command);

		// Assert
		const savedQuestion = await questionRepository.findById({ id: builtQuestion.id });
		expect(savedQuestion).toBeDefined();
		expect(savedQuestion).not.toBeNull();
		expect(savedQuestion?.id).toBe(builtQuestion.id);
		expect(savedQuestion?.quizzId).toBe(existingQuizz.id);
		expect(savedQuestion?.text).toBe(builtQuestion.text);
		expect(savedQuestion?.order).toBe(builtQuestion.order);
		expect(savedQuestion?.imageUrl).toBe(builtQuestion.imageUrl);
	});

	it('should throw QuizzNotFound error if quizzId does not exist', async () => {
		// Arrange
		const nonExistentQuizzId = crypto.randomUUID();
		const commandProps: CreateQuestionCommandProps = {
			quizzId: nonExistentQuizzId,
			text: 'A question for a ghost quizz',
			order: 0,
			imageUrl: null,
			context: { userId }
		};
		const command = new CreateQuestionCommand(commandProps);

		// Act & Assert
		await expect(handler.execute(command)).rejects.toThrow(new QuizzNotFound(nonExistentQuizzId));
	});

	it('should create a question with a generated ID if no ID is provided', async () => {
		// Arrange
		const existingQuizz = new QuizzBuilder().withCreatedBy(userId).build();
		await quizzRepository.save(existingQuizz);

		const commandProps: CreateQuestionCommandProps = {
			// id is omitted
			quizzId: existingQuizz.id,
			text: 'Question with generated ID',
			order: 2,
			imageUrl: null,
			context: { userId }
		};
		const command = new CreateQuestionCommand(commandProps);

		// Act
		const createdQuestion = await handler.execute(command);

		// Assert
		expect(createdQuestion.id).toBeDefined();
		expect(createdQuestion.id).toHaveLength(36); // UUID length
		const savedQuestion = await questionRepository.findById({ id: createdQuestion.id });
		expect(savedQuestion).toBeDefined();
		expect(savedQuestion?.quizzId).toBe(existingQuizz.id);
		expect(savedQuestion?.text).toBe(commandProps.text);
	});

	it('should throw UnauthorizedQuizzAccess if user is not the owner of the quizz', async () => {
		// Arrange
		const existingQuizz = new QuizzBuilder().withCreatedBy(userId).build();
		await quizzRepository.save(existingQuizz);

		const commandProps: CreateQuestionCommandProps = {
			quizzId: existingQuizz.id,
			text: 'Unauthorized question',
			order: 1,
			imageUrl: null,
			context: { userId: differentUserId } // Different user trying to create a question
		};
		const command = new CreateQuestionCommand(commandProps);

		// Act & Assert
		await expect(handler.execute(command)).rejects.toThrow(UnauthorizedQuizzAccess);
		await expect(handler.execute(command)).rejects.toThrow(`User ${differentUserId} is not authorized to access quizz ${existingQuizz.id}`);
	});
});
