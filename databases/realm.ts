import Realm from "realm";
import { TodoSchema } from "./schemas/TodoSchema";
import { FotoSchema } from "./schemas/FotoSchema";

export const getRealm = async () => await Realm.open({
    path: "demo-realm",
    schema: [TodoSchema, FotoSchema],
    schemaVersion: 7,
    onMigration: (oldRealm, newRealm) => {
        if (oldRealm.schemaVersion < 7) {
            const fotos = newRealm.objects("Foto");
            for (const objectIndex in fotos) {
                const newObject = fotos[objectIndex];
                newObject.deviceId = "";
            }
        }

    }
});



