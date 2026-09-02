export interface Tool {
    name: string;
    description: string;
    execute(args: unknown): Promise<unknown>;
}