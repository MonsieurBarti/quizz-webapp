import 'reflect-metadata';
import { DeleteAnswerCommand, DeleteAnswerCommandHandler, DeleteAnswerCommandProps } from './delete-answer.command';
import { InMemoryAnswerRepository } from '@quizz-creator/infrastructure/persistence/answer/in-memory-answer.repository';
import { InMemoryQuestionRepository } from '@quizz-creator/infrastructure/persistence/question/in-memory-question.repository';
import { AnswerBuilder } from '@quizz-creator/domain/answer/answer.builder';
import { QuestionBuilder } from '@quizz-creator/domain/question/question.builder';
import { AnswerNotFound } from '@quizz-creator/domain/errors/quizz-creator.errors';
import { Question } from '@quizz-creator/domain/question/question';

describe('DeleteAnswerCommandHandler', () => {
	let answerRepository: InMemoryAnswerRepository;
	let questionRepository: InMemoryQuestionRepository; // To set up initial question context
	let handler: DeleteAnswerCommandHandler;
	let questionBuilder: QuestionBuilder;
	let answerBuilder: AnswerBuilder;
	let existingQuestion: Question;

	beforeEach(async () => {
		answerRepository = new InMemoryAnswerRepository();
		questionRepository = new InMemoryQuestionRepository();
		handler = new DeleteAnswerCommandHandler(answerRepository);
		questionBuilder = new QuestionBuilder();
		answerBuilder = new AnswerBuilder();

		existingQuestion = questionBuilder.build();
		await questionRepository.save(existingQuestion);
	});

	it('should delete an existing answer successfully', async () => {
		// Arrange
		const answerToDelete = answerBuilder.withQuestionId(existingQuestion.id!).build();
		await answerRepository.save(answerToDelete);
		expect(await answerRepository.findById({ id: answerToDelete.id! })).toBeDefined(); // Ensure it's there

		const commandProps: DeleteAnswerCommandProps = { id: answerToDelete.id! };
		const command = new DeleteAnswerCommand(commandProps);

		// Act
		await handler.execute(command);

		// Assert
		const deletedAnswer = await answerRepository.findById({ id: answerToDelete.id! });
		expect(deletedAnswer).toBeNull();
	});

	it('should throw AnswerNotFound if the answer to delete does not exist', async () => {
		// Arrange
		const nonExistentAnswerId = '00000000-0000-0000-0000-000000000000';
		const commandProps: DeleteAnswerCommandProps = { id: nonExistentAnswerId };
		const command = new DeleteAnswerCommand(commandProps);

		// Act & Assert
		await expect(handler.execute(command)).rejects.toThrow(AnswerNotFound);
		await expect(handler.execute(command)).rejects.toThrow(`Answer with ID "${nonExistentAnswerId}" not found.`);
	});
});
