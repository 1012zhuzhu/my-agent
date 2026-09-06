import type { Schema, Tool } from "./Tool";

export class CalculatorTool implements Tool{
    name = 'calculator'
    description ='执行算数'
    parameters: Schema = {
        type: 'object',
        properties: {
            expression: {
                type: 'string',
                description: '需要计算的算术表达式'
            }
        }
    }

    async execute(args: unknown): Promise<unknown> {
        console.log("结果",args);
        
        return '计算结果'
    }
}
