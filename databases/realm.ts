import Realm from "realm";
import { TodoSchema } from "./schemas/TodoSchema";
import { FotoSchema } from "./schemas/FotoSchema";
import { SubProjetoSchema } from "./schemas/SubProjetoSchema";
import { ProjetoSchema } from "./schemas/ProjetoSchema";

export async function getRealm() {


    const app = new Realm.App({ id: "devicesync-lkfhh" });
    const credentials = Realm.Credentials.emailPassword({ email: "ricardo.noronha@outlook.com", password: "mgnoronha" })
    try {
        const user = await app.logIn(credentials);
    } catch (err) {
        console.error("Failed to log in", err);
    }


    return await Realm.open({
        path: "demo-realm",
        schema: [TodoSchema, FotoSchema, SubProjetoSchema, ProjetoSchema],
        schemaVersion: 10,
        sync: {
            flexible: true,
            user: app.currentUser,
            initialSubscriptions: {
                update: (subs, realm) => {
                    subs.add(
                        realm.objects("Todo").filtered("projeto = 'novooriente.ce'")
                    );
                }
            },
        }
    });
}



