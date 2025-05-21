import { Request, Response, NextFunction } from 'express';
import searchService from '../../services/search.service';
import logger from '../../utils/logger';
import { ApiError, SearchRequest } from '../../types';

export const semanticSearch = async (
    req: Request<{}, {}, {}, SearchRequest>,
    res: Response,
    next: NextFunction
) => {
    try {
        const { query, similarityThreshold = 0.7, maxResults = 10 } = req.query;

        if (!query) {
            throw new ApiError('Search query is required', 400);
        }

        if (similarityThreshold < 0 || similarityThreshold > 1) {
            throw new ApiError('Similarity threshold must be between 0 and 1', 400);
        }

        if (maxResults < 1 || maxResults > 100) {
            throw new ApiError('Max results must be between 1 and 100', 400);
        }

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