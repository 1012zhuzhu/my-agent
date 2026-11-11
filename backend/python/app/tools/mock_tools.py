# app/tools/mock_tools.py

from app.schemas.tooldefinition import Tool


async def get_weather(args: dict):
    city = args["city"]
    return {
        "city": city,
        "weather": "晴天",
        "temperature": 25
    }

weather_tool = Tool(
    name="weather",
    description="查询城市天气",
    parameters={
        "type": "object",
        "properties": {
            "city": {
                "type": "string",
                "description": "要查询天气的城市"
            }
        },
        "required": ["city"]
    },
    execute=get_weather
)