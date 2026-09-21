import type { Model } from "./model";

export class ModelFactory {
    private readonly models = new Map<string,Model>()

    register(
        name: string,
        model: Model
    ): void {
        this.models.set(name,model)
    }

    get(name: string): Model {
        const model = this.models.get(name)

        if(!model){
            const availableModels =
                [...this.models.keys()].join(", ")

            throw new Error(
                `Model "${name}" is not registered. Available models: ${availableModels}`
            )
        }

        return model
    }
}
