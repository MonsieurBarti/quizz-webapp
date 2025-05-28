import 'reflect-metadata';
import { describe, it, expect, beforeEach, vi } from 'vitest';
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
import type { Quizz } from '@quizz-creator/domain/quizz/quizz';
import type { Question } from '@quizz-creator/domain/question/question';

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

		vi.spyOn(questionRepository, 'save');
		vi.spyOn(questionRepository, 'findById');
		vi.spyOn(quizzRepository, 'findById');
		vi.spyOn(quizzRepository, 'save');
	});

	async function createExistingQuizz(creatorId: string = userId): Promise<Quizz> {
		const quizz = new QuizzBuilder().withCreatedBy(creatorId).build();
		await quizzRepository.save(quizz);
		vi.clearAllMocks(); // Reset call counts after setup
		return quizz;
	}

	function createQuestionCommand(
		quizzId: string,
		overrides: Partial<Omit<CreateQuestionCommandProps, 'quizzId' | 'context'>> = {},
		contextUserId: string = userId
	): CreateQuestionCommand {
		const defaultProps: CreateQuestionCommandProps = {
			quizzId,
			text: 'Default question text',
			order: 1,
			imageUrl: null,
			context: { userId: contextUserId },
			...overrides,
		};

		return new CreateQuestionCommand(defaultProps);
	}

	async function assertQuestionCreated(question: Question) {
		const savedQuestion = await questionRepository.findById({ id: question.id });
		expect(savedQuestion).toBeDefined();
		expect(savedQuestion?.id).toBe(question.id);
		expect(savedQuestion?.quizzId).toBe(question.quizzId);
		expect(savedQuestion?.text).toBe(question.text);
		expect(savedQuestion?.order).toBe(question.order);
		expect(savedQuestion?.imageUrl).toBe(question.imageUrl);
	}

	it('should create and save a new question for an existing quizz', async () => {
		// Arrange
		const existingQuizz = await createExistingQuizz();

		const questionId = crypto.randomUUID();
		const builtQuestion = new QuestionBuilder()
			.withId(questionId)
			.withQuizzId(existingQuizz.id)
			.withText('What is the capital of France?')
			.withOrder(1)
			.build();

		const command = createQuestionCommand(existingQuizz.id, {
			id: builtQuestion.id,
			text: builtQuestion.text,
			order: builtQuestion.order,
			imageUrl: builtQuestion.imageUrl,
		});

		// Act
		await handler.execute(command);

		// Assert
		expect(quizzRepository.findById).toHaveBeenCalledWith({ id: existingQuizz.id });
		expect(questionRepository.save).toHaveBeenCalledTimes(1);
		await assertQuestionCreated(builtQuestion);
	});

	it('should throw QuizzNotFound error if quizzId does not exist', async () => {
		// Arrange
		const nonExistentQuizzId = crypto.randomUUID();
		const command = createQuestionCommand(nonExistentQuizzId, {
			text: 'A question for a ghost quizz',
			order: 0,
		});

		// Act & Assert
		await expect(handler.execute(command)).rejects.toThrow(new QuizzNotFound(nonExistentQuizzId));
		expect(questionRepository.save).not.toHaveBeenCalled();
	});

	it('should create a question with a generated ID if no ID is provided', async () => {
		// Arrange
		const existingQuizz = await createExistingQuizz();
		const command = createQuestionCommand(existingQuizz.id, {
			// id is intentionally omitted
			text: 'Question with generated ID',
			order: 2,
		});

		// Act
		const createdQuestion = await handler.execute(command);

		// Assert
		expect(questionRepository.save).toHaveBeenCalledTimes(1);
		expect(createdQuestion.id).toBeDefined();
		expect(createdQuestion.id).toHaveLength(36); // UUID length
		
		const savedQuestion = await questionRepository.findById({ id: createdQuestion.id });
		expect(savedQuestion).toBeDefined();
		expect(savedQuestion?.quizzId).toBe(existingQuizz.id);
		expect(savedQuestion?.text).toBe('Question with generated ID');
	});

	it('should throw UnauthorizedQuizzAccess if user is not the owner of the quizz', async () => {
		// Arrange
		const existingQuizz = await createExistingQuizz();
		const command = createQuestionCommand(existingQuizz.id, {
			text: 'Unauthorized question',
			order: 1,
		}, differentUserId); // Different user trying to create a question

		// Act & Assert
		await expect(handler.execute(command)).rejects.toThrow(UnauthorizedQuizzAccess);
		await expect(handler.execute(command)).rejects.toThrow(
			`User ${differentUserId} is not authorized to access quizz ${existingQuizz.id}`
		);
		expect(questionRepository.save).not.toHaveBeenCalled();
	});
});
