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
            },
            {
                name: 'tools',
                label: '可用的工具',
                type: 'dropdown',
                optional: true,
                options: [
                    { name: 'calculator', label: '计算器'},
                ],
                default: [],
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
        name:'conditionNode',
        label:'条件分支',
        icon:'Branching',
        color:'#F472B6',
        inputs: [
        {   
            name: 'operator',
            label: '判断方式',
            type: 'dropdown',
            optional: false,
            options: [
            { name: 'equals', label: '等于' },
            { name: 'notEquals', label: '不等于' },
            { name: 'contains', label: '包含' },
            ],
            default: 'equals',
        },
        {
            name: 'value',
            label: '比较值',
            type: 'string',
            optional: false,
            options: [],
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
