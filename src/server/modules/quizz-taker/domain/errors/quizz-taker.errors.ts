export class QuizzTakerError extends Error {
	constructor(message: string) {
		super(message);
		this.name = 'QuizzTakerError';
	}
}

export class AttemptAlreadyCompletedError extends QuizzTakerError {
	constructor() {
		super('Attempt is already completed');
	}
}
