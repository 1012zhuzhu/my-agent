export type Schema =
| StringSchema
| NumberSchema
| BooleanSchema
| ArraySchema
| ObjectSchema

interface BaseSchema {
    description?: string
}

export interface StringSchema extends BaseSchema {
    type: 'string'
}

export interface NumberSchema extends BaseSchema {
    type: 'number'
}

export interface BooleanSchema extends BaseSchema {
    type: 'boolean'
}

export interface ArraySchema extends BaseSchema {
    type: 'array'
    items: Schema
}

export interface ObjectSchema extends BaseSchema {
    type: 'object'
    properties: Record<string, Schema>
    required?: string[]
}

