import type { Model } from "./Model";
import type { ModelConfig } from "./ModelCofig";
import { MockModel } from "./MockModel";

export class ModelFactory {
    static create(config: ModelConfig): Model {
        if (config.provider === "mock") {
            return new MockModel();
        }

        throw new Error(
            `Unsupported model provider: ${config.provider}`
        );
    }
}