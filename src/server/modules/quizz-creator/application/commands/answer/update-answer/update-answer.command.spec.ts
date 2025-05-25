import 'reflect-metadata';
import { UpdateAnswerCommand, UpdateAnswerCommandHandler, UpdateAnswerCommandProps } from './update-answer.command';
import { InMemoryAnswerRepository } from '@quizz-creator/infrastructure/persistence/answer/in-memory-answer.repository';
import { InMemoryQuestionRepository } from '@quizz-creator/infrastructure/persistence/question/in-memory-question.repository';
import { AnswerBuilder } from '@quizz-creator/domain/answer/answer.builder';
import { QuestionBuilder } from '@quizz-creator/domain/question/question.builder';
import { AnswerNotFound } from '@quizz-creator/domain/errors/quizz-creator.errors';
import { Answer } from '@quizz-creator/domain/answer/answer';
import { Question } from '@quizz-creator/domain/question/question';

describe('UpdateAnswerCommandHandler', () => {
	let answerRepository: InMemoryAnswerRepository;
	let questionRepository: InMemoryQuestionRepository; // To set up initial question context
	let handler: UpdateAnswerCommandHandler;
	let questionBuilder: QuestionBuilder;
	let answerBuilder: AnswerBuilder;
	let existingQuestion: Question;

	beforeEach(async () => {
		answerRepository = new InMemoryAnswerRepository();
		questionRepository = new InMemoryQuestionRepository();
		handler = new UpdateAnswerCommandHandler(answerRepository);
		questionBuilder = new QuestionBuilder();
		answerBuilder = new AnswerBuilder();

		// Create a common question for tests
		existingQuestion = questionBuilder.build();
		await questionRepository.save(existingQuestion);
	});

	it('should update an existing answer successfully', async () => {
		// Arrange
		const initialAnswer = answerBuilder
			.withQuestionId(existingQuestion.id!)
			.withText('Old text')
			.withIsCorrect(false)
			.withOrder(1)
			.withNextQuestionId(null)
			.build();
		await answerRepository.save(initialAnswer);

		const updateProps: UpdateAnswerCommandProps = {
			id: initialAnswer.id!,
			text: 'New updated text',
			isCorrect: true,
			order: 2,
			nextQuestionId: questionBuilder.build().id, // Mock a new next question ID
		};
		const command = new UpdateAnswerCommand(updateProps);

		// Act
		const result = await handler.execute(command);

		// Assert
		expect(result).toBeInstanceOf(Answer);
		expect(result.id).toBe(initialAnswer.id);
		expect(result.text).toBe(updateProps.text);
		expect(result.isCorrect).toBe(updateProps.isCorrect);
		expect(result.order).toBe(updateProps.order);
		expect(result.nextQuestionId).toBe(updateProps.nextQuestionId);

		const savedAnswer = await answerRepository.findById({ id: initialAnswer.id! });
		expect(savedAnswer?.text).toBe(updateProps.text);
		expect(savedAnswer?.isCorrect).toBe(updateProps.isCorrect);
	});

	it('should throw AnswerNotFound if the answer to update does not exist', async () => {
		// Arrange
		const nonExistentAnswerId = '00000000-0000-0000-0000-000000000000';
		const commandProps: UpdateAnswerCommandProps = {
			id: nonExistentAnswerId,
			text: 'Text for a ghost answer',
		};
		const command = new UpdateAnswerCommand(commandProps);

		// Act & Assert
		await expect(handler.execute(command)).rejects.toThrow(AnswerNotFound);
		await expect(handler.execute(command)).rejects.toThrow(`Answer with ID "${nonExistentAnswerId}" not found.`);
	});

	it('should partially update an answer if only some fields are provided', async () => {
		// Arrange
		const initialAnswer = answerBuilder
			.withQuestionId(existingQuestion.id!)
			.withText('Initial Text')
			.withIsCorrect(false)
			.withOrder(0)
			.build();
		await answerRepository.save(initialAnswer);

		const partialUpdateProps: UpdateAnswerCommandProps = {
			id: initialAnswer.id!,
			text: 'Partially Updated Text',
			// isCorrect and order are not provided
		};
		const command = new UpdateAnswerCommand(partialUpdateProps);

		// Act
		const result = await handler.execute(command);

		// Assert
		expect(result.text).toBe(partialUpdateProps.text);
		expect(result.isCorrect).toBe(initialAnswer.isCorrect); // Should remain unchanged
		expect(result.order).toBe(initialAnswer.order); // Should remain unchanged

		const savedAnswer = await answerRepository.findById({ id: initialAnswer.id! });
		expect(savedAnswer?.text).toBe(partialUpdateProps.text);
		expect(savedAnswer?.isCorrect).toBe(initialAnswer.isCorrect);
	});

	it('should correctly update nextQuestionId to null', async () => {
		// Arrange
		const nextQ = questionBuilder.build();
		await questionRepository.save(nextQ);

		const initialAnswer = answerBuilder.withQuestionId(existingQuestion.id!).withNextQuestionId(nextQ.id).build();
		await answerRepository.save(initialAnswer);

		const updateProps: UpdateAnswerCommandProps = {
			id: initialAnswer.id!,
			nextQuestionId: null,
		};
		const command = new UpdateAnswerCommand(updateProps);

		// Act
		const result = await handler.execute(command);

		// Assert
		expect(result.nextQuestionId).toBeNull();
		const savedAnswer = await answerRepository.findById({ id: initialAnswer.id! });
		expect(savedAnswer?.nextQuestionId).toBeNull();
	});
});
