import 'reflect-metadata';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
	UpdateQuestionCommand,
	UpdateQuestionCommandHandler,
	UpdateQuestionCommandProps,
} from './update-question.command';
import { InMemoryQuestionRepository } from '@quizz-creator/infrastructure/persistence/question/in-memory-question.repository';
import { InMemoryQuizzRepository } from '@quizz-creator/infrastructure/persistence/quizz/in-memory-quizz.repository';
import { QuestionBuilder } from '@quizz-creator/domain/question/question.builder';
import { QuizzBuilder } from '@quizz-creator/domain/quizz/quizz.builder';
import { QuestionNotFound, UnauthorizedQuestionAccess } from '@quizz-creator/domain/errors/quizz-creator.errors';
import type { Question } from '@quizz-creator/domain/question/question';
import type { Quizz } from '@quizz-creator/domain/quizz/quizz';

describe('UpdateQuestionCommandHandler', () => {
	let questionRepository: InMemoryQuestionRepository;
	let quizzRepository: InMemoryQuizzRepository;
	let handler: UpdateQuestionCommandHandler;
	const userId = '11111111-1111-1111-1111-111111111111';
	const differentUserId = '22222222-2222-2222-2222-222222222222';

	beforeEach(() => {
		questionRepository = new InMemoryQuestionRepository();
		quizzRepository = new InMemoryQuizzRepository();
		handler = new UpdateQuestionCommandHandler(questionRepository, quizzRepository);

		vi.spyOn(questionRepository, 'findById');
		vi.spyOn(questionRepository, 'save');
		vi.spyOn(quizzRepository, 'findById');
	});

	async function createQuizz(creatorId: string = userId): Promise<Quizz> {
		const quizz = new QuizzBuilder()
			.withCreatedBy(creatorId)
			.build();
		await quizzRepository.save(quizz);
		return quizz;
	}

	async function createQuestion({
		quizzId,
		text = 'Test Question',
		order = 0,
		imageUrl = null
	}: {
		quizzId: string;
		text?: string;
		order?: number;
		imageUrl?: string | null;
	}): Promise<Question> {
		const question = new QuestionBuilder()
			.withQuizzId(quizzId)
			.withText(text)
			.withOrder(order)
			.withImageUrl(imageUrl)
			.build();
		await questionRepository.save(question);
		vi.clearAllMocks(); // Reset call counts after setup
		return question;
	}

	function createUpdateCommand(
		questionId: string,
		updates: Partial<Omit<UpdateQuestionCommandProps, 'id' | 'context'>> = {},
		contextUserId: string = userId
	): UpdateQuestionCommand {
		const props: UpdateQuestionCommandProps = {
			id: questionId,
			context: { userId: contextUserId },
			...updates
		};
		return new UpdateQuestionCommand(props);
	}

	async function assertQuestionUpdated(question: Question, expectedValues: Partial<Question>) {
		const savedQuestion = await questionRepository.findById({ id: question.id! });
		expect(savedQuestion).toBeDefined();
		
		Object.entries(expectedValues).forEach(([key, value]) => {
			expect(savedQuestion?.[key as keyof Question]).toBe(value);
		});
	}

	it('should update an existing question successfully', async () => {
		// Arrange
		const parentQuizz = await createQuizz();
		const initialQuestion = await createQuestion({
			quizzId: parentQuizz.id!,
			text: 'Old text',
			order: 1,
			imageUrl: null
		});

		const updates = {
			text: 'New updated text',
			order: 2,
			imageUrl: 'https://example.com/new-image.jpg'
		};
		const command = createUpdateCommand(initialQuestion.id!, updates);

		// Act
		const result = await handler.execute(command);

		// Assert
		expect(questionRepository.findById).toHaveBeenCalledWith({ id: initialQuestion.id! });
		expect(quizzRepository.findById).toHaveBeenCalledWith({ id: parentQuizz.id! });
		expect(questionRepository.save).toHaveBeenCalledTimes(1);
		
		expect(result.id).toBe(initialQuestion.id);
		expect(result.text).toBe(updates.text);
		expect(result.order).toBe(updates.order);
		expect(result.imageUrl).toBe(updates.imageUrl);

		await assertQuestionUpdated(initialQuestion, updates);
	});

	it('should throw QuestionNotFound if the question to update does not exist', async () => {
		// Arrange
		const nonExistentQuestionId = '00000000-0000-0000-0000-000000000000';
		const command = createUpdateCommand(nonExistentQuestionId, {
			text: 'Text for a ghost question'
		});

		// Act & Assert
		await expect(handler.execute(command)).rejects.toThrow(QuestionNotFound);
		await expect(handler.execute(command)).rejects.toThrow(
			`Question with ID "${nonExistentQuestionId}" not found.`
		);
		expect(questionRepository.save).not.toHaveBeenCalled();
	});

	it('should partially update a question if only some fields are provided', async () => {
		// Arrange
		const parentQuizz = await createQuizz();
		const initialQuestion = await createQuestion({
			quizzId: parentQuizz.id!,
			text: 'Initial Text',
			order: 0,
			imageUrl: null
		});

		const updates = {
			text: 'Partially Updated Text'
			// order and imageUrl are not provided
		};
		const command = createUpdateCommand(initialQuestion.id!, updates);

		// Act
		const result = await handler.execute(command);

		// Assert
		expect(questionRepository.findById).toHaveBeenCalledWith({ id: initialQuestion.id! });
		expect(questionRepository.save).toHaveBeenCalledTimes(1);
		
		expect(result.text).toBe(updates.text);
		expect(result.order).toBe(initialQuestion.order); // Should remain unchanged
		expect(result.imageUrl).toBe(initialQuestion.imageUrl); // Should remain unchanged

		await assertQuestionUpdated(initialQuestion, {
			text: updates.text,
			order: initialQuestion.order,
			imageUrl: initialQuestion.imageUrl
		});
	});

	it('should throw UnauthorizedQuestionAccess if user is not the owner of the parent quizz', async () => {
		// Arrange
		const parentQuizz = await createQuizz(userId); // Owned by userId
		const question = await createQuestion({
			quizzId: parentQuizz.id!,
			text: 'Question to update'
		});

		const command = createUpdateCommand(
			question.id!,
			{ text: 'Unauthorized update attempt' },
			differentUserId // Different user trying to update
		);

		// Act & Assert
		await expect(handler.execute(command)).rejects.toThrow(UnauthorizedQuestionAccess);
		expect(questionRepository.save).not.toHaveBeenCalled();
	});
});
