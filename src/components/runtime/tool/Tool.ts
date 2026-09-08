export interface Tool {
    name: string;
    description: string;
    parameters: Schema;
    execute(args: unknown): Promise<unknown>;
}
export interface ToolDefintion {
    name: string;
    description: string;
    parameters: Schema
}
export interface Schema {
    type:'object';
    properties:{
        [key: string] : {
            type: string;
            description?: string
        }
    }

    required?: string[];
}
