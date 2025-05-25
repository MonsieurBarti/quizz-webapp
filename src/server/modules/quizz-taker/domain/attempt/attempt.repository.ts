import type { Attempt } from '@quizz-taker/domain/attempt/attempt';

/**
 * Interface for the attempt repository.
 */
export interface AttemptRepository {
	/**
	 * Finds an attempt by player ID and quizz ID.
	 * @param {object} params - The parameters for finding an attempt.
	 * @param {string} params.playerId - The ID of the player.
	 * @param {string} params.quizzId - The ID of the quizz.
	 * @returns {Promise<Attempt | null>} A promise that resolves with the attempt if found, or null otherwise.
	 */
	findByPlayerIdAndQuizzId({ playerId, quizzId }: { playerId: string; quizzId: string }): Promise<Attempt | null>;

	/**
	 * Saves an attempt.
	 * If the attempt already exists (based on a composite key like playerId and quizzId, or its own ID if applicable),
	 * it should be updated. Otherwise, it should be created.
	 * @param {Attempt} attempt - The attempt to save.
	 * @returns {Promise<void>} A promise that resolves when the save operation is complete.
	 */
	save(attempt: Attempt): Promise<void>;
}
