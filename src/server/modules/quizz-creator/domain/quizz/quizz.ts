import { z } from 'zod';

export const QuizzProps = z.object({
	id: z.string().uuid().nullable().optional(),
	title: z.string().min(1).max(256),
	description: z.string().nullable(),
	isPublished: z.boolean().default(false),
	createdBy: z.string().uuid(),
});
export type QuizzProps = z.infer<typeof QuizzProps>;

export class Quizz {
	private readonly _id: string;
	private _title: string;
	private _description: string | null;
	private _isPublished: boolean;
	private readonly _createdBy: string;

	private constructor(props: QuizzProps) {
		this._id = props.id ?? crypto.randomUUID();
		this._title = props.title;
		this._description = props.description;
		this._isPublished = props.isPublished;
		this._createdBy = props.createdBy;
	}

	public static create(props: QuizzProps): Quizz {
		const validatedProps = QuizzProps.parse(props);
		return new Quizz(validatedProps);
	}

	public setIsPublished(value: boolean): void {
		this._isPublished = value;
	}

	public setTitle(value: string): void {
		this._title = value;
	}

	public setDescription(value: string | null): void {
		this._description = value;
	}

	public get id(): string {
		return this._id;
	}

	public get title(): string {
		return this._title;
	}

	public get description(): string | null {
		return this._description;
	}

	public get isPublished(): boolean {
		return this._isPublished;
	}

	public get createdBy(): string {
		return this._createdBy;
	}
}
