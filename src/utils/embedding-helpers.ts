/**
 * Calculate the cosine similarity between two vectors
 */
export function cosineSimilarity(a: number[], b: number[]): number {
    if (a.length !== b.length) {
        throw new Error('Vectors must have the same dimensions');
    }

    let dotProduct = 0;
    let normA = 0;
    let normB = 0;

    for (let i = 0; i < a.length; i++) {
        dotProduct += a[i] * b[i];
        normA += a[i] * a[i];
        normB += b[i] * b[i];
    }

    if (normA === 0 || normB === 0) {
        return 0;
    }

    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

/**
 * Calculate the Euclidean distance between two vectors
 */
export function euclideanDistance(a: number[], b: number[]): number {
    if (a.length !== b.length) {
        throw new Error('Vectors must have the same dimensions');
    }

    let sum = 0;
    for (let i = 0; i < a.length; i++) {
        const diff = a[i] - b[i];
        sum += diff * diff;
    }

    return Math.sqrt(sum);
}

/**
 * Normalize a vector to have unit length
 */
export function normalizeVector(vector: number[]): number[] {
    const norm = Math.sqrt(vector.reduce((sum, val) => sum + val * val, 0));

    if (norm === 0) {
        return vector;
    }

    return vector.map(val => val / norm);
}

/**
 * Combine multiple embeddings with weights
 */
export function combineEmbeddings(
    embeddings: number[][],
    weights: number[] = []
): number[] {
    if (embeddings.length === 0) {
        throw new Error('At least one embedding is required');
    }

    const dim = embeddings[0].length;

    // If weights not provided, use equal weights
    const effectiveWeights = weights.length === embeddings.length
        ? weights
        : embeddings.map(() => 1 / embeddings.length);

    // Ensure weights sum to 1
    const weightSum = effectiveWeights.reduce((sum, w) => sum + w, 0);
    const normalizedWeights = effectiveWeights.map(w => w / weightSum);

    // Initialize result vector with zeros
    const result = new Array(dim).fill(0);

    // Compute weighted sum
    for (let i = 0; i < embeddings.length; i++) {
        const embedding = embeddings[i];
        const weight = normalizedWeights[i];

        if (embedding.length !== dim) {
            throw new Error('All embeddings must have the same dimensions');
        }

        for (let j = 0; j < dim; j++) {
            result[j] += embedding[j] * weight;
        }
    }

    // Normalize the result vector
    return normalizeVector(result);
}