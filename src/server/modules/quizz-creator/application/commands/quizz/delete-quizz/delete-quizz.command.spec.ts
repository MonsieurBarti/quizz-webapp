import 'reflect-metadata';
import { DeleteQuizzCommand, DeleteQuizzCommandHandler, DeleteQuizzCommandProps } from './delete-quizz.command';
import { InMemoryQuizzRepository } from '@quizz-creator/infrastructure/persistence/quizz/in-memory-quizz.repository';
import { QuizzBuilder } from '@quizz-creator/domain/quizz/quizz.builder';
import { QuizzNotFound } from '@quizz-creator/domain/errors/quizz-creator.errors';
import { Quizz } from '@quizz-creator/domain/quizz/quizz';

describe('DeleteQuizzCommandHandler', () => {
	let quizzRepository: InMemoryQuizzRepository;
	let handler: DeleteQuizzCommandHandler;
	let quizzBuilder: QuizzBuilder;
	let existingQuizz: Quizz;

	beforeEach(async () => {
		quizzRepository = new InMemoryQuizzRepository();
		handler = new DeleteQuizzCommandHandler(quizzRepository);
		quizzBuilder = new QuizzBuilder();

		existingQuizz = quizzBuilder.build();
		await quizzRepository.save(existingQuizz);
	});

	it('should delete an existing quizz successfully', async () => {
		// Arrange
		const quizzToDelete = quizzBuilder.build();
		await quizzRepository.save(quizzToDelete);
		expect(await quizzRepository.findById({ id: quizzToDelete.id! })).toBeDefined(); // Ensure it's there

		const commandProps: DeleteQuizzCommandProps = { id: quizzToDelete.id! };
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
		const commandProps: DeleteQuizzCommandProps = { id: nonExistentQuizzId };
		const command = new DeleteQuizzCommand(commandProps);

		// Act & Assert
		await expect(handler.execute(command)).rejects.toThrow(QuizzNotFound);
		await expect(handler.execute(command)).rejects.toThrow(`Quizz with id ${nonExistentQuizzId} not found`);
	});
});
