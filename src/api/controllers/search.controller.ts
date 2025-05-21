import { Request, Response, NextFunction } from 'express';
import searchService from '../../services/search.service';
import logger from '../../utils/logger';
import { ApiError } from '../../types'; // Remove SearchRequest
import { searchSchema } from '../../schemas/api.schema'; // Import Zod schema

export const semanticSearch = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const { query, similarityThreshold, maxResults } = searchSchema.parse(req.query);

        const results = await searchService.semanticSearch(
            query,
            similarityThreshold,
            maxResults
        );

        res.json({
            success: true,
            data: results,
            meta: {
                query,
                similarityThreshold,
                maxResults,
                resultCount: results.length
            }
        });
    } catch (error) {
        next(error);
    }
};
