import type {
  RuntimeEdge,
  RuntimeFlow,
  RuntimeNode
} from "./types/Workflow.js"

type UnknownRecord = Record<string, unknown>

function asRecord(
  value: unknown,
  path: string
): UnknownRecord {
  if (
    typeof value !== "object" ||
    value === null ||
    Array.isArray(value)
  ) {
    throw new Error(`${path} must be an object`)
  }

  return value as UnknownRecord
}

function readString(
  value: unknown,
  path: string
): string {
  if (typeof value !== "string") {
    throw new Error(`${path} must be a string`)
  }

  return value
}

function readStringArray(
  value: unknown,
  path: string
): string[] | undefined {
  if (value === undefined) {
    return undefined
  }

  if (
    !Array.isArray(value) ||
    value.some(item => typeof item !== "string")
  ) {
    throw new Error(`${path} must be a string array`)
  }

  return value as string[]
}

function toRuntimeNode(
  value: unknown,
  index: number
): RuntimeNode {
  const node = asRecord(value, `flow.nodes[${index}]`)
  const id = readString(node.id, `flow.nodes[${index}].id`)
  const data = asRecord(node.data, `flow.nodes[${index}].data`)
  const name = readString(
    data.name,
    `flow.nodes[${index}].data.name`
  )

  if (name === "startNode") {
    return {
      id,
      data: { name: "startNode" }
    }
  }

  const inputs = asRecord(
    data.inputs,
    `flow.nodes[${index}].data.inputs`
  )

  if (name === "llmNode") {
    const prompt = inputs.prompt
    const tools = readStringArray(
      inputs.tools,
      `flow.nodes[${index}].data.inputs.tools`
    )

    return {
      id,
      data: {
        name: "llmNode",
        inputs: {
          model: readString(
            inputs.model,
            `flow.nodes[${index}].data.inputs.model`
          ),
          // Prompt 可以为空，因为用户输入也会从 StartNode 传进来。
          prompt:
            prompt === undefined
              ? ""
              : readString(
                  prompt,
                  `flow.nodes[${index}].data.inputs.prompt`
                ),
          ...(tools ? { tools } : {})
        }
      }
    }
  }

  if (name === "conditionNode") {
    const operator = readString(
      inputs.operator,
      `flow.nodes[${index}].data.inputs.operator`
    )

    if (
      operator !== "equals" &&
      operator !== "notEquals" &&
      operator !== "contains"
    ) {
      throw new Error(
        `flow.nodes[${index}].data.inputs.operator is invalid`
      )
    }

    return {
      id,
      data: {
        name: "conditionNode",
        inputs: {
          operator,
          value: readString(
            inputs.value,
            `flow.nodes[${index}].data.inputs.value`
          )
        }
      }
    }
  }

  if (name === "endNode") {
    return {
      id,
      data: {
        name: "endNode",
        inputs: {
          input:
            inputs.input === undefined
              ? ""
              : readString(
                  inputs.input,
                  `flow.nodes[${index}].data.inputs.input`
                )
        }
      }
    }
  }

  throw new Error(`Unsupported node type: ${name}`)
}

function toRuntimeEdge(
  value: unknown,
  index: number
): RuntimeEdge {
  const edge = asRecord(value, `flow.edges[${index}]`)
  const sourceHandle = edge.sourceHandle

  return {
    source: readString(
      edge.source,
      `flow.edges[${index}].source`
    ),
    target: readString(
      edge.target,
      `flow.edges[${index}].target`
    ),
    ...(typeof sourceHandle === "string"
      ? { sourceHandle }
      : {})
  }
}

// HTTP 请求体属于不可信数据。在进入 workflowEngine 前，只保留运行时真正需要的字段。
export function toRuntimeFlow(value: unknown): RuntimeFlow {
  const flow = asRecord(value, "flow")

  if (!Array.isArray(flow.nodes)) {
    throw new Error("flow.nodes must be an array")
  }

  if (!Array.isArray(flow.edges)) {
    throw new Error("flow.edges must be an array")
  }

  return {
    nodes: flow.nodes.map(toRuntimeNode),
    edges: flow.edges.map(toRuntimeEdge)
  }
}
