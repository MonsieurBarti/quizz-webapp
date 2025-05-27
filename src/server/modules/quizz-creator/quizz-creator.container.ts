import 'reflect-metadata';

import { Container } from 'inversify';
import { QUIZZ_CREATOR_TOKENS } from './quizz-creator.tokens';
import { SqlQuizzRepository } from './infrastructure/persistence/quizz/sql-quizz.repository';
import { CreateQuizzCommandHandler } from './application/commands/quizz/create-quizz/create-quizz.command';
import { SqlQuestionRepository } from './infrastructure/persistence/question/sql-question.repository';
import { CreateQuestionCommandHandler } from './application/commands/question/create-question/create-question.command';
import { SqlAnswerRepository } from './infrastructure/persistence/answer/sql-answer.repository';
import { CreateAnswerCommandHandler } from './application/commands/answer/create-answer/create-answer.command';
import { UpdateAnswerCommandHandler } from './application/commands/answer/update-answer/update-answer.command';
import { DeleteAnswerCommandHandler } from './application/commands/answer/delete-answer/delete-answer.command';
import { DeleteQuizzCommandHandler } from './application/commands/quizz/delete-quizz/delete-quizz.command';
import { UpdateQuizzCommandHandler } from './application/commands/quizz/update-quizz/update-quizz.command';
import { DeleteQuestionCommandHandler } from './application/commands/question/delete-question/delete-question.command';
import { UpdateQuestionCommandHandler } from './application/commands/question/update-question/update-question.command';

const quizzCreatorContainer = new Container();

// Quizz Bindings
quizzCreatorContainer.bind(QUIZZ_CREATOR_TOKENS.QUIZZ_REPOSITORY).to(SqlQuizzRepository).inSingletonScope();
quizzCreatorContainer
	.bind(QUIZZ_CREATOR_TOKENS.CREATE_QUIZZ_COMMAND_HANDLER)
	.to(CreateQuizzCommandHandler)
	.inSingletonScope();
quizzCreatorContainer
	.bind(QUIZZ_CREATOR_TOKENS.DELETE_QUIZZ_COMMAND_HANDLER)
	.to(DeleteQuizzCommandHandler)
	.inSingletonScope();
quizzCreatorContainer
	.bind(QUIZZ_CREATOR_TOKENS.UPDATE_QUIZZ_COMMAND_HANDLER)
	.to(UpdateQuizzCommandHandler)
	.inSingletonScope();

// Question Bindings
quizzCreatorContainer.bind(QUIZZ_CREATOR_TOKENS.QUESTION_REPOSITORY).to(SqlQuestionRepository).inSingletonScope();
quizzCreatorContainer
	.bind(QUIZZ_CREATOR_TOKENS.CREATE_QUESTION_COMMAND_HANDLER)
	.to(CreateQuestionCommandHandler)
	.inSingletonScope();
quizzCreatorContainer
	.bind(QUIZZ_CREATOR_TOKENS.DELETE_QUESTION_COMMAND_HANDLER)
	.to(DeleteQuestionCommandHandler)
	.inSingletonScope();
quizzCreatorContainer
	.bind(QUIZZ_CREATOR_TOKENS.UPDATE_QUESTION_COMMAND_HANDLER)
	.to(UpdateQuestionCommandHandler)
	.inSingletonScope();

// Answer Bindings
quizzCreatorContainer.bind(QUIZZ_CREATOR_TOKENS.ANSWER_REPOSITORY).to(SqlAnswerRepository).inSingletonScope();
quizzCreatorContainer
	.bind(QUIZZ_CREATOR_TOKENS.CREATE_ANSWER_COMMAND_HANDLER)
	.to(CreateAnswerCommandHandler)
	.inSingletonScope();
quizzCreatorContainer
	.bind(QUIZZ_CREATOR_TOKENS.UPDATE_ANSWER_COMMAND_HANDLER)
	.to(UpdateAnswerCommandHandler)
	.inSingletonScope();
quizzCreatorContainer
	.bind(QUIZZ_CREATOR_TOKENS.DELETE_ANSWER_COMMAND_HANDLER)
	.to(DeleteAnswerCommandHandler)
	.inSingletonScope();

export { quizzCreatorContainer };
