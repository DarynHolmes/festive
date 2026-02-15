import { z } from 'zod';

export const diningStatus = z.enum(['dining', 'not_dining', 'undecided']);

// Validates outbound payload to prevent malformed data reaching the API.
export const memberEntrySchema = z.object({
  memberId: z.string().min(1, 'Member identifier is required'),
  status: diningStatus,
});

export type MemberEntry = z.infer<typeof memberEntrySchema>;
