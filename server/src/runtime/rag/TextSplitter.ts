import type { DocumentChunk } from "./DocumentChunk.js";

export function splitText(
    text: string,
    chunkSize: number,
    overlap: number
): DocumentChunk[] {
    const chunks: DocumentChunk[] = []

    let index = 0

    const step = chunkSize - overlap
    for(
        let start = 0;
        start < text.length;
        start+= step
    ){
        const chunkText = text.slice(start, start + chunkSize)

        chunks.push({
            id:`chunk-${index}`,
            text: chunkText
        })

        index++
    }
    return chunks
}