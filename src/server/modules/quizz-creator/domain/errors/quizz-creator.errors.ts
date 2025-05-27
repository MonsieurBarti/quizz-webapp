export class QuizzCreatorError extends Error {
	constructor(message: string) {
		super(message);
		this.name = 'QuizzCreatorError';
	}
}

export class QuizzNotFound extends QuizzCreatorError {
	constructor(id: string) {
		super(`Quizz with id ${id} not found`);
	}
}

export class UnauthorizedQuizzAccess extends QuizzCreatorError {
	constructor(id: string, userId: string) {
		super(`User ${userId} is not authorized to access quizz ${id}`);
		this.name = 'UnauthorizedQuizzAccess';
	}
}

export class QuestionNotFound extends QuizzCreatorError {
	constructor(questionId: string) {
		super(`Question with ID "${questionId}" not found.`);
		this.name = 'QuestionNotFound';
	}
}

export class UnauthorizedQuestionAccess extends QuizzCreatorError {
	constructor(questionId: string, userId: string) {
		super(`User ${userId} is not authorized to access question ${questionId}`);
		this.name = 'UnauthorizedQuestionAccess';
	}
}

export class AnswerNotFound extends QuizzCreatorError {
	constructor(answerId: string) {
		super(`Answer with ID "${answerId}" not found.`);
		this.name = 'AnswerNotFound';
	}
}

export class UnauthorizedAnswerAccess extends QuizzCreatorError {
	constructor(answerId: string, userId: string) {
		super(`User ${userId} is not authorized to access answer ${answerId}`);
		this.name = 'UnauthorizedAnswerAccess';
	}
}
