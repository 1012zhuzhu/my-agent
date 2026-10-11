
import assert from "node:assert/strict";
import type { Message } from "../context/Message.js";
import type { ToolDefinition } from "../tool/Tool.js";
import { DeepSeekModel } from "./DeepSeekModel.js";

const model = new DeepSeekModel("test-api-key", "test-model");

const messages: Message[] = [
    {
        role: "user",
        content: "你好"
    }
];

const tools: ToolDefinition[] = [];

const originalFetch = globalThis.fetch;

function mockFetch(body: unknown, status = 200) {
    globalThis.fetch = (async () => {
        return new Response(JSON.stringify(body), {
            status,
            headers: {
                "Content-Type": "application/json"
            }
        });
    }) as typeof fetch;
}

async function runTest(
    name: string,
    test: () => Promise<void>
) {
    try {
        await test();
        console.log(`PASS: ${name}`);
    } catch (error) {
        console.error(`FAIL: ${name}`, error);
        throw error;
    }
}

async function main() {
    try {
        // 1. 正常文本回复
        await runTest("正常文本回复", async () => {
            mockFetch({
                choices: [
                    {
                        message: {
                            content: "你好！"
                        }
                    }
                ]
            });

            const result = await model.invoke(messages, tools);

            assert.deepEqual(result, {
                type: "text",
                content: "你好！"
            });
        });

        // 2. 正常工具调用
        await runTest("正确解析工具调用", async () => {
            mockFetch({
                choices: [
                    {
                        message: {
                            content: null,
                            tool_calls: [
                                {
                                    id: "call-123",
                                    type: "function",
                                    function: {
                                        name: "knowledge_search",
                                        arguments: JSON.stringify({
                                            query: "上海住宿标准"
                                        })
                                    }
                                }
                            ]
                        }
                    }
                ]
            });

            const result = await model.invoke(messages, tools);

            assert.deepEqual(result, {
                type: "tool_calls",
                toolCalls: [
                    {
                        toolCallId: "call-123",
                        toolName: "knowledge_search",
                        args: {
                            query: "上海住宿标准"
                        }
                    }
                ]
            });
        });

        // 3. 模型返回非法 JSON 参数
        await runTest("拒绝非法工具参数 JSON", async () => {
            mockFetch({
                choices: [
                    {
                        message: {
                            content: null,
                            tool_calls: [
                                {
                                    id: "call-456",
                                    type: "function",
                                    function: {
                                        name: "knowledge_search",
                                        arguments: "{invalid-json"
                                    }
                                }
                            ]
                        }
                    }
                ]
            });

            await assert.rejects(
                model.invoke(messages, tools),
                /工具参数不合法/
            );
        });

        // 4. API 返回 HTTP 错误
        await runTest("处理 API HTTP 错误", async () => {
            mockFetch(
                { error: { message: "Unauthorized" } },
                401
            );

            await assert.rejects(
                model.invoke(messages, tools),
                /请求失败.*401/
            );
        });

        // 5. API 响应结构错误
        await runTest("拒绝缺少 choices 的响应", async () => {
            mockFetch({
                error: "invalid response"
            });

            await assert.rejects(
                model.invoke(messages, tools),
                /缺少 choices/
            );
        });

        // 6. 缺少 API Key
        await runTest("拒绝缺少 API Key", async () => {
            const modelWithoutKey = new DeepSeekModel(
                undefined,
                "test-model"
            );

            await assert.rejects(
                modelWithoutKey.invoke(messages, tools),
                /缺少DEEPSEEK_API_KEY/
            );
        });

        console.log("\nDeepSeekModel 测试完成。");
    } finally {
        globalThis.fetch = originalFetch;
    }

    await runTest("拒绝空 choices 数组", async () => {
    mockFetch({ choices: [] });

    await assert.rejects(
        model.invoke(messages, tools),
        /缺少message/
    );
});
}

main().catch(() => {
    process.exitCode = 1;
});
