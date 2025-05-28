import 'reflect-metadata';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { UpdateAnswerCommand, UpdateAnswerCommandHandler, UpdateAnswerCommandProps } from './update-answer.command';
import { InMemoryAnswerRepository } from '@quizz-creator/infrastructure/persistence/answer/in-memory-answer.repository';
import { InMemoryQuestionRepository } from '@quizz-creator/infrastructure/persistence/question/in-memory-question.repository';
import { InMemoryQuizzRepository } from '@quizz-creator/infrastructure/persistence/quizz/in-memory-quizz.repository';
import { AnswerBuilder } from '@quizz-creator/domain/answer/answer.builder';
import { QuestionBuilder } from '@quizz-creator/domain/question/question.builder';
import { QuizzBuilder } from '@quizz-creator/domain/quizz/quizz.builder';
import { AnswerNotFound, UnauthorizedAnswerAccess } from '@quizz-creator/domain/errors/quizz-creator.errors';
import type { Answer } from '@quizz-creator/domain/answer/answer';
import type { Question } from '@quizz-creator/domain/question/question';
import type { Quizz } from '@quizz-creator/domain/quizz/quizz';

describe('UpdateAnswerCommandHandler', () => {
	let answerRepository: InMemoryAnswerRepository;
	let questionRepository: InMemoryQuestionRepository;
	let quizzRepository: InMemoryQuizzRepository;
	let handler: UpdateAnswerCommandHandler;
	const userId = '11111111-1111-1111-1111-111111111111';
	const differentUserId = '22222222-2222-2222-2222-222222222222';

	beforeEach(() => {
		answerRepository = new InMemoryAnswerRepository();
		questionRepository = new InMemoryQuestionRepository();
		quizzRepository = new InMemoryQuizzRepository();
		handler = new UpdateAnswerCommandHandler(answerRepository, questionRepository, quizzRepository);

		vi.spyOn(answerRepository, 'findById');
		vi.spyOn(answerRepository, 'save');
		vi.spyOn(questionRepository, 'findById');
		vi.spyOn(quizzRepository, 'findById');
	});

	async function createQuizz(creatorId: string = userId): Promise<Quizz> {
		const quizz = new QuizzBuilder()
			.withCreatedBy(creatorId)
			.build();
		await quizzRepository.save(quizz);
		return quizz;
	}

	async function createQuestion(quizzId: string): Promise<Question> {
		const question = new QuestionBuilder()
			.withQuizzId(quizzId)
			.build();
		await questionRepository.save(question);
		return question;
	}

	async function createAnswer({
		questionId,
		text = 'Test Answer',
		isCorrect = false,
		order = 0,
		nextQuestionId = null
	}: {
		questionId: string;
		text?: string;
		isCorrect?: boolean;
		order?: number;
		nextQuestionId?: string | null;
	}): Promise<Answer> {
		const answer = new AnswerBuilder()
			.withQuestionId(questionId)
			.withText(text)
			.withIsCorrect(isCorrect)
			.withOrder(order)
			.withNextQuestionId(nextQuestionId)
			.build();
		await answerRepository.save(answer);
		vi.clearAllMocks(); // Reset call counts after setup
		return answer;
	}

	function createUpdateCommand(
		answerId: string,
		updates: Partial<Omit<UpdateAnswerCommandProps, 'id' | 'context'>> = {},
		contextUserId: string = userId
	): UpdateAnswerCommand {
		const props: UpdateAnswerCommandProps = {
			id: answerId,
			context: { userId: contextUserId },
			...updates
		};
		return new UpdateAnswerCommand(props);
	}

	async function assertAnswerUpdated(answer: Answer, expectedValues: Partial<Answer>) {
		const savedAnswer = await answerRepository.findById({ id: answer.id! });
		expect(savedAnswer).toBeDefined();
		
		Object.entries(expectedValues).forEach(([key, value]) => {
			expect(savedAnswer?.[key as keyof Answer]).toBe(value);
		});
	}

	it('should update an existing answer successfully', async () => {
		// Arrange
		const quizz = await createQuizz();
		const question = await createQuestion(quizz.id!);
		const nextQuestion = await createQuestion(quizz.id!);
		
		const initialAnswer = await createAnswer({
			questionId: question.id!,
			text: 'Old text',
			isCorrect: false,
			order: 1
		});

		const updates = {
			text: 'New updated text',
			isCorrect: true,
			order: 2,
			nextQuestionId: nextQuestion.id
		};
		const command = createUpdateCommand(initialAnswer.id!, updates);

		// Act
		const result = await handler.execute(command);

		// Assert
		expect(answerRepository.findById).toHaveBeenCalledWith({ id: initialAnswer.id! });
		expect(questionRepository.findById).toHaveBeenCalledWith({ id: question.id! });
		expect(quizzRepository.findById).toHaveBeenCalledWith({ id: quizz.id! });
		expect(answerRepository.save).toHaveBeenCalledTimes(1);
		
		expect(result.id).toBe(initialAnswer.id);
		expect(result.text).toBe(updates.text);
		expect(result.isCorrect).toBe(updates.isCorrect);
		expect(result.order).toBe(updates.order);
		expect(result.nextQuestionId).toBe(updates.nextQuestionId);

		await assertAnswerUpdated(initialAnswer, updates);
	});

	it('should throw AnswerNotFound if the answer to update does not exist', async () => {
		// Arrange
		const nonExistentAnswerId = '00000000-0000-0000-0000-000000000000';
		const command = createUpdateCommand(nonExistentAnswerId, {
			text: 'Text for a ghost answer'
		});

		// Act & Assert
		await expect(handler.execute(command)).rejects.toThrow(AnswerNotFound);
		await expect(handler.execute(command)).rejects.toThrow(`Answer with ID "${nonExistentAnswerId}" not found.`);
		expect(answerRepository.save).not.toHaveBeenCalled();
	});

	it('should partially update an answer if only some fields are provided', async () => {
		// Arrange
		const quizz = await createQuizz();
		const question = await createQuestion(quizz.id!);
		const initialAnswer = await createAnswer({
			questionId: question.id!,
			text: 'Initial Text',
			isCorrect: false,
			order: 0
		});

		const updates = {
			text: 'Partially Updated Text'
			// isCorrect and order are not provided
		};
		const command = createUpdateCommand(initialAnswer.id!, updates);

		// Act
		const result = await handler.execute(command);

		// Assert
		expect(answerRepository.findById).toHaveBeenCalledWith({ id: initialAnswer.id! });
		expect(answerRepository.save).toHaveBeenCalledTimes(1);
		
		expect(result.text).toBe(updates.text);
		expect(result.isCorrect).toBe(initialAnswer.isCorrect); // Should remain unchanged
		expect(result.order).toBe(initialAnswer.order); // Should remain unchanged

		await assertAnswerUpdated(initialAnswer, {
			text: updates.text,
			isCorrect: initialAnswer.isCorrect,
			order: initialAnswer.order
		});
	});

	it('should correctly update nextQuestionId to null', async () => {
		// Arrange
		const quizz = await createQuizz();
		const question = await createQuestion(quizz.id!);
		const nextQuestion = await createQuestion(quizz.id!);
		
		const initialAnswer = await createAnswer({
			questionId: question.id!,
			nextQuestionId: nextQuestion.id
		});

		const updates = {
			nextQuestionId: null
		};
		const command = createUpdateCommand(initialAnswer.id!, updates);

		// Act
		const result = await handler.execute(command);

		// Assert
		expect(answerRepository.findById).toHaveBeenCalledWith({ id: initialAnswer.id! });
		expect(answerRepository.save).toHaveBeenCalledTimes(1);
		
		expect(result.nextQuestionId).toBeNull();
		await assertAnswerUpdated(initialAnswer, { nextQuestionId: null });
	});

	it('should throw UnauthorizedAnswerAccess if user is not the owner of the parent quizz', async () => {
		// Arrange
		const quizz = await createQuizz(userId); // Owned by userId
		const question = await createQuestion(quizz.id!);
		const answer = await createAnswer({
			questionId: question.id!,
			text: 'Answer to update'
		});

		const command = createUpdateCommand(
			answer.id!,
			{ text: 'Unauthorized update attempt' },
			differentUserId // Different user trying to update
		);

		// Act & Assert
		await expect(handler.execute(command)).rejects.toThrow(UnauthorizedAnswerAccess);
		expect(answerRepository.save).not.toHaveBeenCalled();
	});
});
