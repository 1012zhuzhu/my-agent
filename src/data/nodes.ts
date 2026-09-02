import type { NodeDefinition } from "../type";

export const NODE_DEFINITION: NodeDefinition[] = [
    {
        name:'startNode',
        label: '开始',
        icon: 'Play',
        color: '#7EE787',
        inputs: [],
        outputs:[{name:'output', label: '输出'}]
    },
    {
        name: 'llmNode',
        label: 'LLM模型',
        icon: 'Bot',
        color: '#FFB84D',
        inputs: [
            {
                name: 'model',
                label: '模型',
                type: 'dropdown',
                optional: false,
                options: [
                    {
                        name: 'mock',
                        label: 'Mock LLM'
                    }
                ],
                default: 'mock'
            },
            {
                name: 'prompt',
                label: 'Prompt',
                type: 'string',
                optional: false,
                options: []
            }
        ],
        outputs: [
            {
                name: 'output',
                label: '输出'
            }
        ]
    },
    {
        name:'coditionNode',
        label:'条件分支',
        icon:'Branching',
        color:'#F472B6',
        inputs: [
            {
                name: 'expression', label: '表达式', type: 'code', optional: false,
                options: []
            },
        ],
        outputs:[
            {name: 'true',label: '是'},
            {name: 'false',label: '否'}
        ]
    },
    {
        name:'endNode',
        label: '结束',
        icon: 'Stop',
        color: '#A78BFA',
        inputs: [
            {
                name: 'input', label: '输入', type: 'string', optional: false,
                options: []
            }
        ],
        outputs:[]
    },
]