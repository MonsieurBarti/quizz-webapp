import type { Quizz } from '@quizz-creator/domain/quizz/quizz';

/**
 * Interface for the quizz repository.
 * Defines methods for interacting with quizz data storage.
 */
export interface QuizzRepository {
	/**
	 * Finds a quizz by its ID.
	 * @param {object} params - The parameters for finding a quizz.
	 * @param {string} params.id - The ID of the quizz to find.
	 * @returns {Promise<Quizz | null>} A promise that resolves with the quizz if found, or null otherwise.
	 */
	findById({ id }: { id: string }): Promise<Quizz | null>;

	/**
	 * Finds all quizzes created by a specific user.
	 * @param {object} params - The parameters for finding quizzes.
	 * @param {string} params.creatorId - The ID of the user who created the quizzes.
	 * @returns {Promise<Quizz[]>} A promise that resolves with an array of quizzes.
	 */
	findByCreatorId({ creatorId }: { creatorId: string }): Promise<Quizz[]>;

	/**
	 * Saves a quizz.
	 * If the quizz exists, it should be updated. Otherwise, it should be created.
	 * @param {Quizz} quizz - The quizz to save.
	 * @returns {Promise<void>} A promise that resolves when the save operation is complete.
	 */
	save(quizz: Quizz): Promise<void>;

	/**
	 * Deletes a quizz by its ID.
	 * @param {object} params - The parameters for deleting a quizz.
	 * @param {string} params.id - The ID of the quizz to delete.
	 * @returns {Promise<void>} A promise that resolves when the delete operation is complete.
	 */
	deleteById({ id }: { id: string }): Promise<void>;
}

export const QUIZZ_REPOSITORY = Symbol('QuizzRepository');
