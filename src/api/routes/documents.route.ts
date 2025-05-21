import { Router } from 'express';
import {
    getDocuments,
    getDocumentById,
    createDocument,
    updateDocument,
    deleteDocument
} from '../controllers/documents.controller';

const router = Router();

/**
 * @route GET /api/documents
 * @desc Get all documents with pagination
 * @access Public
 */
router.get('/', getDocuments);

/**
 * @route GET /api/documents/:id
 * @desc Get a single document by ID
 * @access Public
 */
router.get('/:id', getDocumentById);

/**
 * @route POST /api/documents
 * @desc Create a new document with embedding
 * @access Public
 */
router.post('/', createDocument);

/**
 * @route PUT /api/documents/:id
 * @desc Update an existing document and its embedding
 * @access Public
 */
router.put('/:id', updateDocument);

/**
 * @route DELETE /api/documents/:id
 * @desc Delete a document and its embedding
 * @access Public
 */
router.delete('/:id', deleteDocument);

export default router;