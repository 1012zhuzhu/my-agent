async function loadExtractor() {
    // 动态导入，避免服务器仅仅加载路由时就初始化 Transformers.js。
    const { pipeline } = await import("@huggingface/transformers")

    return pipeline(
        "feature-extraction",
        "Xenova/paraphrase-multilingual-MiniLM-L12-v2"
    )
}

let extractorPromise:
    ReturnType<typeof loadExtractor> | null = null

function getExtractor() {
    if (!extractorPromise) {
        extractorPromise = loadExtractor().catch((error) => {
            // 加载失败后允许下一次查询重新尝试，而不是永久保存失败状态。
            extractorPromise = null
            throw error
        })
    }

    return extractorPromise
}

export async function embed(text: string): Promise<number[]> {
    const extractor = await getExtractor()

    const output = await extractor(
        text,
        {
            pooling: "mean",
            normalize: true
        }
    )

    return output.tolist()[0] as number[]
}
