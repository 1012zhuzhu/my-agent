export interface Model {
    invoke(prompt: string): Promise<string>
}