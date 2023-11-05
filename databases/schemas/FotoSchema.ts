import { ObjectSchema } from "realm";

export const FotoSchema: ObjectSchema = {
    name: "Foto",
    properties: {
        _id: "string",
        task_id: "string",
        nomeArquivo: "string",
        uri: "string",
        base64: "string"
    }, 
    primaryKey: "_id"
}