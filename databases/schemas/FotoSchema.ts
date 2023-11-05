import { ObjectSchema } from "realm";

export const FotoSchema: ObjectSchema = {
    name: "Foto",
    properties: {
        _id: "string",
        task_id: "string",
        uri: "string",
        extensao: "string", 
        dataUpload: "date?"
    }, 
    primaryKey: "_id"
}