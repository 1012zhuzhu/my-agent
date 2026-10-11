
import assert from "node:assert/strict";
import { ToolRunner } from "./ToolRunner.js";
import { ToolRegistry } from "./ToolRegistry.js";
import type { Tool } from "./Tool.js";
import type { ObjectSchema } from "./Schema.js";
import type { ToolErrorCode } from "./ToolResult.js";

// 1. 定义测试工具的参数规则
const parameters: ObjectSchema = {
    type: "object",
    properties: {
        city: { type: "string" },
        days: { type: "number" },
    },
    required: ["city", "days"],
};

// 2. 创建模拟工具
function createTool(
    execute: Tool["execute"] = async (args) => ({
        success: true,
        content: `查询城市：${String(args.city)}`,
    }),
): Tool {
    return {
        name: "weather",
        description: "查询天气",
        parameters,
        execute,
    };
}

// 3. 创建测试环境
const registry = new ToolRegistry();
registry.register(createTool());

const runner = new ToolRunner(registry);
const allowedTools = ["weather"];

function expectFailure(
    result: Awaited<ReturnType<ToolRunner["run"]>>,
    expectedCode: ToolErrorCode,
) {
    assert.equal(result.success, false);

    if (!result.success) {
        assert.equal(result.errorCode, expectedCode);
    }
}

// 4. 执行测试
async function main() {
    // 测试一：正常调用
    const success = await runner.run(
        "weather",
        { city: "Shanghai", days: 3 },
        allowedTools,
    );

    assert.equal(success.success, true);
    assert.equal(success.content, "查询城市：Shanghai");
    console.log("PASS: 正常调用");

    // 测试二：参数类型错误
    const invalidArgs = await runner.run(
        "weather",
        { city: "Shanghai", days: "3" },
        allowedTools,
    );

    expectFailure(invalidArgs, "INVALID_ARGUMENT");
    console.log("PASS: 参数类型错误");

    // 测试三：工具不允许调用
    const notAllowed = await runner.run(
        "weather",
        { city: "Shanghai", days: 3 },
        [],
    );

    expectFailure(notAllowed, "TOOL_NOT_ALLOWED");
    console.log("PASS: 工具不允许调用");

    // 测试四：工具没有注册
    // 注意：必须允许调用，否则会先返回 TOOL_NOT_ALLOWED
    const notFound = await runner.run(
        "unknown",
        {},
        ["unknown"],
    );

    expectFailure(notFound, "TOOL_NOT_FOUND");
    console.log("PASS: 工具未注册");

    // 测试五：工具执行时抛出异常
    const throwingRegistry = new ToolRegistry();

    throwingRegistry.register(
        createTool(async () => {
            throw new Error("模拟工具执行失败");
        }),
    );

    const throwingRunner = new ToolRunner(throwingRegistry);

    const originalConsoleError = console.error;
    let internalError;

    try {
        // 避免预期中的异常日志干扰测试输出
        console.error = () => {};

        internalError = await throwingRunner.run(
            "weather",
            { city: "Shanghai", days: 3 },
            allowedTools,
        );
    } finally {
        console.error = originalConsoleError;
    }

    expectFailure(internalError!, "INTERNAL_ERROR");
    console.log("PASS: 工具异常被捕获");

    // 测试六：拒绝 NaN
    const nanResult = await runner.run(
        "weather",
        { city: "Shanghai", days: NaN },
        allowedTools,
    );

    expectFailure(nanResult, "INVALID_ARGUMENT");
    console.log("PASS: 拒绝 NaN");

    // 测试七：拒绝 Infinity
    const infinityResult = await runner.run(
        "weather",
        { city: "Shanghai", days: Infinity },
        allowedTools,
    );

    expectFailure(infinityResult, "INVALID_ARGUMENT");
    console.log("PASS: 拒绝 Infinity");

    console.log("\n全部 7 项测试通过。");
}

main().catch((error) => {
    console.error("测试失败：", error);
    process.exitCode = 1;
});
