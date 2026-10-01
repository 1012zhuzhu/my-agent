import { pipeline } from "@huggingface/transformers";

const exetrator = await pipeline(
    "feature-extraction",
    "Xenova/paraphrase-multilingual-MiniLM-L12-v2"
)

export async function embed(text: string): Promise<number[]> {
    const output = await exetrator(
        text,
        {
            pooling: "mean",
            normalize: true
        }
    )

    return output.tolist()[0] as number[]
}