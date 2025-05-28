import 'reflect-metadata';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { UpdateQuizzCommand, UpdateQuizzCommandHandler, UpdateQuizzCommandProps } from './update-quizz.command';
import { InMemoryQuizzRepository } from '@quizz-creator/infrastructure/persistence/quizz/in-memory-quizz.repository';
import { QuizzBuilder } from '@quizz-creator/domain/quizz/quizz.builder';
import { QuizzNotFound, UnauthorizedQuizzAccess } from '@quizz-creator/domain/errors/quizz-creator.errors';
import type { Quizz } from '@quizz-creator/domain/quizz/quizz';

describe('UpdateQuizzCommandHandler', () => {
	let quizzRepository: InMemoryQuizzRepository;
	let handler: UpdateQuizzCommandHandler;
	const userId = '11111111-1111-1111-1111-111111111111';
	const differentUserId = '22222222-2222-2222-2222-222222222222';

	beforeEach(() => {
		quizzRepository = new InMemoryQuizzRepository();
		handler = new UpdateQuizzCommandHandler(quizzRepository);

		vi.spyOn(quizzRepository, 'findById');
		vi.spyOn(quizzRepository, 'save');
	});

	async function createQuizz({
		creatorId = userId,
		title = 'Test Quizz',
		description = 'Test Description',
		isPublished = false
	}: {
		creatorId?: string;
		title?: string;
		description?: string;
		isPublished?: boolean;
	} = {}): Promise<Quizz> {
		const quizz = new QuizzBuilder()
			.withCreatedBy(creatorId)
			.withTitle(title)
			.withDescription(description)
			.withIsPublished(isPublished)
			.build();
		await quizzRepository.save(quizz);
		vi.clearAllMocks(); // Reset call counts after setup
		return quizz;
	}

	function createUpdateCommand(
		quizzId: string,
		updates: Partial<Omit<UpdateQuizzCommandProps, 'id' | 'context'>> = {},
		contextUserId: string = userId
	): UpdateQuizzCommand {
		const props: UpdateQuizzCommandProps = {
			id: quizzId,
			context: { userId: contextUserId },
			...updates
		};
		return new UpdateQuizzCommand(props);
	}

	async function assertQuizzUpdated(quizz: Quizz, expectedValues: Partial<Quizz>) {
		const savedQuizz = await quizzRepository.findById({ id: quizz.id! });
		expect(savedQuizz).toBeDefined();
		
		Object.entries(expectedValues).forEach(([key, value]) => {
			expect(savedQuizz?.[key as keyof Quizz]).toBe(value);
		});
	}

	it('should update an existing quizz successfully', async () => {
		// Arrange
		const initialQuizz = await createQuizz({
			title: 'Old title',
			description: 'Old description',
			isPublished: false
		});

		const updates = {
			title: 'New updated title',
			description: 'New updated description',
			isPublished: true
		};
		const command = createUpdateCommand(initialQuizz.id!, updates);

		// Act
		const result = await handler.execute(command);

		// Assert
		expect(quizzRepository.findById).toHaveBeenCalledWith({ id: initialQuizz.id });
		expect(quizzRepository.save).toHaveBeenCalledTimes(1);
		
		expect(result.id).toBe(initialQuizz.id);
		expect(result.title).toBe(updates.title);
		expect(result.description).toBe(updates.description);
		expect(result.isPublished).toBe(updates.isPublished);

		await assertQuizzUpdated(initialQuizz, updates);
	});

	it('should throw QuizzNotFound if the quizz to update does not exist', async () => {
		// Arrange
		const nonExistentQuizzId = '00000000-0000-0000-0000-000000000000';
		const command = createUpdateCommand(nonExistentQuizzId, {
			title: 'Title for a ghost quizz',
			description: 'Description for a ghost quizz',
			isPublished: true
		});

		// Act & Assert
		await expect(handler.execute(command)).rejects.toThrow(QuizzNotFound);
		await expect(handler.execute(command)).rejects.toThrow(`Quizz with id ${nonExistentQuizzId} not found`);
		expect(quizzRepository.save).not.toHaveBeenCalled();
	});

	it('should partially update a quizz if only some fields are provided', async () => {
		// Arrange
		const initialQuizz = await createQuizz({
			title: 'Initial Title',
			description: 'Initial Description',
			isPublished: false
		});

		const updates = {
			title: 'Partially Updated Title'
			// description and isPublished are not provided
		};
		const command = createUpdateCommand(initialQuizz.id!, updates);

		// Act
		const result = await handler.execute(command);

		// Assert
		expect(quizzRepository.findById).toHaveBeenCalledWith({ id: initialQuizz.id });
		expect(quizzRepository.save).toHaveBeenCalledTimes(1);
		
		expect(result.title).toBe(updates.title);
		expect(result.description).toBe(initialQuizz.description); // Should remain unchanged
		expect(result.isPublished).toBe(initialQuizz.isPublished); // Should remain unchanged

		await assertQuizzUpdated(initialQuizz, {
			title: updates.title,
			description: initialQuizz.description,
			isPublished: initialQuizz.isPublished
		});
	});

	it('should throw UnauthorizedQuizzAccess if the user is not the owner of the quizz', async () => {
		// Arrange
		const initialQuizz = await createQuizz({
			title: 'Initial Title',
			description: 'Initial Description'
		});

		const command = createUpdateCommand(
			initialQuizz.id!,
			{ title: 'Unauthorized Update' },
			differentUserId // Different user trying to update
		);

		// Act & Assert
		await expect(handler.execute(command)).rejects.toThrow(UnauthorizedQuizzAccess);
		await expect(handler.execute(command)).rejects.toThrow(
			`User ${differentUserId} is not authorized to access quizz ${initialQuizz.id}`
		);
		expect(quizzRepository.save).not.toHaveBeenCalled();
	});
});
