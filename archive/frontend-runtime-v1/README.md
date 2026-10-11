# Frontend Runtime V1

## 归档说明

这是 ControlAgent 最初实现的前端工作流运行时，归档于 2026-09-23。

当时工作流调度、模型选择和工具执行都运行在浏览器端。后来为了保护模型 API Key、集中执行工具，并为服务端持久化和扩展做准备，正式 Runtime 被迁移到了服务端。

## 原始位置

- `src/components/runtime`
- `src/utils/historyUtils.ts`

归档时保留了原来的 `src` 目录层级，因此旧代码之间的相对导入关系仍然清晰可查。归档过程中没有修改这些源文件的内容。

## 当前正式实现

当前参与实际运行的代码位于：

- 前端画布与请求：`src`
- 服务端工作流 Runtime：`server/src/runtime`
- 服务端运行接口：`server/src/routes/workFlowRoute.ts`

## 使用约定

本目录只用于学习、回顾和记录项目演进，不应再被当前前端代码导入，也不参与根目录 `tsconfig.app.json` 的编译。

旧版的核心流程是：

```text
前端画布 -> 前端 workflowEngine -> 前端 LLMExecutor
         -> MockModel -> ToolRunner -> 前端执行结果
```

当前流程是：

```text
前端画布 -> POST /api/workflow/run -> 服务端 workflowEngine
         -> LLMExecutor -> DeepSeek/Mock -> ToolRunner -> 返回前端
```

这份代码记录了项目从“浏览器内执行工作流”迁移到“服务端安全执行工作流”的第一阶段。
