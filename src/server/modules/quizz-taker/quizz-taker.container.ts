import 'reflect-metadata';

import { Container } from 'inversify';
import { QUIZZ_TAKER_TOKENS } from './quizz-taker.tokens';
import { GetAllQuizzQueryHandler } from './application/queries/quizz/get-all-quizz/get-all-quizz.query';
import { GetQuizzByIdQueryHandler } from './application/queries/quizz/get-quizz-by-id/get-quizz-by-id.query';
import { GetAllAnswersQueryHandler } from './application/queries/answer/get-all-answers/get-all-answers.query';
import { GetAnswerByIdQueryHandler } from './application/queries/answer/get-answer-by-id/get-answer-by-id.query';
import { GetAllQuestionsQueryHandler } from './application/queries/question/get-all-questions/get-all-questions.query';
import { GetQuestionByIdQueryHandler } from './application/queries/question/get-question-by-id/get-question-by-id.query';

const quizzTakerContainer = new Container();

quizzTakerContainer.bind(QUIZZ_TAKER_TOKENS.GET_ALL_QUIZZ_QUERY_HANDLER).to(GetAllQuizzQueryHandler).inSingletonScope();
quizzTakerContainer
	.bind(QUIZZ_TAKER_TOKENS.GET_QUIZZ_BY_ID_QUERY_HANDLER)
	.to(GetQuizzByIdQueryHandler)
	.inSingletonScope();
quizzTakerContainer
	.bind(QUIZZ_TAKER_TOKENS.GET_ALL_ANSWERS_QUERY_HANDLER)
	.to(GetAllAnswersQueryHandler)
	.inSingletonScope();
quizzTakerContainer
	.bind(QUIZZ_TAKER_TOKENS.GET_ANSWER_BY_ID_QUERY_HANDLER)
	.to(GetAnswerByIdQueryHandler)
	.inSingletonScope();
quizzTakerContainer
	.bind(QUIZZ_TAKER_TOKENS.GET_ALL_QUESTIONS_QUERY_HANDLER)
	.to(GetAllQuestionsQueryHandler)
	.inSingletonScope();
quizzTakerContainer
	.bind(QUIZZ_TAKER_TOKENS.GET_QUESTION_BY_ID_QUERY_HANDLER)
	.to(GetQuestionByIdQueryHandler)
	.inSingletonScope();

export { quizzTakerContainer };
