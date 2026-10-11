export type WorkflowErrorCode =
  | "MISSING_START_NODE"
  | "CURRENT_NODE_NOT_FOUND"
  | "EXECUTOR_NOT_FOUND"
  | "TARGET_NODE_NOT_FOUND"
  | "OUTGOING_EDGE_NOT_FOUND"
  | "MAX_STEPS_EXCEEDED"

export class WorkflowError extends Error {
  public readonly code: WorkflowErrorCode

  constructor(
    code: WorkflowErrorCode,
    message: string,
  ) {
    super(message)
    this.code = code
    this.name = "WorkflowError"
  }
}
