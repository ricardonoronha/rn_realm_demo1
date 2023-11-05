import { ObjectSchema } from "realm";

export const TodoSchema: ObjectSchema = {
    name: "Todo",
    properties: {
        _id: "string",
        titulo: "string",
        descricao: "string"
    }, 
    primaryKey: "_id"
}