import { ObjectSchema } from "realm";

export const TodoSchema: ObjectSchema = {
    name: "Todo",
    properties: {
        _id: "string",
        projeto: "string",
        subprojeto_id: "string",
        responsavel: "string",
        titulo: "string",
        descricao: "string"
    }, 
    primaryKey: "_id"
}