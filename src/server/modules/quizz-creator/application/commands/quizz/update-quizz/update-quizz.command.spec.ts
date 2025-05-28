import 'reflect-metadata';
import { describe, it, expect, beforeEach } from 'vitest';
import { UpdateQuizzCommand, UpdateQuizzCommandHandler, UpdateQuizzCommandProps } from './update-quizz.command';
import { describe, it, expect, beforeEach } from 'vitest';
import { InMemoryQuizzRepository } from '@quizz-creator/infrastructure/persistence/quizz/in-memory-quizz.repository';
import { QuizzBuilder } from '@quizz-creator/domain/quizz/quizz.builder';
import { QuizzNotFound, UnauthorizedQuizzAccess } from '@quizz-creator/domain/errors/quizz-creator.errors';
import { Quizz } from '@quizz-creator/domain/quizz/quizz';

describe('UpdateQuizzCommandHandler', () => {
	let quizzRepository: InMemoryQuizzRepository;
	let handler: UpdateQuizzCommandHandler;
	let quizzBuilder: QuizzBuilder;
	let existingQuizz: Quizz;
	const userId = '11111111-1111-1111-1111-111111111111';
	const differentUserId = '22222222-2222-2222-2222-222222222222';

	beforeEach(async () => {
		quizzRepository = new InMemoryQuizzRepository();
		handler = new UpdateQuizzCommandHandler(quizzRepository);
		quizzBuilder = new QuizzBuilder();

		existingQuizz = quizzBuilder.withCreatedBy(userId).build();
		await quizzRepository.save(existingQuizz);
	});

	it('should update an existing quizz successfully', async () => {
		// Arrange
		const initialQuizz = quizzBuilder
			.withTitle('Old title')
			.withDescription('Old description')
			.withIsPublished(false)
			.withCreatedBy(userId)
			.build();
		await quizzRepository.save(initialQuizz);

		const updateProps: UpdateQuizzCommandProps = {
			id: initialQuizz.id!,
			title: 'New updated title',
			description: 'New updated description',
			isPublished: true,
			context: { userId }
		};
		const command = new UpdateQuizzCommand(updateProps);

		// Act
		const result = await handler.execute(command);

		// Assert
		expect(result).toBeInstanceOf(Quizz);
		expect(result.id).toBe(initialQuizz.id);
		expect(result.title).toBe(updateProps.title);
		expect(result.description).toBe(updateProps.description);
		expect(result.isPublished).toBe(updateProps.isPublished);

		const savedQuizz = await quizzRepository.findById({ id: initialQuizz.id! });
		expect(savedQuizz?.title).toBe(updateProps.title);
		expect(savedQuizz?.description).toBe(updateProps.description);
		expect(savedQuizz?.isPublished).toBe(updateProps.isPublished);
	});

	it('should throw QuizzNotFound if the quizz to update does not exist', async () => {
		// Arrange
		const nonExistentQuizzId = '00000000-0000-0000-0000-000000000000';
		const commandProps: UpdateQuizzCommandProps = {
			id: nonExistentQuizzId,
			title: 'Title for a ghost quizz',
			description: 'Description for a ghost quizz',
			isPublished: true,
			context: { userId }
		};
		const command = new UpdateQuizzCommand(commandProps);

		// Act & Assert
		await expect(handler.execute(command)).rejects.toThrow(QuizzNotFound);
		await expect(handler.execute(command)).rejects.toThrow(`Quizz with id ${nonExistentQuizzId} not found`);
	});

	it('should partially update an quizz if only some fields are provided', async () => {
		// Arrange
		const initialQuizz = quizzBuilder
			.withTitle('Initial Title')
			.withDescription('Initial Description')
			.withIsPublished(false)
			.withCreatedBy(userId)
			.build();
		await quizzRepository.save(initialQuizz);

		const partialUpdateProps: UpdateQuizzCommandProps = {
			id: initialQuizz.id!,
			title: 'Partially Updated Title',
			// isCorrect and order are not provided
			context: { userId }
		};
		const command = new UpdateQuizzCommand(partialUpdateProps);

		// Act
		const result = await handler.execute(command);

		// Assert
		expect(result.title).toBe(partialUpdateProps.title);
		expect(result.description).toBe(initialQuizz.description); // Should remain unchanged
		expect(result.isPublished).toBe(initialQuizz.isPublished); // Should remain unchanged

		const savedQuizz = await quizzRepository.findById({ id: initialQuizz.id! });
		expect(savedQuizz?.title).toBe(partialUpdateProps.title);
		expect(savedQuizz?.description).toBe(initialQuizz.description);
		expect(savedQuizz?.isPublished).toBe(initialQuizz.isPublished);
		});

	it('should throw UnauthorizedQuizzAccess if the user is not the owner of the quizz', async () => {
		// Arrange
		const initialQuizz = quizzBuilder
			.withTitle('Initial Title')
			.withDescription('Initial Description')
			.withCreatedBy(userId) // Owned by userId
			.build();
		await quizzRepository.save(initialQuizz);

		const updateProps: UpdateQuizzCommandProps = {
			id: initialQuizz.id!,
			title: 'Unauthorized Update',
			context: { userId: differentUserId } // Different user trying to update
		};
		const command = new UpdateQuizzCommand(updateProps);

		// Act & Assert
		await expect(handler.execute(command)).rejects.toThrow(UnauthorizedQuizzAccess);
		await expect(handler.execute(command)).rejects.toThrow(`User ${differentUserId} is not authorized to access quizz ${initialQuizz.id}`);
	});
});
