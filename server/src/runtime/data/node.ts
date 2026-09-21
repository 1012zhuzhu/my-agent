export type StartNodeData = {
    name: 'startNode'
}

export type LLMNodeData = {
    name: 'llmNode'
    inputs: {
        model: string,
        prompt: string,
        tools?: string[] | undefined
    }
}

export type ConditionNodeData = {
    name: 'conditionNode'
    inputs: {
        operator: 'equals' | 'notEquals' | 'contains'
        value: string
    }
}

export type EndNodeData = {
    name: 'endNode'
    inputs: {
        input: string
    }
}

export type StartRuntimeNode = {
  id: string
  data: StartNodeData
}

export type LLMRuntimeNode = {
  id: string
  data: LLMNodeData
}

export type ConditionRuntimeNode = {
  id: string
  data: ConditionNodeData
}

export type EndRuntimeNode = {
  id: string
  data: EndNodeData
}