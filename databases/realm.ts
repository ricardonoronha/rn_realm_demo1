import Realm from "realm";
import { TodoSchema } from "./schemas/TodoSchema";

export const getRealm = async () => await Realm.open({
    path: "demo-realm",
    schema: [TodoSchema]
});



