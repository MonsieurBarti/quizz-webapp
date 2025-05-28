import 'reflect-metadata';
import { describe, it, expect, beforeEach } from 'vitest';
import { DeleteQuizzCommand, DeleteQuizzCommandHandler, DeleteQuizzCommandProps } from './delete-quizz.command';
import { describe, it, expect, beforeEach } from 'vitest';
import { InMemoryQuizzRepository } from '@quizz-creator/infrastructure/persistence/quizz/in-memory-quizz.repository';
import { QuizzBuilder } from '@quizz-creator/domain/quizz/quizz.builder';
import { QuizzNotFound, UnauthorizedQuizzAccess } from '@quizz-creator/domain/errors/quizz-creator.errors';
import { Quizz } from '@quizz-creator/domain/quizz/quizz';

describe('DeleteQuizzCommandHandler', () => {
	let quizzRepository: InMemoryQuizzRepository;
	let handler: DeleteQuizzCommandHandler;
	let quizzBuilder: QuizzBuilder;
	let existingQuizz: Quizz;
	const userId = '11111111-1111-1111-1111-111111111111';
	const differentUserId = '22222222-2222-2222-2222-222222222222';

	beforeEach(async () => {
		quizzRepository = new InMemoryQuizzRepository();
		handler = new DeleteQuizzCommandHandler(quizzRepository);
		quizzBuilder = new QuizzBuilder();

		existingQuizz = quizzBuilder.withCreatedBy(userId).build();
		await quizzRepository.save(existingQuizz);
	});

	it('should delete an existing quizz successfully', async () => {
		// Arrange
		const quizzToDelete = quizzBuilder.withCreatedBy(userId).build();
		await quizzRepository.save(quizzToDelete);
		expect(await quizzRepository.findById({ id: quizzToDelete.id! })).toBeDefined(); // Ensure it's there

		const commandProps: DeleteQuizzCommandProps = { 
			id: quizzToDelete.id!,
			context: { userId }
		};
		const command = new DeleteQuizzCommand(commandProps);

		// Act
		await handler.execute(command);

		// Assert
		const deletedQuizz = await quizzRepository.findById({ id: quizzToDelete.id! });
		expect(deletedQuizz).toBeNull();
	});

	it('should throw QuizzNotFound if the quizz to delete does not exist', async () => {
		// Arrange
		const nonExistentQuizzId = '00000000-0000-0000-0000-000000000000';
		const commandProps: DeleteQuizzCommandProps = { 
			id: nonExistentQuizzId,
			context: { userId } 
		};
		const command = new DeleteQuizzCommand(commandProps);

		// Act & Assert
		await expect(handler.execute(command)).rejects.toThrow(QuizzNotFound);
		await expect(handler.execute(command)).rejects.toThrow(`Quizz with id ${nonExistentQuizzId} not found`);
		});

	it('should throw UnauthorizedQuizzAccess if the user is not the owner of the quizz', async () => {
		// Arrange
		const quizzToDelete = quizzBuilder
			.withTitle('Quizz to be deleted')
			.withCreatedBy(userId) // Owned by userId
			.build();
		await quizzRepository.save(quizzToDelete);

		const commandProps: DeleteQuizzCommandProps = {
			id: quizzToDelete.id!,
			context: { userId: differentUserId } // Different user trying to delete
		};
		const command = new DeleteQuizzCommand(commandProps);

		// Act & Assert
		await expect(handler.execute(command)).rejects.toThrow(UnauthorizedQuizzAccess);
		await expect(handler.execute(command)).rejects.toThrow(`User ${differentUserId} is not authorized to access quizz ${quizzToDelete.id}`);
	});
});
