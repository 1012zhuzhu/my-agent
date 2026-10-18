import express from 'express'
import cors from 'cors'
import 'dotenv/config'
import workflowRoute from './routes/workFlowRoute.js'

const app = express()

const PORT = process.env.PORT || 3000

const allowedOrigins = (
  process.env.FRONTEND_ORIGINS ??
  "http://localhost:5173"
)
  .split(",")
  .map(origin => origin.trim())
  .filter(Boolean)

app.use(cors({
  origin(origin, callback) {
    // 允许非浏览器请求和本地脚本测试；
    // CORS 本身不是 API 访问控制。
    if (!origin || allowedOrigins.includes(origin)) {
      return callback(null, true)
    }

    return callback(new Error("Origin not allowed by CORS"))
  }
}))
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
