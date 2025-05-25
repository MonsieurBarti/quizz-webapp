import { z } from 'zod';
import crypto from 'crypto';

export const AnswerProps = z.object({
	id: z.string().uuid().nullable().optional(),
	questionId: z.string().uuid(),
	text: z.string().min(1, 'Answer text cannot be empty.').max(500, 'Answer text is too long.'),
	isCorrect: z.boolean(),
	order: z.number().int().min(0, 'Order must be a non-negative integer.'),
	nextQuestionId: z.string().uuid().nullable(), // For branching logic
});
export type AnswerProps = z.infer<typeof AnswerProps>;

export class Answer {
	private readonly _id: string;
	private readonly _questionId: string;
	private readonly _text: string;
	private readonly _isCorrect: boolean;
	private readonly _order: number;
	private _nextQuestionId: string | null;

	private constructor(props: AnswerProps) {
		this._id = props.id ?? crypto.randomUUID();
		this._questionId = props.questionId;
		this._text = props.text;
		this._isCorrect = props.isCorrect;
		this._order = props.order;
		this._nextQuestionId = props.nextQuestionId;
	}

	public static create(props: AnswerProps): Answer {
		const validatedProps = AnswerProps.parse(props);
		return new Answer(validatedProps);
	}

	public get id(): string {
		return this._id;
	}

	public get questionId(): string {
		return this._questionId;
	}

	public get text(): string {
		return this._text;
	}

	public get isCorrect(): boolean {
		return this._isCorrect;
	}

	public get order(): number {
		return this._order;
	}

	public get nextQuestionId(): string | null {
		return this._nextQuestionId;
	}
}
