export interface DocumentChunk {
    id: string
    text: string

    metadata?: {
        source?: string
    }
}