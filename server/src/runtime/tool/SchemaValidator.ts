import type { ObjectSchema, Schema } from "./Schema.js"
//对于参数的验证要重点看

export type ValidatorResult =
| {
    valid: true
}
| {
    valid: false
    message: string
}

export class SchemaValidator {
    static validate(
        schema: ObjectSchema,
        value: unknown
    ): ValidatorResult {
        return this.validateValue(schema,value,'args')
    }
private static validateValue(
    schema: Schema,
    value: unknown,
    path: string
): ValidatorResult {
    switch (schema.type) {
        case 'string': 
            if(typeof value !== 'string'){
                return {
                    valid: false,
                    message: `${path} should be string`
                }
            }
            return {valid: true}
        
        case 'number':
            if(typeof value !== 'number'){
                return{
                    valid: false,
                    message:`${path} should be number`
                }
            }
            return {valid: true}

        case 'boolean':
            if(typeof value !== 'boolean'){
                return{
                    valid: false,
                    message:`${path} should be boolean`
                }
            }
            return {valid: true}

        case 'array':
            if(!Array.isArray(value)){
                return{
                    valid: false,
                    message:`${path} should be array`
                }
            }
            for(let i=0;i<value.length;i++){
                const result = this.validateValue(
                    schema.items,
                    value[i],
                    `${path}[${i}]`
                )
                if(!result.valid){
                    return result
                }
            }
            return {valid: true}
            
        case 'object':
            return this.validateObject(
                schema,
                value,
                path
            )
        }
    }
    private static validateObject(
        schema: ObjectSchema,
        value: unknown,
        path: string
    ): ValidatorResult {
        if(typeof value !== 'object' || value === null || Array.isArray(value)
        ){
            return {
                valid: false,
                message: `${path} should be object`
            }
        }

        const objectValue = value as Record<string, unknown>

        for(const key of schema.required ?? []) {
            if(!(key in objectValue) || objectValue[key] === undefined){
                return {
                    valid: false,
                    message: `${path}.${key} is required`
                }
            }
        }

        for(const [key, childSchema] of Object.entries(schema.properties)){
            const childValue = objectValue[key]

            if(childValue === undefined){
                continue
            }

            const result = this.validateValue(
                childSchema,
                childValue,
                `${path}.${key}`
            )
            
            if(!result.valid){
                return result
            }
        }
        for (const key of Object.keys(objectValue)) {
            if (!(key in schema.properties)) {
                return {
                valid: false,
                message: `${path}.${key} is not allowed`,
                }
            }
            }
        return {valid: true}
    }
}

