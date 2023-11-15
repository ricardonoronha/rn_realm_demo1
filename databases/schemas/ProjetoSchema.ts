import { ObjectSchema } from "realm";

export const ProjetoSchema: ObjectSchema = {
    name: "Projeto",
    properties: {
        _id: "string",
        nome: "string"
    }, 
    primaryKey: "_id"
}