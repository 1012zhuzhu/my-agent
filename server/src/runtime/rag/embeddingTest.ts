import { RagService } from "./RagService";

const rag = new RagService(
     "./data/rag-lancedb",
    "./knowledge"
)

await rag.init()

const result = await rag.retrieve(
    "员工守则"
)

console.log(result)

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
