export function cosineSimilarity(
    a: number[],
    b: number[]
): number {
    if(a.length !== b.length){
        throw new Error(
            "Vectors must have the same"
        )
    }

    let dotProduct = 0
    let normA = 0
    let normB = 0

    for(let i=0; i < a.length; i++){
        const aValue = a[i]
        const bValue = b[i]

        if (
            aValue === undefined ||
            bValue === undefined
        ) {
            throw new Error(
                "Vector contains a missing value"
            )
        }

        dotProduct += aValue * bValue

        normA += aValue * aValue
        normB += bValue * bValue
    }

    if (normA === 0 || normB === 0) {
        throw new Error(
            "Cosine similarity is undefined for a zero vector"
        )
    }

    return (
        dotProduct/
        (
            Math.sqrt(normA) * Math.sqrt(normB)
        )
    )
}
