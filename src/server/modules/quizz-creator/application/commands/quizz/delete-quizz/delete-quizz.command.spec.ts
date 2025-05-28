import 'reflect-metadata';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { DeleteQuizzCommand, DeleteQuizzCommandHandler, DeleteQuizzCommandProps } from './delete-quizz.command';
import { InMemoryQuizzRepository } from '@quizz-creator/infrastructure/persistence/quizz/in-memory-quizz.repository';
import { QuizzBuilder } from '@quizz-creator/domain/quizz/quizz.builder';
import { QuizzNotFound, UnauthorizedQuizzAccess } from '@quizz-creator/domain/errors/quizz-creator.errors';
import type { Quizz } from '@quizz-creator/domain/quizz/quizz';

describe('DeleteQuizzCommandHandler', () => {
	let quizzRepository: InMemoryQuizzRepository;
	let handler: DeleteQuizzCommandHandler;
	const userId = '11111111-1111-1111-1111-111111111111';
	const differentUserId = '22222222-2222-2222-2222-222222222222';

	beforeEach(() => {
		quizzRepository = new InMemoryQuizzRepository();
		handler = new DeleteQuizzCommandHandler(quizzRepository);

		vi.spyOn(quizzRepository, 'findById');
		vi.spyOn(quizzRepository, 'deleteById');
		vi.spyOn(quizzRepository, 'save');
	});

	async function createQuizz(creatorId: string = userId, title: string = 'Test Quizz'): Promise<Quizz> {
		const quizz = new QuizzBuilder().withCreatedBy(creatorId).withTitle(title).build();
		await quizzRepository.save(quizz);
		vi.clearAllMocks(); // Reset call counts after setup
		return quizz;
	}

	function createDeleteCommand(quizzId: string, contextUserId: string = userId): DeleteQuizzCommand {
		const props: DeleteQuizzCommandProps = {
			id: quizzId,
			context: { userId: contextUserId },
		};
		return new DeleteQuizzCommand(props);
	}

	it('should delete an existing quizz successfully', async () => {
		// Arrange
		const quizzToDelete = await createQuizz(userId, 'Quizz to delete');
		expect(await quizzRepository.findById({ id: quizzToDelete.id! })).toBeDefined(); // Ensure it's there

		const command = createDeleteCommand(quizzToDelete.id!);

		// Act
		await handler.execute(command);

		// Assert
		expect(quizzRepository.findById).toHaveBeenCalledWith({ id: quizzToDelete.id! });
		expect(quizzRepository.deleteById).toHaveBeenCalledWith({ id: quizzToDelete.id! });

		const deletedQuizz = await quizzRepository.findById({ id: quizzToDelete.id! });
		expect(deletedQuizz).toBeNull();
	});

	it('should throw QuizzNotFound if the quizz to delete does not exist', async () => {
		// Arrange
		const nonExistentQuizzId = '00000000-0000-0000-0000-000000000000';
		const command = createDeleteCommand(nonExistentQuizzId);

		// Act & Assert
		await expect(handler.execute(command)).rejects.toThrow(QuizzNotFound);
		await expect(handler.execute(command)).rejects.toThrow(`Quizz with id ${nonExistentQuizzId} not found`);
		expect(quizzRepository.deleteById).not.toHaveBeenCalled();
	});

	it('should throw UnauthorizedQuizzAccess if the user is not the owner of the quizz', async () => {
		// Arrange
		const quizzToDelete = await createQuizz(userId, 'Quizz to be deleted');
		const command = createDeleteCommand(quizzToDelete.id!, differentUserId);

		// Act & Assert
		await expect(handler.execute(command)).rejects.toThrow(UnauthorizedQuizzAccess);
		await expect(handler.execute(command)).rejects.toThrow(
			`User ${differentUserId} is not authorized to access quizz ${quizzToDelete.id}`,
		);
		expect(quizzRepository.deleteById).not.toHaveBeenCalled();
	});
});
