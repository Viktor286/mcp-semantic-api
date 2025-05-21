import { Request, Response, NextFunction } from 'express';
import documentModel from '../../models/document.model';
import searchService from '../../services/search.service';
import logger from '../../utils/logger';
import { ApiError, CreateDocumentRequest, UpdateDocumentRequest } from '../../types';

export const getDocuments = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const page = parseInt(req.query.page as string || '1', 10);
        const pageSize = parseInt(req.query.pageSize as string || '10', 10);

        if (page < 1 || pageSize < 1) {
            throw new ApiError('Invalid pagination parameters', 400);
        }

        const offset = (page - 1) * pageSize;

        const documents = await documentModel.getAllDocuments(pageSize, offset);
        const total = await documentModel.countDocuments();

        res.json({
            success: true,
            data: {
                items: documents,
                total,
                page,
                pageSize,
                totalPages: Math.ceil(total / pageSize)
            }
        });
    } catch (error) {
        next(error);
    }
};

export const getDocumentById = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const id = parseInt(req.params.id, 10);

        if (isNaN(id)) {
            throw new ApiError('Invalid document ID', 400);
        }

        const document = await documentModel.getDocumentById(id);

        if (!document) {
            throw new ApiError('Document not found', 404);
        }

        res.json({
            success: true,
            data: document
        });
    } catch (error) {
        next(error);
    }
};

export const createDocument = async (
    req: Request<{}, {}, CreateDocumentRequest>,
    res: Response,
    next: NextFunction
) => {
    try {
        const { title, content, metadata } = req.body;

        if (!title || !content) {
            throw new ApiError('Title and content are required', 400);
        }

        // Add document with its embedding
        const document = await searchService.addDocumentWithEmbedding(
            title,
            content,
            metadata
        );

        res.status(201).json({
            success: true,
            data: document,
            message: 'Document created successfully'
        });
    } catch (error) {
        next(error);
    }
};

export const updateDocument = async (
    req: Request<{ id: string }, {}, UpdateDocumentRequest>,
    res: Response,
    next: NextFunction
) => {
    try {
        const id = parseInt(req.params.id, 10);

        if (isNaN(id)) {
            throw new ApiError('Invalid document ID', 400);
        }

        const { title, content, metadata } = req.body;

        if (!title && !content && !metadata) {
            throw new ApiError('At least one field to update is required', 400);
        }

        // Update document and its embedding if necessary
        const updatedDocument = await searchService.updateDocumentWithEmbedding(
            id,
            title,
            content,
            metadata
        );

        res.json({
            success: true,
            data: updatedDocument,
            message: 'Document updated successfully'
        });
    } catch (error) {
        next(error);
    }
};

export const deleteDocument = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const id = parseInt(req.params.id, 10);

        if (isNaN(id)) {
            throw new ApiError('Invalid document ID', 400);
        }

        const result = await documentModel.deleteDocument(id);

        if (!result) {
            throw new ApiError('Document not found', 404);
        }

        res.json({
            success: true,
            message: 'Document deleted successfully'
        });
    } catch (error) {
        next(error);
    }
};