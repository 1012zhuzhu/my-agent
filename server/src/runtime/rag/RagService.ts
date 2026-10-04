import * as lancedb from '@lancedb/lancedb';
import { getKnowledgeTable, syncKnowledge } from './KnowledgeIndexer';
import { search } from './Retriever';
import { rerank } from './Reranker';

export class RagService {
    private table?: lancedb.Table

    constructor(
        private dbPath: string,
        private knowledgeDirectory: string
    ){}

    async init(){
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
        if (!this.table) {
            throw new Error("RagService 还没有初始化")
        }
        const result =await search(
            query,
            this.table
        )

        const reranks = await rerank(
            query,
            result
        )
        
        return reranks
    }

    buildContext(document: {text: string}[]){
        return document.map(
            item => item.text
        ).join("\n")
    }
}