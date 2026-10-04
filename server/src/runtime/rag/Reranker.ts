import {
  AutoModelForSequenceClassification,
  AutoTokenizer
} from "@huggingface/transformers"

const modelName =
  "jinaai/jina-reranker-v2-base-multilingual"

async function loadReranker() {
  return Promise.all([
    AutoTokenizer.from_pretrained(
      modelName
    ),

    AutoModelForSequenceClassification
      .from_pretrained(
        modelName,
        {
          // 使用较小的量化模型
          dtype: "q8"
        }
      )
  ])
}

// 保存加载任务，保证模型只加载一次
let rerankerPromise:
  ReturnType<typeof loadReranker>
  | undefined

function getReranker() {
  if (!rerankerPromise) {
    rerankerPromise = loadReranker()
  }

  return rerankerPromise
}

export interface RetrievedDocument {
  text: string
  source: string
  _distance: number
}

export interface RerankedDocument
  extends RetrievedDocument {
  rerankScore: number
}

export async function rerank(
  query: string,
  documents: RetrievedDocument[]
): Promise<RerankedDocument[]> {
  if (documents.length === 0) {
    return []
  }

  const [tokenizer, model] =
    await getReranker()

  // 所有候选文档共用同一个问题
  const queries = documents.map(
    () => query
  )

  const texts = documents.map(
    document => document.text
  )

  // 编码形式：
  // query[0] + texts[0]
  // query[1] + texts[1]
  // ...
  const inputs = tokenizer(
    queries,
    {
      text_pair: texts,
      padding: true,
      truncation: true
    }
  )

  const output =
    await model(inputs)

  const scoreRows =
    output.logits
      .sigmoid()
      .tolist() as number[][]

  return documents
    .map((document, index) => ({
      ...document,

      // noUncheckedIndexedAccess 开启后，
      // 必须考虑数组元素不存在
      rerankScore:
        scoreRows[index]?.[0] ??
        Number.NEGATIVE_INFINITY
    }))
    .sort(
      (a, b) =>
        b.rerankScore -
        a.rerankScore
    )
    .slice(0, 3)
}