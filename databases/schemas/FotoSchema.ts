import { ObjectSchema } from "realm";

export const FotoSchema: ObjectSchema = {
    name: "Foto",
    properties: {
        _id: "string",
        task_id: "string",
        uri: "string",
        extensao: "string", 
        dataUpload: "date?",
        deviceId: "string",
        projeto: "string",
        tipoFoto: "string",
        usoEspecifico: "string",
        numero: "string",
        origemNumero: "int",
        complemento: "string",
        fns: "string",
        cagece: "string",
        enel: "string",
        qtdePavimentos: "int",
        obs: "string",
        revisar: "bool",
        latitude: "float",
        longitude: "float",
        precisao: "float",
    }, 
    primaryKey: "_id"
}