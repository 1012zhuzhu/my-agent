import type { Tool } from "./Tool.js"
import type { ToolResult } from "./ToolResult.js"
import { RagService } from "../rag/RagService.js"
import { log } from "console"

export class RagTool implements Tool {
  name = "knowledge_search"

  description =
    "查询内部知识库中的公司制度、员工手册、差旅政策等信息"

  parameters = {
    type: "object" as const,

    properties: {
      query: {
        type: "string" as const,
        description: "需要从内部知识库中查询的问题"
      }
    },

    required: ["query"]
  }

  constructor(
    private ragService: RagService
  ) {}

  async execute(
    args: Record<string, unknown>
  ): Promise<ToolResult> {
    const query =
      typeof args.query === "string"
        ? args.query.trim()
        : ""
    if(!query){
        return {
        success: false,
        content: "query必须是非空字符",
        errorCode: "INVALID_ARGUMENT"
        } 
    }

    const documents = await this.ragService.retrieve(query)

    if (documents.length === 0) {
    return {
        success: true,
        content: "知识库中没有找到与该问题相关的信息",
        data: {
            sources: []
        }
    }
    }

    const context = this.ragService.buildContext(documents)

    const sources =
    documents.map(
        item => item.source
    )
    console.log( "[RagTool] sources:",
  sources);
    
    return {
        success: true,
        content: context,
        data: {
            sources: sources
        }
    }
  }
}