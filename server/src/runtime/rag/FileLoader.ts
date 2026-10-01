import fs from "node:fs/promises"
import path from "node:path"

export async function loadTextFile(filePath: string): Promise<string> {
    const content = await fs.readFile(
        filePath,
        "utf-8"
    )
    

    return content
}

export async function loadKnowledgeFiles(
    directory: string
): Promise<string[]>{
    const files = await fs.readdir(directory)

    return files.filter(file => 
        file.endsWith(".txt") || 
        file.endsWith(".md")
    ).map(file => 
        path.join(directory,file)
    )
}