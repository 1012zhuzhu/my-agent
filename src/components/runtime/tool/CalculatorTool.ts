import type { Tool } from "./Tool";

export class CalculatorTool implements Tool{
    name = 'calculator'
    description ='执行算数'
    async executor(args: unknown): Promise<unknown> {
        console.log("结果",args);
        
        return '计算结果'
    }
}