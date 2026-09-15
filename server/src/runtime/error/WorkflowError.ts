export type workflowErrorCode = 
| 'MISSING_START_NODE'
| 'EXECUTOR_NOT_FOUND'
| 'TAEGT_NODE_NOT_FOUND'
| 'OUTGONING_EDGE_NOT'
| 'MAX_STEPS_EXCEEDED'

export class WorkflowError extends Error {
    constructor(
        public readonly code: workflowErrorCode,
        message: string,
    ) {
        super(message)
        this.name = 'workflowError'
    }
}