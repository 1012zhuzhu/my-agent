import express from 'express'
import cors from 'cors'
import 'dotenv/config'
import workflowRoute from './routes/workFlowRoute.js'

const app = express()

const PORT = process.env.PORT || 3000

app.use(cors())
app.use(express.json())
app.use('/api/workflow',workflowRoute)

app.get("/api/health", (_req, res) => {
  res.json({
    success: true,
    message: "myagent server is running"
  })
})

app.listen(PORT,() => {
    console.log(`server running at http://localhost:${PORT}`)
})
