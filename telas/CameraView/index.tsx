import { SafeAreaView, StyleSheet, Text, TouchableOpacity, View, Image, StatusBar, Alert } from 'react-native';
import { Camera, CameraType, CameraCapturedPicture } from "expo-camera"
import * as MediaLibrary from "expo-media-library"
import { useEffect, useRef, useState } from 'react';
import * as Permissions from "expo-permissions"
import * as ExpoFs from "expo-file-system";
import { useIsFocused } from '@react-navigation/native';
import uuid from "react-native-uuid";
import { getRealm } from '../../databases/realm';
import { getUniqueId } from 'react-native-device-info';


export default function CameraView({ navigation, route }) {

    const { task } = route.params;
    console.log("task foto", task);
    console.log("route params", route.params);

    const dirTrimap = ExpoFs.documentDirectory + "trimap_imagens/";

    console.log("diretorio dirTrimap", dirTrimap);


    const isFocused = useIsFocused();

    const [tipoCamera, setTipoCamera] = useState<CameraType>(CameraType.back);
    const [temPermissao, setTemPermissao] = useState<boolean | null>(null);
    const [temPermissaoPasta, setTemPermissaoPasta] = useState<boolean | null>(null);
    const [permissaoPasta, setPermissaoPasta] = useState<ExpoFs.FileSystemRequestDirectoryPermissionsResult | null>(null);
    const [foto, setFoto] = useState<CameraCapturedPicture | null>(null)
    const cameraRef = useRef<Camera>(null);
    const [arquivos, setArquivos] = useState<string[]>([]);




    useEffect(() => {



        (async () => {
            const { status } = await Camera.requestCameraPermissionsAsync();
            console.log("status", status);
            setTemPermissao(status === "granted");
        })();

        (async () => {

            const infoDirTrimap = await ExpoFs.getInfoAsync(dirTrimap);

            if (!infoDirTrimap.exists) {
                try {
                    await ExpoFs.makeDirectoryAsync(dirTrimap, { intermediates: true });
                }
                catch (error) {
                    console.log("error ao criar diretório", error);
                }
            }
            else {
                // const arquivosSearch = await ExpoFs.readDirectoryAsync(dirTrimap);

                // const maiorId: Number = arquivosSearch
                //     .map(arq => {
                //         const fileName = arq.split("/").pop();
                //         console.log(fileName);
                //         return fileName;
                //     })
                //     .map(fileName => {
                //         console.log(fileName);
                //         return 0;
                //         // return new Number(fileName?.substring(0, 4));
                //     })
                //     .reduce(function (a, b) {
                //         return Math.max(a, b);
                //     }, 1);

                // setFotoCorrente(maiorId);
            }





        })();
    }, [temPermissaoPasta])

    useEffect(() => {

        (async () => {
            const realm = await getRealm();
            console.log(realm.objects("Foto").toJSON());
        })();

    }, [isFocused]);

    if (temPermissao === null) {
        return <View style={estilos.container}>
            <Text>Permissão não definida</Text>
        </View>
    }

    if (temPermissao === false) {
        return <View style={estilos.container}>
            <Text>Você não tem permissão!</Text>
        </View>
    }



    async function obterFoto() {
        if (cameraRef) {
            const foto = await cameraRef.current?.takePictureAsync();
            if (foto) {
                setFoto(foto);
            }
        }
    }

    async function listarFotos() {
        const infoDir = await ExpoFs.readDirectoryAsync(dirTrimap);
        if (infoDir.length === 0) {
            console.log("Diretório Trimap vazio");
        }
        else {
            console.log("Listando arquivos diretorio Trimap...");
            infoDir.forEach(x => console.log(x));
        }

    }

    async function base64Foto() {

        const realm = await getRealm();
        try {

            const fotoDb = realm
                .objects("Foto")
                .filtered(`_id = 'fa4f511c-3e68-41c1-9eda-1fae34c2862d'`)
                .toJSON()[0];

            console.log("fotoDb ==> ", fotoDb);

            const base64Img = await ExpoFs.readAsStringAsync(fotoDb.uri as string, { encoding: ExpoFs.EncodingType.Base64 });

            // console.log("base64Img ==> ", `data:image/jpeg;base64,${base64Img}`);

            const kb = Math.ceil(((base64Img.length * 6) / 8) / 1000); // 426 kb
            console.log(`size file in base64 ==> ${kb}kb`);
        }
        catch (error) {
            console.log(error);
        }
        finally {
            realm.close();
        }

    }

    async function salvarFoto() {
        if (foto) {

            const novoFotoId = uuid.v4();

            const fotoUriStr = foto?.uri.toString()
            console.log("fotoUriStr", fotoUriStr);
            const extensaoImg = fotoUriStr?.split(".").pop();
            console.log("extensão foto", extensaoImg);

            const uriNovoArquivo = `${dirTrimap}/${novoFotoId}.${extensaoImg}`;

            await ExpoFs.copyAsync({ from: foto.uri, to: uriNovoArquivo });

            const deviceId = await getUniqueId();

            const realm = await getRealm();

            try {
                realm.write(() => {
                    realm.create("Foto", {
                        _id: novoFotoId,
                        task_id: task._id,
                        extensao: extensaoImg,
                        uri: uriNovoArquivo,
                        deviceId: deviceId
                    });
                })


            }
            catch (error) {
                console.log("Erro ao salvar foto", error);
            }
            finally {
                realm.close();
            }





            await listarFotos();





        }
    }

    async function listarArquivos() {
        if (foto) {
            console.log("foto disponivel", foto);
            const permissao = await ExpoFs.StorageAccessFramework.requestDirectoryPermissionsAsync();
            if (permissao.granted) {
                const arquivos = await ExpoFs.StorageAccessFramework.readDirectoryAsync(permissao.directoryUri)
                setArquivos(arquivos);
            }
        }
    }

    async function voltar() {
        setFoto(null);
    }

    if (foto) {
        console.log(foto);
        return <View style={{ flex: 1, justifyContent: "center", alignContent: "center" }}>
            <Text style={estilos.tituloFoto}>Foto</Text>
            <Image source={foto} style={estilos.fotoPreview} />
            <TouchableOpacity onPress={voltar} style={estilos.voltar}>
                <Text style={{ color: "white", padding: 10, textAlign: "center", fontSize: 19 }}>Voltar</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={salvarFoto} style={estilos.voltar}>
                <Text style={{ color: "white", padding: 10, textAlign: "center", fontSize: 19 }}>Salvar</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={listarFotos} style={estilos.voltar}>
                <Text style={{ color: "white", padding: 10, textAlign: "center", fontSize: 19 }}>Listar</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={base64Foto} style={estilos.voltar}>
                <Text style={{ color: "white", padding: 10, textAlign: "center", fontSize: 19 }}>base64</Text>
            </TouchableOpacity>
        </View>
    }
    else {
        if (isFocused) {
            return <Camera type={tipoCamera} style={estilos.camera} ref={cameraRef} >
                <TouchableOpacity style={estilos.obterFoto} onPress={obterFoto}>
                    <View />
                </TouchableOpacity>
            </Camera>
        }

        return <Text>Selecione a tela</Text>

    }
}

const estilos = StyleSheet.create({
    container: {
        flex: 1,
        flexDirection: "row",
        justifyContent: 'center'
    },
    camera: {
        flex: 1,
        alignItems: "center",
        justifyContent: "flex-end"
    },
    obterFoto: {
        backgroundColor: "transparent",
        height: 75,
        width: 75,
        borderRadius: 75 / 2,
        marginBottom: 70,
        borderWidth: 5,
        borderColor: "red"
    },
    voltar: {
        backgroundColor: "blue",
        padding: 5,
        margin: 10,
        borderRadius: 10,
        textAlign: "center",
        borderWidth: 5,
        borderColor: "blue",
        flex: 1
    },
    foto: {
        flex: 1,
        width: null,
        height: null
    },
    fotoPreview: {
        margin: 10,
        flex: 9,
        width: null,
        height: null
    },
    tituloFoto: {
        margin: 15,
        fontSize: 24,
        lineHeight: 34,
        fontWeight: "bold",
        textAlign: "center"
    }

});
