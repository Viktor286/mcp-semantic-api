import { Request, Response, NextFunction } from 'express';
import documentModel from '../../models/document.model';
import searchService from '../../services/search.service';
import logger from '../../utils/logger';
import { ApiError } from '../../types'; // Remove CreateDocumentRequest, UpdateDocumentRequest
import { createDocumentSchema, updateDocumentSchema } from '../../schemas/api.schema'; // Import Zod schemas
import { z } from 'zod'; // Import z from zod

export const getDocuments = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        // Zod validation for pagination parameters
        const { page, pageSize } = z.object({
            page: z.preprocess(
                (val) => parseInt(String(val), 10),
                z.number().int().min(1).default(1)
            ).optional(),
            pageSize: z.preprocess(
                (val) => parseInt(String(val), 10),
                z.number().int().min(1).default(10)
            ).optional(),
        }).parse(req.query);

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
        const { id } = z.object({
            id: z.preprocess(
                (val) => parseInt(String(val), 10),
                z.number().int().min(1, 'Document ID must be a positive integer')
            ),
        }).parse(req.params);

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
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const { title, content, metadata } = createDocumentSchema.parse(req.body);

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
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const { id } = z.object({
            id: z.preprocess(
                (val) => parseInt(String(val), 10),
                z.number().int().min(1, 'Document ID must be a positive integer')
            ),
        }).parse(req.params);

        const { title, content, metadata } = updateDocumentSchema.parse(req.body);

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
        const { id } = z.object({
            id: z.preprocess(
                (val) => parseInt(String(val), 10),
                z.number().int().min(1, 'Document ID must be a positive integer')
            ),
        }).parse(req.params);

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
