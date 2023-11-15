import { ObjectSchema } from "realm";

export const SubProjetoSchema: ObjectSchema = {
    name: "SubProjeto",
    properties: {
        _id: "string",
        legenda: "string",
        projeto: "string", 
        responsavel: "string"
    },
    primaryKey: "_id"
}