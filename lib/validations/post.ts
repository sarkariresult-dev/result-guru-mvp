import { z } from 'zod'

export const generatePostSchema = z.object({
    topic: z.string().min(3, "Topic must be at least 3 characters"),
    postType: z.string().min(1, "Post Type is required"),
    tone: z.string().default('Professional'),
    targetAudience: z.string().default('General Public'),
    primaryKeywords: z.string().optional()
})

export type GeneratePostInput = z.infer<typeof generatePostSchema>
