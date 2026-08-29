export interface NodeExecutionResult {
    output?: unknown
    nextHandle?: string
}
export class ExecutionContext {
  private readonly nodeOutPuts = new Map<string, unknown>()
  private readonly variable = new Map<string, unknown>()

  setNodeOutPuts(nodeId:string,output:unknown){
    this.nodeOutPuts.set(nodeId,output)
  }
  getNodeOutPuts(nodeId: string){
    return this.nodeOutPuts.get(nodeId)
  }
  setVariable(name:string,output:unknown){
    this.variable.set(name,output)
  }
  getVariable(name:string){
    return this.variable.get(name)
  }
  getAllNodeOutPuts(){
    return Object.fromEntries(this.nodeOutPuts)
  }
  getAllVariable(){
    return Object.fromEntries(this.variable)
  }
}
