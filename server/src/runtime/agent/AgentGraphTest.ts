
import assert from "node:assert/strict";
import type { Message } from "../context/Message.js";
import type { Model } from "../model/model.js";
import type { ModelResponse } from "../model/ModelResponse.js";
import type { Tool, ToolDefinition } from "../tool/Tool.js";
import { ToolRegistry } from "../tool/ToolRegistry.js";
import { ToolRunner } from "../tool/ToolRunner.js";
import { createAgentGraph } from "./AgentGraph.js";

// 记录模拟模型收到的每一轮消息，验证工具结果是否传回模型。
const modelInputs: Message[][] = [];

class TestModel implements Model {
    private callCount = 0;

    async invoke(
        messages: Message[],
        _tools: ToolDefinition[]
    ): Promise<ModelResponse> {
        this.callCount++;

        // 保存当前轮输入，避免后续状态变化影响断言。
        modelInputs.push([...messages]);

        if (this.callCount === 1) {
            return {
                type: "tool_calls",
                toolCalls: [
                    {
                        toolCallId: "call-test-1",
                        toolName: "knowledge_search",
                        args: { query: "上海住宿标准" }
                    }
                ]
            };
        }

        // 第二轮必须已经收到工具执行结果。
        const toolMessage = messages.find(
            (message) =>
                message.role === "tool" &&
                message.toolCallId === "call-test-1"
        );

        assert.ok(toolMessage, "第二轮模型输入中应包含工具结果");
        assert.equal(toolMessage.content, "上海住宿标准为每晚600元");
        assert.equal(toolMessage.success, true);

        return {
            type: "text",
            content: "上海住宿标准为每晚600元"
        };
    }
}

const knowledgeTool: Tool = {
    name: "knowledge_search",
    description: "查询测试知识库",
    parameters: {
        type: "object",
        properties: {
            query: { type: "string" }
        },
        required: ["query"]
    },
    async execute(args) {
        assert.equal(args.query, "上海住宿标准");

        return {
            success: true,
            content: "上海住宿标准为每晚600元"
        };
    }
};

async function main() {
    modelInputs.length = 0;

    const registry = new ToolRegistry();
    registry.register(knowledgeTool);

    const toolRunner = new ToolRunner(registry);
    const model = new TestModel();

    const graph = createAgentGraph(
        model,
        registry.getDefinitions(),
        toolRunner,
        ["knowledge_search"]
    );

    const result = await graph.invoke(
        {
            messages: [
                {
                    role: "user",
                    content: "上海住宿标准是多少？"
                }
            ]
        },
        {
            configurable: {
                thread_id: `agent-test-${Date.now()}`
            },
            recursionLimit: 10
        }
    );

    const finalMessage = result.messages.at(-1);

    assert.ok(finalMessage, "应该有最终消息");
    assert.equal(finalMessage.role, "assistant");
    assert.equal(finalMessage.content, "上海住宿标准为每晚600元");

    assert.equal(modelInputs.length, 2, "模型应该恰好调用两次");

    console.log("PASS: 模型调用工具后再次接收工具结果");
    console.log("PASS: Agent 最终返回正确答案");
    console.log("PASS: 模型共调用两次");

// 执行工具失败场景
await testToolFailure();

console.log("\nAgentGraph 集成测试通过。");
    
async function testToolFailure() {
    const modelInputs: Message[][] = [];

    class FailureTestModel implements Model {
        private callCount = 0;

        async invoke(
            messages: Message[],
            _tools: ToolDefinition[]
        ): Promise<ModelResponse> {
            this.callCount++;
            modelInputs.push([...messages]);

            if (this.callCount === 1) {
                return {
                    type: "tool_calls",
                    toolCalls: [{
                        toolCallId: "call-failure-1",
                        toolName: "knowledge_search",
                        args: { query: "上海住宿标准" }
                    }]
                };
            }

            const toolMessage = messages.find(
                message =>
                    message.role === "tool" &&
                    message.toolCallId === "call-failure-1"
            );

            assert.ok(toolMessage, "模型第二轮应该收到工具失败消息");
            assert.equal(toolMessage.success, false);

            if (toolMessage.success === false) {
                assert.equal(toolMessage.errorCode, "INTERNAL_ERROR");
                assert.equal(toolMessage.content, "模拟知识库故障");
            }

            return {
                type: "text",
                content: "查询暂时失败，请稍后再试。"
            };
        }
    }

    const failingTool: Tool = {
        name: "knowledge_search",
        description: "模拟失败的知识库查询",
        parameters: {
            type: "object",
            properties: {
                query: { type: "string" }
            },
            required: ["query"]
        },
        async execute() {
            return {
                success: false,
                content: "模拟知识库故障",
                errorCode: "INTERNAL_ERROR"
            };
        }
    };

    const registry = new ToolRegistry();
    registry.register(failingTool);

    const graph = createAgentGraph(
        new FailureTestModel(),
        registry.getDefinitions(),
        new ToolRunner(registry),
        ["knowledge_search"]
    );

    const result = await graph.invoke(
        {
            messages: [{
                role: "user",
                content: "上海住宿标准是多少？"
            }]
        },
        {
            configurable: {
                thread_id: `agent-failure-test-${Date.now()}`
            },
            recursionLimit: 10
        }
    );

    const finalMessage = result.messages.at(-1);

    assert.ok(finalMessage);
    assert.equal(finalMessage.role, "assistant");
    assert.equal(finalMessage.content, "查询暂时失败，请稍后再试。");
    assert.equal(modelInputs.length, 2);

    console.log("PASS: 工具失败信息传回第二轮模型");
    console.log("PASS: Agent 收到失败信息后正常结束");
}

}

main().catch((error) => {
    console.error("AgentGraph 集成测试失败：", error);
    process.exitCode = 1;
});
