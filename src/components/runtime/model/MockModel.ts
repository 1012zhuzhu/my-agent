import type { Model } from "./Model";

export class MockModel implements Model{
  async invoke(prompt:string): Promise<string> {
    console.log('mock收到',prompt);
    return`[MockLLM] ${prompt}`
  }
}
