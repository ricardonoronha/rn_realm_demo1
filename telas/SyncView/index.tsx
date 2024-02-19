import React, { useState, useEffect, useCallback } from 'react';
import { SafeAreaView, StyleSheet, Text, TouchableOpacity, View, Image, StatusBar, Alert, FlatList } from 'react-native';
import { useIsFocused } from '@react-navigation/native';
import uuid from "react-native-uuid";
import { getRealm } from '../../databases/realm';
import { getUniqueId } from 'react-native-device-info';
import AWS from "aws-sdk"
import { decode } from "base64-arraybuffer";
import * as ExpoFs from "expo-file-system";
import { useRealm } from '@realm/react';



AWS.config.update({
    accessKeyId: "",
    secretAccessKey: "",
    region: ""
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



export default function SyncView({ navigation }) {

    const [carregando, setCarregando] = useState("Carregando...");
    const [dataUltimoSync, setDataUltimoSync] = useState("10/11/2023 às 17:30");
    const [fotosAEnviar, setFotosAEnviar] = useState([]);
    const [qtdeFotosAEnviar, setQtdeFotosAEnviar] = useState(0);

    const realm = useRealm();
    const isFocused = useIsFocused();

    const refreshData = useCallback(async () => {

        setCarregando("Carregando...");
        const deviceId = await getUniqueId();
        const objFotosAEnviar = realm.objects("Foto").filtered(`deviceId = '${deviceId}' and dataUpload = nil `).toJSON();
        console.log("===> fotos a enviar", objFotosAEnviar);
        setFotosAEnviar(objFotosAEnviar);
        setQtdeFotosAEnviar(objFotosAEnviar.length);
        setCarregando("");

    }, [realm, isFocused]);

    useEffect(() => {
        refreshData();
    }, []);

    async function enviarS3(foto) {
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


    const sincronizar = useCallback(async () => {
        try {
            setCarregando("Sincronizando...");

            const dataCorrente = new Date();


            for (let index = 0; index < fotosAEnviar.length; index++) {
                const foto = fotosAEnviar[index];
                console.log("enviando foto", foto);
                const file = await ExpoFs.readAsStringAsync(foto.uri, { encoding: ExpoFs.EncodingType.Base64 });
                const arrayBuffer = decode(file);

                await uploadFileToS3("app-tablet-trimap", `${foto._id}.${foto.extensao}`, arrayBuffer);
                realm.write(() => {
                    foto.dataUpload = dataCorrente;
                    realm.create("Foto", foto, "modified");
                });

                setQtdeFotosAEnviar(qtdeFotosAEnviar - 1);
            }

            setCarregando("");
            setQtdeFotosAEnviar(0);

        }
        catch (error) {
            console.log(error);
        }
    }, [realm, isFocused, fotosAEnviar]);


    if (carregando !== "") {
        return (
            <View>
                <View style={{ backgroundColor: "white", margin: 10, borderRadius: 10, padding: 20, alignItems: "center" }}>
                    <Text style={{ fontSize: 20, fontWeight: "bold", padding: 5 }}>{carregando}</Text>
                </View>
                
            </View>
        );

    }

    return (<View>
        <View style={{ backgroundColor: "white", margin: 10, borderRadius: 10, padding: 20, alignItems: "center" }}>
            <Text style={{ fontSize: 20, fontWeight: "bold", padding: 5 }}>Imagens a Enviar</Text>
            <Text style={{ fontSize: 48, fontWeight: "bold", padding: 5 }}>{qtdeFotosAEnviar}</Text>
        </View>
        <TouchableOpacity style={{ backgroundColor: "blue", margin: 10, borderRadius: 10, padding: 20, alignItems: "center" }} onPress={() => sincronizar()}>
            <Text style={{ fontSize: 20, fontWeight: "bold", padding: 5, color: "white" }}>Sincronizar</Text>
        </TouchableOpacity>
    </View>
    )

}