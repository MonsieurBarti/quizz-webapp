import { describe, it, expect, beforeEach, vi } from 'vitest';
import { SavePlayerCommand, SavePlayerCommandHandler } from './save-player.command';
import { PlayerBuilder } from '@quizz-taker/domain/player/player.builder';
import { InMemoryPlayerRepository } from '@quizz-taker/infrastructure/persistence/player/in-memory-player.repository';
import { faker } from '@faker-js/faker';
import type { Player } from '@quizz-taker/domain/player/player';

describe('SavePlayerCommandHandler', () => {
	let playerRepository: InMemoryPlayerRepository;
	let handler: SavePlayerCommandHandler;

	beforeEach(() => {
		playerRepository = new InMemoryPlayerRepository();
		handler = new SavePlayerCommandHandler(playerRepository);

		vi.spyOn(playerRepository, 'save');
		vi.spyOn(playerRepository, 'findByEmail');
	});

	async function createExistingPlayer(email: string, name: string): Promise<Player> {
		const player = new PlayerBuilder()
			.withEmail(email)
			.withName(name)
			.build();

		await playerRepository.save(player);
		vi.clearAllMocks(); // Reset call counts after setup
		return player;
	}

	it('should create a new player if one does not exist with the email', async () => {
		// Arrange
		const email = faker.internet.email();
		const name = faker.person.fullName();
		const command = new SavePlayerCommand({ email, name });

		// Act
		const result = await handler.execute(command);

		// Assert
		expect(playerRepository.findByEmail).toHaveBeenCalledWith({ email });
		expect(playerRepository.save).toHaveBeenCalledTimes(1);
		expect(result).toBeDefined();
		expect(result.email).toBe(email);
		expect(result.name).toBe(name);
	});

	it('should return existing player if one exists with the email', async () => {
		// Arrange
		const email = faker.internet.email();
		const name = faker.person.fullName();
		const existingPlayer = await createExistingPlayer(email, name);

		const command = new SavePlayerCommand({
			email,
			name: 'Different Name', // This should be ignored since we'll use the existing player
		});

		// Act
		const result = await handler.execute(command);

		// Assert
		expect(playerRepository.findByEmail).toHaveBeenCalledWith({ email });
		expect(playerRepository.save).not.toHaveBeenCalled(); // Should not save again
		expect(result).toBeDefined();
		expect(result.id).toBe(existingPlayer.id);
		expect(result.email).toBe(email);
		expect(result.name).toBe(name); // Name should be the original, not the new one
	});

	it('should handle null name', async () => {
		// Arrange
		const email = faker.internet.email();
		const command = new SavePlayerCommand({ email, name: null });

		// Act
		const result = await handler.execute(command);

		// Assert
		expect(result).toBeDefined();
		expect(result.email).toBe(email);
		expect(result.name).toBe('Unknown'); // Default value from Player entity
	});
});
