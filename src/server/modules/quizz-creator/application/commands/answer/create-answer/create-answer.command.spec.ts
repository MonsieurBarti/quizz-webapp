import 'reflect-metadata';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { CreateAnswerCommand, CreateAnswerCommandHandler, CreateAnswerCommandProps } from './create-answer.command';
import { InMemoryAnswerRepository } from '@quizz-creator/infrastructure/persistence/answer/in-memory-answer.repository';
import { InMemoryQuestionRepository } from '@quizz-creator/infrastructure/persistence/question/in-memory-question.repository';
import { InMemoryQuizzRepository } from '@quizz-creator/infrastructure/persistence/quizz/in-memory-quizz.repository';
import { AnswerBuilder } from '@quizz-creator/domain/answer/answer.builder';
import { QuestionBuilder } from '@quizz-creator/domain/question/question.builder';
import { QuizzBuilder } from '@quizz-creator/domain/quizz/quizz.builder';
import { QuestionNotFound, UnauthorizedQuizzAccess } from '@quizz-creator/domain/errors/quizz-creator.errors';
import { Answer } from '@quizz-creator/domain/answer/answer';
import type { Question } from '@quizz-creator/domain/question/question';
import type { Quizz } from '@quizz-creator/domain/quizz/quizz';

describe('CreateAnswerCommandHandler', () => {
	let answerRepository: InMemoryAnswerRepository;
	let questionRepository: InMemoryQuestionRepository;
	let quizzRepository: InMemoryQuizzRepository;
	let handler: CreateAnswerCommandHandler;
	const userId = '11111111-1111-1111-1111-111111111111';
	const differentUserId = '22222222-2222-2222-2222-222222222222';

	beforeEach(() => {
		answerRepository = new InMemoryAnswerRepository();
		questionRepository = new InMemoryQuestionRepository();
		quizzRepository = new InMemoryQuizzRepository();
		handler = new CreateAnswerCommandHandler(answerRepository, questionRepository, quizzRepository);

		vi.spyOn(answerRepository, 'save');
		vi.spyOn(answerRepository, 'findById');
		vi.spyOn(questionRepository, 'findById');
		vi.spyOn(quizzRepository, 'findById');
	});

	async function createTestQuizzAndQuestion(): Promise<{ quizz: Quizz; question: Question }> {
		const quizz = new QuizzBuilder().withCreatedBy(userId).build();
		await quizzRepository.save(quizz);

		const question = new QuestionBuilder()
			.withQuizzId(quizz.id)
			.build();
		await questionRepository.save(question);

		vi.clearAllMocks(); // Reset call counts after setup
		return { quizz, question };
	}

	function createAnswerCommand(
		questionId: string,
		overrides: Partial<Omit<CreateAnswerCommandProps, 'questionId' | 'context'>> = {},
		contextUserId: string = userId
	): CreateAnswerCommand {
		const defaultProps: CreateAnswerCommandProps = {
			questionId,
			text: 'Default answer text',
			isCorrect: false,
			order: 0,
			nextQuestionId: null,
			context: { userId: contextUserId },
			...overrides,
		};

		return new CreateAnswerCommand(defaultProps);
	}

	it('should create and save an answer successfully when question exists', async () => {
		// Arrange
		const { question } = await createTestQuizzAndQuestion();

		const command = createAnswerCommand(question.id!, {
			text: 'What is 2+2?',
			isCorrect: true,
			order: 0,
		});

		// Act
		const result = await handler.execute(command);

		// Assert
		expect(questionRepository.findById).toHaveBeenCalledWith({ id: question.id });
		expect(answerRepository.save).toHaveBeenCalledTimes(1);
		expect(result).toBeInstanceOf(Answer);
		expect(result.id).toBeDefined();
		expect(result.questionId).toBe(question.id);
		expect(result.text).toBe('What is 2+2?');
		expect(result.isCorrect).toBe(true);
		expect(result.order).toBe(0);

		const savedAnswer = await answerRepository.findById({ id: result.id! });
		expect(savedAnswer).toEqual(result);
	});

	it('should throw QuestionNotFound error if the questionId does not exist', async () => {
		// Arrange
		const nonExistentQuestionId = '00000000-0000-0000-0000-000000000000';
		const command = createAnswerCommand(nonExistentQuestionId);

		// Act & Assert
		await expect(handler.execute(command)).rejects.toThrow(QuestionNotFound);
		await expect(handler.execute(command)).rejects.toThrow(
			`Question with ID "${nonExistentQuestionId}" not found.`
		);
		expect(answerRepository.save).not.toHaveBeenCalled();
	});

	it('should allow creating an answer with a specific ID if provided', async () => {
		// Arrange
		const { question } = await createTestQuizzAndQuestion();
		const specificAnswerId = '11111111-1111-1111-1111-111111111111';

		const command = createAnswerCommand(question.id!, {
			id: specificAnswerId,
			text: 'Answer with specific ID',
		});

		// Act
		const result = await handler.execute(command);

		// Assert
		expect(answerRepository.save).toHaveBeenCalledTimes(1);
		expect(result.id).toBe(specificAnswerId);
		
		const savedAnswer = await answerRepository.findById({ id: specificAnswerId });
		expect(savedAnswer).toBeDefined();
		expect(savedAnswer?.id).toBe(specificAnswerId);
	});

	it('should throw UnauthorizedQuizzAccess if user is not the owner of the parent quizz', async () => {
		// Arrange
		const { question } = await createTestQuizzAndQuestion();

		const command = createAnswerCommand(
			question.id!,
			{
				text: 'Unauthorized answer',
				isCorrect: true,
				order: 1,
			},
			differentUserId // Different user trying to create an answer
		);

		// Act & Assert
		await expect(handler.execute(command)).rejects.toThrow(UnauthorizedQuizzAccess);
		expect(answerRepository.save).not.toHaveBeenCalled();
	});
});
