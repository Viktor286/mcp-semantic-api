import { Router } from 'express';
import { semanticSearch } from '../controllers/search.controller';

const router = Router();

/**
 * @route GET /api/search
 * @desc Perform semantic search
 * @access Public
 * @query query - The search query
 * @query similarityThreshold - Minimum similarity threshold (0-1)
 * @query maxResults - Maximum results to return
 */
router.get('/', semanticSearch);

export default router;