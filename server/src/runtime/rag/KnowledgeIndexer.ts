import path from "node:path";
import type { DocumentChunk } from "./DocumentChunk";
import { embed } from "./embedding";
import { loadKnowledgeFiles, loadTextFile } from "./FileLoader";
import { splitText } from "./TextSplitter";
import fs from "node:fs/promises"
import * as lancedb from '@lancedb/lancedb';

async function buildIndex(
    chunks: DocumentChunk[],
    source: string,
    modifiedTime: number
){
    const result = []

    for(const chunk of chunks){
        const vector = await embed(
            chunk.text
        )

        result.push({
            id: `${source}-${chunk.id}`,
            text: chunk.text,
            vector,
            source,
            modifiedTime
        })
    }

    return result
}

export async function processFile(
    filePath: string
){
    const text = await loadTextFile(
        filePath
    )
    
    const source = path.basename(filePath)

    const stat = await fs.stat(filePath)
    const modifiedTime = stat.mtimeMs

    const chunks = splitText(
        text,
        80,
        20
    )

    return await buildIndex(
        chunks,
        source,
        modifiedTime
    )
}

async function getIndexedFiles(table: lancedb.Table) {
    const rows =await table.query().select(["source","modifiedTime"]).toArray()

    const indexedFiles = new Map<string,number>()

    for(const row of rows){
        indexedFiles.set(
            row.source,
            row.modifiedTime
        )
    }
    
    return indexedFiles
}

export async function syncKnowledge(
    table: lancedb.Table,
    directory: string
){
    const filePaths = await loadKnowledgeFiles(
        directory
    )
    const indexedFiles =await getIndexedFiles(table)

    const currentSources = new Set(
            filePaths.map(
                filePath => path.basename(filePath)
            )
        )
    
    for(const filePath of filePaths){
        const source = path.basename(filePath)

        const stat = await fs.stat(filePath)
        const currentModifiedTime = stat.mtimeMs

        const indexedModifiedTime = (await indexedFiles).get(source)

        if (indexedModifiedTime === undefined) {
            const records = await processFile(filePath)

            await table.add(records)

            console.log("新增文件:", source)
        } else if (
            indexedModifiedTime !== currentModifiedTime
        ) {
            await table.delete(`source = '${source}'`)

            const records = await processFile(filePath)

            await table.add(records)

            console.log("文件更新了");
            
        } else {
            console.log("文件无变化:", source)
        }
        
    }
    for (const source of indexedFiles.keys()) {
    if (!currentSources.has(source)) {

        await table.delete(
            `source = '${source}'`
        )

        console.log(
            "文件已删除，同步清理索引:",
            source
        )
    }
}
}

export async function getKnowledgeTable(
    db: lancedb.Connection,
    directory: string
): Promise<lancedb.Table> {

    // 先看看数据库里目前有哪些表
    const result = await db.listTables()

    const exists = result.tables.includes(
        "knowledge"
    )

    if(exists){
         console.log("打开表");
         
        return await db.openTable("knowledge")

    }
    console.log("创建新的表格");
    
    const filePaths =await loadKnowledgeFiles(directory)

    const knowledgeBase = []

    for(const filePath of filePaths){
        const records = await processFile(filePath)

        knowledgeBase.push(...records)
    }
    return await db.createTable(
        "knowledge",
        knowledgeBase
    )
}