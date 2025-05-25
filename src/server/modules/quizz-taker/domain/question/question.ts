import { z } from 'zod';

export const QuestionProps = z.object({
	id: z.string().uuid().nullable().optional(),
	quizzId: z.string().uuid(),
	text: z.string().min(1, 'Question text cannot be empty.').max(1000, 'Question text is too long.'),
	order: z.number().int().min(0, 'Order must be a non-negative integer.'),
	imageUrl: z.string().url('Invalid URL format for image.').nullable(),
});

export type QuestionProps = z.infer<typeof QuestionProps>;

export class Question {
	private readonly _id: string;
	private readonly _quizzId: string;
	private readonly _text: string;
	private readonly _imageUrl: string | null;
	private readonly _order: number;

	private constructor(props: QuestionProps) {
		this._id = props.id ?? crypto.randomUUID();
		this._quizzId = props.quizzId;
		this._text = props.text;
		this._order = props.order;
		this._imageUrl = props.imageUrl;
	}

	public static create(props: QuestionProps): Question {
		const validatedProps = QuestionProps.parse(props);
		return new Question(validatedProps);
	}

	public get id(): string {
		return this._id;
	}

	public get quizzId(): string {
		return this._quizzId;
	}

	public get text(): string {
		return this._text;
	}

	public get order(): number {
		return this._order;
	}

	public get imageUrl(): string | null {
		return this._imageUrl;
	}
}
