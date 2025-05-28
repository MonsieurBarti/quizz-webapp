import { describe, it, expect, beforeEach, vi } from 'vitest';
import { SaveAttemptCommand, SaveAttemptCommandHandler } from './save-attempt.command';
import { AttemptBuilder } from '@quizz-taker/domain/attempt/attempt.builder';
import { InMemoryAttemptRepository } from '@quizz-taker/infrastructure/persistence/attempt/in-memory-attempt.repository';
import { faker } from '@faker-js/faker';
import type { Attempt } from '@quizz-taker/domain/attempt/attempt';

describe('SaveAttemptCommandHandler', () => {
	let attemptRepository: InMemoryAttemptRepository;
	let handler: SaveAttemptCommandHandler;
	let quizzId: string;
	let playerId: string;

	beforeEach(() => {
		attemptRepository = new InMemoryAttemptRepository();
		handler = new SaveAttemptCommandHandler(attemptRepository);
		quizzId = faker.string.uuid();
		playerId = faker.string.uuid();

		vi.spyOn(attemptRepository, 'save');
		vi.spyOn(attemptRepository, 'findByPlayerIdAndQuizzId');
	});

	async function createExistingAttempt(score = 2, totalQuestionsAnswered = 3): Promise<Attempt> {
		const existingAttempt = new AttemptBuilder()
			.withQuizzId(quizzId)
			.withPlayerId(playerId)
			.withScore(score)
			.withTotalQuestionsAnswered(totalQuestionsAnswered)
			.withCompletedAt(null)
			.build();

		await attemptRepository.save(existingAttempt);
		vi.clearAllMocks(); // Reset call counts after setup
		return existingAttempt;
	}

	it('should create a new attempt if one does not exist', async () => {
		// Arrange
		const command = new SaveAttemptCommand({
			quizzId,
			playerId,
			isCorrect: true,
		});

		// Act
		const result = await handler.execute(command);

		// Assert
		expect(attemptRepository.findByPlayerIdAndQuizzId).toHaveBeenCalledWith({ playerId, quizzId });
		expect(attemptRepository.save).toHaveBeenCalledTimes(1);
		expect(result).toBeDefined();
		expect(result.quizzId).toBe(quizzId);
		expect(result.playerId).toBe(playerId);
		expect(result.score).toBe(0); // No score increment for new attempt
		expect(result.totalQuestionsAnswered).toBe(0); // No questions answered yet
		expect(result.completedAt).toBeNull(); // Not completed yet
	});

	it('should update an existing attempt if one exists', async () => {
		// Arrange
		const existingAttempt = await createExistingAttempt();
		const command = new SaveAttemptCommand({
			quizzId,
			playerId,
			isCorrect: true,
		});

		// Act
		const result = await handler.execute(command);

		// Assert
		expect(attemptRepository.findByPlayerIdAndQuizzId).toHaveBeenCalledWith({ playerId, quizzId });
		expect(attemptRepository.save).toHaveBeenCalledTimes(1);
		expect(result).toBeDefined();
		expect(result.id).toBe(existingAttempt.id);
		expect(result.quizzId).toBe(quizzId);
		expect(result.playerId).toBe(playerId);
		expect(result.score).toBe(3); // Incremented from 2 to 3
		expect(result.totalQuestionsAnswered).toBe(4); // Incremented from 3 to 4
		expect(result.completedAt).toBeNull(); // Not completed yet since completedAt wasn't provided
	});

	it('should not increment score when answer is incorrect', async () => {
		// Arrange
		const existingAttempt = await createExistingAttempt();
		const command = new SaveAttemptCommand({
			quizzId,
			playerId,
			isCorrect: false,
		});

		// Act
		const result = await handler.execute(command);

		// Assert
		expect(result.score).toBe(2); // Score remains unchanged
		expect(result.totalQuestionsAnswered).toBe(4); // Incremented from 3 to 4
		expect(result.completedAt).toBeNull(); // Not completed yet since completedAt wasn't provided
	});

	it('should complete the attempt when completedAt is provided', async () => {
		// Arrange
		const existingAttempt = await createExistingAttempt();
		const completedAt = new Date();
		const command = new SaveAttemptCommand({
			quizzId,
			playerId,
			isCorrect: true,
			completedAt,
		});

		// Act
		const result = await handler.execute(command);

		// Assert
		expect(result.completedAt).toBeInstanceOf(Date);
		expect(result.score).toBe(3); // Incremented from 2 to 3
		// Note: totalQuestionsAnswered is not incremented when completing the attempt
		expect(result.totalQuestionsAnswered).toBe(3); // Remains unchanged
	});
});
