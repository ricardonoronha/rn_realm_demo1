import { SafeAreaView, StyleSheet, Text, TouchableOpacity, View, Image, StatusBar, Alert, Button, FlatList } from 'react-native';
import { Camera, CameraType, CameraCapturedPicture } from "expo-camera"
import * as MediaLibrary from "expo-media-library"
import { useCallback, useEffect, useRef, useState } from 'react';
import * as Permissions from "expo-permissions"
import * as ExpoFs from "expo-file-system";
import { useIsFocused } from '@react-navigation/native';
import uuid from "react-native-uuid";
import { getRealm } from '../../databases/realm';
import AWS from "aws-sdk";
import { decode } from "base64-arraybuffer";
import { getUniqueId } from 'react-native-device-info';
import { useRealm } from '@realm/react';




AWS.config.update({
    accessKeyId: "",
    secretAccessKey: "",
    region: "sa-east-1"
});

const awsS3 = new AWS.S3();


const uploadFileToS3 = (bucketName, fileName, filePath) => {

    const params = {
        Bucket: bucketName,
        Key: fileName,
        Body: filePath
    };

    return awsS3.upload(params).promise();
}

export default function FotoView({ navigation, route }) {




    console.log("route params", route.params);

    const task = route.params.item;

    console.log("task", task);

    const [foto, setFoto] = useState([]);
    const [carregando, setCarregando] = useState("Carregando...");
    const [temPermissao, setTemPermissao] = useState<boolean | null>(null);
    const [temPermissaoPasta, setTemPermissaoPasta] = useState<boolean | null>(null);
    const dirTrimap = ExpoFs.documentDirectory + "trimap_imagens/";
    const isFocused = useIsFocused();

    const realm = useRealm();

    const refreshData = useCallback(async () => {

        const listaFotos = realm.objects("Foto").filtered(`task_id = '${task._id}'`).toJSON();
        const listaFotosFinal = [];

        for (let i = 0; i < listaFotos.length; i++) {

            const fotoDb = listaFotos[i];

            console.log("fotoDb", fotoDb);

            try {
                const fileInfo = await ExpoFs.getInfoAsync(fotoDb.uri);
                console.log("fileInfo", fileInfo);

                const file = await ExpoFs.readAsStringAsync(fileInfo.uri, { encoding: ExpoFs.EncodingType.Base64 });

                listaFotosFinal.push({
                    ...fotoDb,
                    base64: file
                });
            }
            catch (error) {
                console.log("error abrir arquivo", error);
            }
        }


        setFoto(listaFotosFinal)

        setCarregando("");

    }, [task, realm]);

    useEffect(() => {

        refreshData();

    }, [isFocused, task._id])

    async function listarArquivos() {
        const permissao = await ExpoFs.StorageAccessFramework.requestDirectoryPermissionsAsync();
        if (permissao.granted) {
            const arquivos = await ExpoFs.StorageAccessFramework.readDirectoryAsync(permissao.directoryUri)

        }
    }

    async function enviarS3() {
        setCarregando("Enviando para S3...");

        for (let i = 0; i < foto.length; i++) {
            const fotoEnviar = foto[i];
            const arrayBuffer = decode(fotoEnviar.base64);
            if (foto) {
                await uploadFileToS3("app-tablet-trimap", `${fotoEnviar._id}.${fotoEnviar.extensao}`, arrayBuffer);
            }
        }
        setCarregando("");
    }

    if (carregando !== "") {
        return <View style={{ justifyContent: "space-around", alignItems: "center", height: "100%" }}>
            <Text>{carregando}</Text>
        </View>
    }


    if (!foto) {
        return <View style={{ justifyContent: "space-around", alignItems: "center", height: "100%" }}>
            <Text>Sem foto</Text>
        </View>
    }

    function RenderItem({ item }) {
        let uploadEm;

        if (item.dataUpload) {
            uploadEm = item.dataUpload.toLocaleString().substring(0, 16);
        }
        console.log("keys=====", Object.keys(item));
        console.log("======item", item._id)
        return (<View style={{ flex: 1, justifyContent: "center", alignContent: "center", marginLeft: 10, display: 'flex', flexDirection: "row", margin: 10, backgroundColor: "lightgray", padding: 10, }}>
            {item && <Image source={{ uri: `data:image/${item.extensao};base64,${item.base64}` }} width={100} height={100} style={{ borderRadius: 10 }} />}
            <View style={{ flex: 1, marginLeft: 10 }}>
                <Text>{item._id}.{item.extensao}</Text>
                {uploadEm ? <Text>Upload em: {uploadEm}</Text> : <Text>Upload PENDENTE</Text>}

            </View>
        </View>
        );
    }

    function RenderFooter() {
        return <View style={{ alignContent: "center", justifyContent: "center", alignItems: "center" }}>
            <Button title="   Enviar S3   " onPress={enviarS3} />
        </View>

    }

    console.log("itens foto", foto.map(x => x._id));

    return (
        <View>
            <FlatList data={foto} renderItem={item => RenderItem(item)} keyExtractor={item => item._id} ListFooterComponent={RenderFooter} />
        </View>

    );
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
