import Realm from "realm";
import { TodoSchema } from "./schemas/TodoSchema";
import { FotoSchema } from "./schemas/FotoSchema";

export const getRealm = async () => await Realm.open({
    path: "demo-realm",
    schema: [TodoSchema, FotoSchema],
    schemaVersion: 5
});



