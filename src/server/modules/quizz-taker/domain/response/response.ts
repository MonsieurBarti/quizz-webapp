import { z } from 'zod';

export const ResponseProps = z.object({
	id: z.string().uuid().nullable().optional(),
	attemptId: z.string().uuid(),
	questionId: z.string().uuid(),
	answerId: z.string().uuid(),
	isCorrect: z.boolean(),
	timeTakenMs: z.number().int().min(0, 'Time taken must be a non-negative integer.'),
});

export type ResponseProps = z.infer<typeof ResponseProps>;

export class Response {
	private readonly _id: string;
	private readonly _attemptId: string;
	private readonly _questionId: string;
	private readonly _answerId: string;
	private readonly _isCorrect: boolean;
	private readonly _timeTakenMs: number;

	private constructor(props: ResponseProps) {
		this._id = props.id ?? crypto.randomUUID();
		this._attemptId = props.attemptId;
		this._questionId = props.questionId;
		this._answerId = props.answerId;
		this._isCorrect = props.isCorrect;
		this._timeTakenMs = props.timeTakenMs;
	}

	public static create(props: ResponseProps): Response {
		const validatedProps = ResponseProps.parse(props);
		return new Response(validatedProps);
	}

	public get id(): string {
		return this._id;
	}

	public get attemptId(): string {
		return this._attemptId;
	}

	public get questionId(): string {
		return this._questionId;
	}

	public get answerId(): string {
		return this._answerId;
	}

	public get isCorrect(): boolean {
		return this._isCorrect;
	}

	public get timeTakenMs(): number {
		return this._timeTakenMs;
	}
}
