import * as lancedb from "@lancedb/lancedb"
import { search } from "./Retriever"
import {
    getKnowledgeTable,
    syncKnowledge
} from "./KnowledgeIndexer"

const db = await lancedb.connect(
    "./data/rag-lancedb"
)

const table = await getKnowledgeTable(
    db,
    "./knowledge"
)

await syncKnowledge(
    table,
    "./knowledge"
)

const result = await search(
    "去上海出差要注意什么",
    table
)

const context = result
    .map(item => item.text)
    .join(".\n")

console.log(context)



// async function buildIndex(
//     documents: string[]
    
// ){
//     const result = []
//     for(const document of documents){
//         const vector = await embed(document)

//         result.push({
//             text: document,
//             vector
//         })
//     }
//     return result
// }

// async function saveIndex(
//     knowledgeBase:{
//         text: string,
//         vector: number[]
//     }[]
// ){
//     await fs.writeFile(
//         "./knowledgeBase.json",
//         JSON.stringify(knowledgeBase, null, 2),
//         "utf-8"
//     )
// }

// async function loadIndex() {
//     const data = await fs.readFile(
//         "./knowledgeBase.json",
//         "utf-8"
//     )

//     return JSON.parse(data)
// }
