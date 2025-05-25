import type { Player } from './player';

/**
 * Interface for the player repository.
 */
export interface PlayerRepository {
	/**
	 * Finds a player by their email address.
	 * @param {object} params - The parameters for finding a player.
	 * @param {string} params.email - The email address of the player to find.
	 * @returns {Promise<Player | null>} The player if found, otherwise null.
	 */
	findByEmail({ email }: { email: string }): Promise<Player | null>;

	/**
	 * Saves a player.
	 * If the player already exists, it should be updated.
	 * If the player does not exist, it should be created.
	 * @param {Player} player - The player to save.
	 * @returns {Promise<void>} A promise that resolves when the save operation is complete.
	 */
	save(player: Player): Promise<void>;
}
