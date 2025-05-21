import { z } from 'zod';

export const createDocumentSchema = z.object({
    title: z.string().min(1, 'Title is required'),
    content: z.string().min(1, 'Content is required'),
    metadata: z.record(z.any()).optional(),
});

export const updateDocumentSchema = z.object({
    title: z.string().min(1, 'Title cannot be empty').optional(),
    content: z.string().min(1, 'Content cannot be empty').optional(),
    metadata: z.record(z.any()).optional(),
}).refine(data => data.title !== undefined || data.content !== undefined || data.metadata !== undefined, {
    message: 'At least one field (title, content, or metadata) must be provided for update',
    path: ['title', 'content', 'metadata'],
});

export const searchSchema = z.object({
    query: z.string().min(1, 'Search query is required'),
    similarityThreshold: z.preprocess(
        (val) => parseFloat(String(val)),
        z.number().min(0).max(1).default(0.7)
    ).optional(),
    maxResults: z.preprocess(
        (val) => parseInt(String(val), 10),
        z.number().int().min(1).max(100).default(10)
    ).optional(),
});
