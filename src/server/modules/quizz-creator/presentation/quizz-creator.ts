import { createTRPCRouter } from '@/server/api/trpc';
import { quizzRouter } from './quizz/quizz.router';
import { questionRouter } from './question/question.router';
import { answerRouter } from './answer/answer.router';

export const quizzCreatorRouter = createTRPCRouter({
	quizz: quizzRouter,
	question: questionRouter,
	answer: answerRouter,
});
