import React, { useState, useEffect } from 'react';
import { SafeAreaView, StyleSheet, Text, TouchableOpacity, View, Image, StatusBar, Alert, FlatList } from 'react-native';
import { useIsFocused } from '@react-navigation/native';
import uuid from "react-native-uuid";
import { getRealm } from '../../databases/realm';
import { useAuth } from "@realm/react"


export default function ConfigView({ navigation }) {


    const { logOut } = useAuth();

    function sair() {
        logOut();
    }

    const configs = [
        { titulo: "Sync", descricao: "Sincronize o dados do aplicativo com a nuvem", rota: "SyncView" },
        { titulo: "Configurações Gerais (Pendente)", descricao: "Configurações globais do aplicativo" },
        { titulo: "Sair", descricao: "Deslogar usuário", onPress: sair},
    ]

    function navegar(item) {
        if (item.onPress){
            item.onPress();
            return;
        }
        
        if (item.rota) {
            navigation.navigate(item.rota)
        }
    }

    function RenderItemLista({ item }) {
        return (
            <TouchableOpacity
                style={{ display: "flex", flexDirection: "row", alignItems: "center", flex: 1, direction: "row", padding: 10, width: '100%', backgroundColor: "lightgrey" }}
                onPress={() => navegar(item)}>
                <View style={{ width: "100%", flex: 3 }}>
                    <Text style={{ flex: 1, lineHeight: 25, color: "black", fontWeight: "bold" }}>{item.titulo}</Text>
                    <Text style={{ flex: 1, lineHeight: 25, color: "black", }}>{item.descricao}</Text>
                </View>
            </TouchableOpacity>
        );

    }

    function RenderSeparator() {
        return <View style={{ height: 1, backgroundColor: "white" }}></View>
    }

    return (
        <FlatList data={configs} renderItem={RenderItemLista} ItemSeparatorComponent={RenderSeparator} />
    );


}