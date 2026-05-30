import { z } from 'zod'

// Trims and normalises input; lowercases email so uniqueness is case-insensitive.
export const entrySchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, 'Please enter your name')
    .max(100, 'That name is too long'),
  email: z
    .string()
    .trim()
    .toLowerCase()
    .email('Please enter a valid email address')
    .max(254, 'That email is too long'),
})

export type EntryInput = z.infer<typeof entrySchema>
