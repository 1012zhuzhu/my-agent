import { Router } from 'express'
import { workflowEngine } from '../../../src/components/runtime/executors/workflowEngine';
import { WorkflowError } from '../runtime/error/WorkflowError.js';

const router = Router()
const engine = new workflowEngine()

router.post('/run',async(req,res) => {
    try {
        const flow = req.body
        const result = await engine.run(flow)

        return res.json({
            success: true,
            output: result
        })
    }catch(error){
      if(error instanceof WorkflowError){
        return res.status(400).json({
            success: false,
            errorCode: error.code,
            message: error.message
        })
      }
      return res.status(500).json({
        success: false,
        errorCode: 'INTERNAL_ERROR',
        message: 'Internal server error'
    })
    }
})

export default router