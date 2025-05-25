import 'reflect-metadata';
import {
	DeleteQuestionCommand,
	DeleteQuestionCommandHandler,
	DeleteQuestionCommandProps,
} from './delete-question.command';
import { InMemoryQuestionRepository } from '@quizz-creator/infrastructure/persistence/question/in-memory-question.repository';
import { QuestionBuilder } from '@quizz-creator/domain/question/question.builder';
import { QuestionNotFound } from '@quizz-creator/domain/errors/quizz-creator.errors';
import { Question } from '@quizz-creator/domain/question/question';

describe('DeleteQuestionCommandHandler', () => {
	let questionRepository: InMemoryQuestionRepository;
	let handler: DeleteQuestionCommandHandler;
	let questionBuilder: QuestionBuilder;
	let existingQuestion: Question;

	beforeEach(async () => {
		questionRepository = new InMemoryQuestionRepository();
		handler = new DeleteQuestionCommandHandler(questionRepository);
		questionBuilder = new QuestionBuilder();

		existingQuestion = questionBuilder.build();
		await questionRepository.save(existingQuestion);
	});

	it('should delete an existing answer successfully', async () => {
		// Arrange
		const questionToDelete = questionBuilder.withQuizzId(existingQuestion.quizzId).build();
		await questionRepository.save(questionToDelete);
		expect(await questionRepository.findById({ id: questionToDelete.id! })).toBeDefined(); // Ensure it's there

		const commandProps: DeleteQuestionCommandProps = { id: questionToDelete.id! };
		const command = new DeleteQuestionCommand(commandProps);

		// Act
		await handler.execute(command);

		// Assert
		const deletedQuestion = await questionRepository.findById({ id: questionToDelete.id! });
		expect(deletedQuestion).toBeNull();
	});

	it('should throw QuestionNotFound if the answer to delete does not exist', async () => {
		// Arrange
		const nonExistentQuestionId = '00000000-0000-0000-0000-000000000000';
		const commandProps: DeleteQuestionCommandProps = { id: nonExistentQuestionId };
		const command = new DeleteQuestionCommand(commandProps);

		// Act & Assert
		await expect(handler.execute(command)).rejects.toThrow(QuestionNotFound);
		await expect(handler.execute(command)).rejects.toThrow(
			`Question with ID "${nonExistentQuestionId}" not found.`,
		);
	});
});
