import type { Tool } from "./Tool.js"
import type { ToolResult } from "./ToolResult.js"

type GeocodingResponse = {
  results?: Array<{
    name: string
    latitude: number
    longitude: number
    country?: string
    admin1?: string
    timezone?: string
  }>
}

type WeatherResponse = {
  current?: {
    time: string
    temperature_2m: number
    apparent_temperature: number
    relative_humidity_2m: number
    weather_code: number
    wind_speed_10m: number
  }
}

export class WeatherTool implements Tool {
  name = "weather"

  description =
    "查询指定城市的实时天气，包括天气状况、气温、体感温度、湿度和风速"

  parameters = {
    type: "object" as const,

    properties: {
      city: {
        type: "string" as const,
        description: "需要查询天气的城市，例如：上海、北京、东京"
      }
    },

    required: ["city"]
  }

  async execute(
    args: Record<string, unknown>
  ): Promise<ToolResult> {
    const city =
      typeof args.city === "string"
        ? args.city.trim()
        : ""

    if (!city) {
      return {
        success: false,
        content: "city 必须是非空字符串",
        errorCode: "INVALID_ARGUMENT"
      }
    }

    try {
      // 1. 城市名 → 经纬度
      const geoUrl = new URL(
        "https://geocoding-api.open-meteo.com/v1/search"
      )

      geoUrl.searchParams.set("name", city)
      geoUrl.searchParams.set("count", "1")
      geoUrl.searchParams.set("language", "zh")
      geoUrl.searchParams.set("format", "json")

      const geoResponse = await fetch(
        geoUrl,
        {
          signal: AbortSignal.timeout(8000)
        }
      )

      if (!geoResponse.ok) {
        throw new Error(
          `Geocoding request failed: ${geoResponse.status}`
        )
      }

      const geoData =
        await geoResponse.json() as GeocodingResponse

      const location =
        geoData.results?.[0]

      if (!location) {
        return {
          success: false,
          content: `没有找到城市：${city}`,
          errorCode: "INVALID_ARGUMENT"
        }
      }

      // 2. 经纬度 → 当前天气
      const weatherUrl = new URL(
        "https://api.open-meteo.com/v1/forecast"
      )

      weatherUrl.searchParams.set(
        "latitude",
        String(location.latitude)
      )

      weatherUrl.searchParams.set(
        "longitude",
        String(location.longitude)
      )

      weatherUrl.searchParams.set(
        "current",
        [
          "temperature_2m",
          "apparent_temperature",
          "relative_humidity_2m",
          "weather_code",
          "wind_speed_10m"
        ].join(",")
      )

      weatherUrl.searchParams.set(
        "timezone",
        location.timezone ?? "auto"
      )

      const weatherResponse = await fetch(
        weatherUrl,
        {
          signal: AbortSignal.timeout(8000)
        }
      )

      if (!weatherResponse.ok) {
        throw new Error(
          `Weather request failed: ${weatherResponse.status}`
        )
      }

      const weatherData =
        await weatherResponse.json() as WeatherResponse

      const current =
        weatherData.current

      if (!current) {
        throw new Error(
          "Weather API returned no current weather"
        )
      }

      const weather =
        this.getWeatherDescription(
          current.weather_code
        )

      return {
        success: true,

        content:
          `${location.name}当前天气${weather}，` +
          `气温${current.temperature_2m}°C，` +
          `体感温度${current.apparent_temperature}°C，` +
          `湿度${current.relative_humidity_2m}% ，` +
          `风速${current.wind_speed_10m}km/h。`,

        data: {
          city: location.name,
          country: location.country,
          admin1: location.admin1,

          latitude: location.latitude,
          longitude: location.longitude,

          weather,
          temperature: current.temperature_2m,
          apparentTemperature:
            current.apparent_temperature,
          humidity:
            current.relative_humidity_2m,
          windSpeed:
            current.wind_speed_10m,
          time:
            current.time
        }
      }
    } catch (error) {
      if (
        error instanceof Error &&
        error.name === "TimeoutError"
      ) {
        return {
          success: false,
          content: "天气服务请求超时",
          errorCode: "TIMEOUT"
        }
      }

      console.error(
        "[WeatherTool] error:",
        error
      )

      return {
        success: false,
        content: "天气服务暂时不可用",
        errorCode: "INTERNAL_ERROR"
      }
    }
  }

  private getWeatherDescription(
    code: number
  ): string {
    if (code === 0) return "晴"

    if (code === 1) return "晴间多云"
    if (code === 2) return "多云"
    if (code === 3) return "阴"

    if ([45, 48].includes(code))
      return "雾"

    if ([51, 53, 55].includes(code))
      return "毛毛雨"

    if ([56, 57].includes(code))
      return "冻毛毛雨"

    if ([61, 63, 65].includes(code))
      return "雨"

    if ([66, 67].includes(code))
      return "冻雨"

    if ([71, 73, 75, 77].includes(code))
      return "雪"

    if ([80, 81, 82].includes(code))
      return "阵雨"

    if ([85, 86].includes(code))
      return "阵雪"

    if (code === 95)
      return "雷暴"

    if ([96, 99].includes(code))
      return "雷暴伴冰雹"

    return "未知天气"
  }
}