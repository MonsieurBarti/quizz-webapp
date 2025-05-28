import { z } from 'zod';
import { AttemptAlreadyCompleted } from '../errors/quizz-taker.errors';

export const AttemptProps = z.object({
	id: z.string().uuid().nullable().optional(),
	quizzId: z.string().uuid(),
	playerId: z.string().uuid(),
	startedAt: z.date(),
	completedAt: z.date().nullable(),
	score: z.number().default(0),
	totalQuestionsAnswered: z.number().default(0),
});

export type AttemptProps = z.infer<typeof AttemptProps>;

export class Attempt {
	private readonly _id: string;
	private readonly _quizzId: string;
	private readonly _playerId: string;
	private readonly _startedAt: Date;
	private _completedAt: Date | null;
	private _score: number;
	private _totalQuestionsAnswered: number;

	private constructor(props: AttemptProps) {
		this._id = props.id ?? crypto.randomUUID();
		this._quizzId = props.quizzId;
		this._playerId = props.playerId;
		this._startedAt = props.startedAt;
		this._completedAt = props.completedAt;
		this._score = props.score;
		this._totalQuestionsAnswered = props.totalQuestionsAnswered;
	}

	public static create(props: AttemptProps): Attempt {
		const validatedProps = AttemptProps.parse(props);
		return new Attempt(validatedProps);
	}

	public incrementScore(): void {
		if (this._completedAt) {
			throw new AttemptAlreadyCompleted();
		}
		this._score++;
	}

	public incrementTotalQuestionsAnswered(): void {
		if (this._completedAt) {
			throw new AttemptAlreadyCompleted();
		}
		this._totalQuestionsAnswered++;
	}

	public complete(): void {
		if (this._completedAt) {
			throw new AttemptAlreadyCompleted();
		}
		this._completedAt = new Date();
	}

	public get id(): string {
		return this._id;
	}

	public get quizzId(): string {
		return this._quizzId;
	}

	public get playerId(): string {
		return this._playerId;
	}

	public get startedAt(): Date {
		return this._startedAt;
	}

	public get completedAt(): Date | null {
		return this._completedAt;
	}

	public get score(): number {
		return this._score;
	}

	public get totalQuestionsAnswered(): number {
		return this._totalQuestionsAnswered;
	}
}
