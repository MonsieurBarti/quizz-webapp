import { z } from 'zod';

export const PlayerOutput = z.object({
	id: z.string().uuid(),
	name: z.string(),
	email: z.string().email(),
});
export type PlayerOutput = z.infer<typeof PlayerOutput>;

export const SavePlayerProps = z.object({
	name: z.string().min(1, 'Name is required'),
	email: z.string().email('Invalid email address'),
});
export type SavePlayerProps = z.infer<typeof SavePlayerProps>;
