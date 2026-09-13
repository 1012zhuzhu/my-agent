import { type Schema } from './Tool';
export class SchemaValidator{
    static Validate(
        schema: Schema,
        args: unknown,
    ){
        if(
            typeof args !== "object" || args === null
        ) {
            throw new Error('args must be object')
        }
//TypeScript 类型只在编译阶段有用，程序真正运行后，外部传进来的数据依然可能是错的。
        const obj = args as Record<string,unknown>

        schema.required?.forEach(key => {
            if(!(key in obj)){
                throw new Error(
                 `Missing ${key}`
                ) 
            }
        })
//args 用 unknown 是因为不同工具参数结构不同，而且模型返回的数据不能直接信任；SchemaValidator 负责在运行时根据当前 Tool 的 Schema 校验参数结构和字段类型，确保合法后才执行工具。
        Object.entries(
            schema.properties
        ).forEach(([key,config]) => {
            const value = obj[key]

            if(
                value != undefined && typeof value !== config.type
            ){
                 throw new Error(
                 `${key} must be ${config.type}`
                )
            }
        })

        return true
    }
}