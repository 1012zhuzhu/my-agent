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

        const obj = args as Record<string,unknown>

        schema.required?.forEach(key => {
            if(!(key in obj)){
                throw new Error(
                 `Missing ${key}`
                ) 
            }
        })

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