import { z } from 'zod';

export const PlayerProps = z.object({
	id: z.string().uuid().nullable().optional(),
	email: z.string().email(),
	name: z.string().max(256).nullable(),
});

export type PlayerProps = z.infer<typeof PlayerProps>;

export class Player {
	private readonly _id: string;
	private readonly _email: string;
	private readonly _name: string;

	private constructor(props: PlayerProps) {
		this._id = props.id ?? crypto.randomUUID();
		this._email = props.email;
		this._name = props.name ?? 'Unknown';
	}

	public static create(props: PlayerProps): Player {
		const validatedProps = PlayerProps.parse(props);
		return new Player(validatedProps);
	}

	public get id(): string {
		return this._id;
	}

	public get email(): string {
		return this._email;
	}

	public get name(): string {
		return this._name;
	}
}
