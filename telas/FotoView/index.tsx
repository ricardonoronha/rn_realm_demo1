import { SafeAreaView, StyleSheet, Text, TouchableOpacity, View, Image, StatusBar, Alert } from 'react-native';
import { Camera, CameraType, CameraCapturedPicture } from "expo-camera"
import * as MediaLibrary from "expo-media-library"
import { useEffect, useRef, useState } from 'react';
import * as Permissions from "expo-permissions"
import * as ExpoFs from "expo-file-system";
import { useIsFocused } from '@react-navigation/native';
import uuid from "react-native-uuid";
import { getRealm } from '../../databases/realm';


export default function FotoView({ navigation, route }) {

    console.log("route params", route.params);

    const [temPermissao, setTemPermissao] = useState<boolean | null>(null);
    const [temPermissaoPasta, setTemPermissaoPasta] = useState<boolean | null>(null);
    const dirTrimap = ExpoFs.documentDirectory + "trimap_imagens/";

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

    async function listarArquivos() {
        const permissao = await ExpoFs.StorageAccessFramework.requestDirectoryPermissionsAsync();
        if (permissao.granted) {
            const arquivos = await ExpoFs.StorageAccessFramework.readDirectoryAsync(permissao.directoryUri)

        }
    }

    return (<View style={{ flex: 1, justifyContent: "center", alignContent: "center" }}>
        <Text style={estilos.tituloFoto}>Foto</Text>
        
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
