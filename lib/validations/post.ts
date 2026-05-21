import { z } from 'zod'

export const generatePostSchema = z.object({
    topic: z.string().min(3, "Topic must be at least 3 characters"),
    postType: z.string().min(1, "Post Type is required"),
    tone: z.string().optional().default('Professional'),
    targetAudience: z.string().optional().default('Government Job Seekers in India'),
    primaryKeywords: z.string().optional(),
    // Context fields - pulled from existing form state, no new UI needed
    organizationName: z.string().optional(),
    organizationShortName: z.string().optional(),
    officialWebsite: z.string().optional(),
    stateOrRegion: z.string().optional(),
    existingPrimaryLink: z.string().optional(),
    existingNotificationPdf: z.string().optional(),
    contentLanguage: z.enum(['english', 'hinglish']).optional().default('hinglish'),
})

export type GeneratePostInput = z.input<typeof generatePostSchema>
