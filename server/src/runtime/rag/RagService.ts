import * as lancedb from '@lancedb/lancedb';
import { getKnowledgeTable, syncKnowledge } from './KnowledgeIndexer';
import { search } from './Retriever';
import { rerank, type RerankedDocument } from './Reranker';

export class RagService {
    private table?: lancedb.Table
    private initPromise: Promise<void> | null = null

    constructor(
        private dbPath: string,
        private knowledgeDirectory: string,
        private rerankEnabled = false
    ){}

    async init(): Promise<void> {
        if (this.table) {
            return
        }

        if (!this.initPromise) {
            this.initPromise = this.initialize().catch((error) => {
                // 初始化失败后允许下一次查询重试。
                this.initPromise = null
                throw error
            })
        }

        await this.initPromise
    }

    private async initialize(): Promise<void> {
        const db = await lancedb.connect(
            this.dbPath
        )

        const table = await getKnowledgeTable(
            db,
            this.knowledgeDirectory
        )

        await syncKnowledge(
            table,
            this.knowledgeDirectory
        )

        this.table = table
    }

    async retrieve(query: string){
        // 按需初始化，避免阻塞 Express 启动和端口监听。
        await this.init()

        if (!this.table) {
            throw new Error("RagService 还没有初始化")
        }
        const result =await search(
            query,
            this.table
        )

        if (!this.rerankEnabled || result.length === 0) {
            return result
        }

        try {
            return await rerank(
                query,
                result
            )
        } catch (error) {
            // reranker 是增强能力，加载失败不应让基础知识库查询整体失败。
            console.error(
                "[RagService] reranker failed, using vector results:",
                error
            )

            return result
        }
    }

    buildContext(documents: RerankedDocument[]) {
    return documents
        .map(
        item =>
            `[来源: ${item.source}]\n${item.text}`
        )
        .join("\n\n")
}
}
