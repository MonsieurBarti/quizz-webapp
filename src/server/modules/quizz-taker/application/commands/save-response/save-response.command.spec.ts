import { describe, it, expect, beforeEach, vi } from 'vitest';
import { SaveResponseCommand, SaveResponseCommandHandler } from './save-response.command';
import { InMemoryResponseRepository } from '@quizz-taker/infrastructure/persistence/response/in-memory-response.repository';
import { InMemoryAnswerReader } from '@quizz-taker/infrastructure/persistence/answer/in-memory-answer.reader';
import { faker } from '@faker-js/faker';
import type { Answer } from '@quizz-taker/domain/answer/answer';

describe('SaveResponseCommandHandler', () => {
	let responseRepository: InMemoryResponseRepository;
	let answerReader: InMemoryAnswerReader;
	let handler: SaveResponseCommandHandler;
	let attemptId: string;
	let questionId: string;
	let answerId: string;
	let timeTakenMs: number;

	beforeEach(() => {
		responseRepository = new InMemoryResponseRepository();
		answerReader = new InMemoryAnswerReader();
		handler = new SaveResponseCommandHandler(responseRepository, answerReader);
		attemptId = faker.string.uuid();
		questionId = faker.string.uuid();
		answerId = faker.string.uuid();
		timeTakenMs = faker.number.int({ min: 1000, max: 10000 });

		vi.spyOn(responseRepository, 'save');
		vi.spyOn(answerReader, 'findById');
	});

	function setupAnswer(isCorrect: boolean): Answer {
		const answer = {
			id: answerId,
			isCorrect,
		};
		answerReader.addAnswer(answer);
		return answer;
	}

	function createCommand(overrides: Partial<SaveResponseCommand['props']> = {}) {
		return new SaveResponseCommand({
			attemptId,
			questionId,
			answerId,
			timeTakenMs,
			...overrides,
		});
	}

	it('should create a new response with correct answer', async () => {
		// Arrange
		setupAnswer(true);
		const command = createCommand();

		// Act
		const result = await handler.execute(command);

		// Assert
		expect(answerReader.findById).toHaveBeenCalledWith(answerId);
		expect(responseRepository.save).toHaveBeenCalledTimes(1);
		expect(result).toBeDefined();
		expect(result.attemptId).toBe(attemptId);
		expect(result.questionId).toBe(questionId);
		expect(result.answerId).toBe(answerId);
		expect(result.isCorrect).toBe(true);
		expect(result.timeTakenMs).toBe(timeTakenMs);
	});

	it('should create a new response with incorrect answer', async () => {
		// Arrange
		setupAnswer(false);
		const command = createCommand();

		// Act
		const result = await handler.execute(command);

		// Assert
		expect(answerReader.findById).toHaveBeenCalledWith(answerId);
		expect(responseRepository.save).toHaveBeenCalledTimes(1);
		expect(result).toBeDefined();
		expect(result.attemptId).toBe(attemptId);
		expect(result.questionId).toBe(questionId);
		expect(result.answerId).toBe(answerId);
		expect(result.isCorrect).toBe(false);
		expect(result.timeTakenMs).toBe(timeTakenMs);
	});

	it('should throw an error if answer is not found', async () => {
		// Arrange - don't add any answers to the reader
		const command = createCommand();

		// Act & Assert
		await expect(handler.execute(command)).rejects.toThrow();
		expect(answerReader.findById).toHaveBeenCalledWith(answerId);
		expect(responseRepository.save).not.toHaveBeenCalled();
	});

	it('should validate time taken is non-negative', async () => {
		// Arrange
		setupAnswer(true);
		const command = createCommand({ timeTakenMs: -100 });

		// Act & Assert
		// The validation happens when the command is executed, not when it's created
		await expect(handler.execute(command)).rejects.toThrow();
	});
});
