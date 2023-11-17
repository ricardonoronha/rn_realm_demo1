import { StatusBar } from 'expo-status-bar';
import React, { useState, useEffect, useCallback } from 'react';
import { StyleSheet, Text, TextInput, View, Button, FlatList, TouchableOpacity, Switch } from 'react-native';
import uuid from 'react-native-uuid';
import { NavigationContainer, useIsFocused } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import CameraView from './telas/CameraView';
import { AWS } from "aws-sdk"
import FotoView from './telas/FotoView';
import ConfigView from './telas/ConfigView';
import SyncView from './telas/SyncView';
import {
  AppProvider,
  UserProvider,
  RealmProvider,
  useAuth,
  useRealm
} from "@realm/react";
import { FotoSchema } from './databases/schemas/FotoSchema';
import { ProjetoSchema } from './databases/schemas/ProjetoSchema';
import { SubProjetoSchema } from './databases/schemas/SubProjetoSchema';
import { TodoSchema } from './databases/schemas/TodoSchema';






const Stack = createNativeStackNavigator();

function HomeScreen({ navigation }) {

  const [tarefas, setTarefas] = useState([]);
  const isFocused = useIsFocused();

  const realm = useRealm();

  const refreshData = useCallback(() => {
    try {
      const tarefasCorrente = realm
        .objects("Todo")
        .toJSON();

      setTarefas(tarefasCorrente);
    }
    catch (error) {
      console.log("Error Realm", error);
    }
  }, [realm]);

  useEffect(() => {

    refreshData()

  }, [isFocused]);

  function RenderCard({ item }) {

    return <View style={{ display: "flex", flexDirection: "row", alignItems: "center", flex: 1, direction: "row", padding: 10, width: '100%', backgroundColor: "lightgrey" }}>
      <View style={{ width: "100%", flex: 3 }}>
        <Text style={{ flex: 1, lineHeight: 25, color: "black" }}>{item.titulo}</Text>
        <Text style={{ flex: 1, lineHeight: 25, color: "black", }}>{item.descricao}</Text>
      </View>
      <TouchableOpacity style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: "red", flex: 1, alignItems: "center" }} onPress={() => removerTodo(item)} >
        <Text style={{ lineHeight: 20, textAlign: "center", marginTop: 10 }}>Remover</Text>
      </TouchableOpacity>
      <TouchableOpacity style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: "lightblue", flex: 1, alignItems: "center", marginLeft: 10 }} onPress={() => navigation.navigate("Foto", { task: item })} >
        <Text style={{ lineHeight: 20, textAlign: "center", marginTop: 10 }}>Foto</Text>
      </TouchableOpacity>
      <TouchableOpacity style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: "lightyellow", flex: 1, alignItems: "center", marginLeft: 10 }} onPress={() => enviarS3(item)} >
        <Text style={{ lineHeight: 20, textAlign: "center", marginTop: 10 }}>S3</Text>
      </TouchableOpacity>
    </View>
  }



  function RenderListaHeader() {
    return <View style={styles.headerLista}>
      <Text style={styles.headerListaText}>Lista de tarefas</Text>
      <TouchableOpacity style={{ width: 60, height: 60, borderRadius: 30, backgroundColor: "green" }} onPress={() => navigation.navigate("AddTarefa")} >
        <Text style={{ lineHeight: 40, width: 60, textAlign: "center", marginTop: 10, color: "white" }}>+</Text>
      </TouchableOpacity>
      <TouchableOpacity style={{ width: 60, height: 60, borderRadius: 30, backgroundColor: "black" }} onPress={() => navigation.navigate("ConfigView")} >
        <Text style={{ lineHeight: 40, width: 60, textAlign: "center", marginTop: 10, color: "white" }}>Cfg</Text>
      </TouchableOpacity>
    </View>
  }

  function RenderSeparador() {
    return <View style={{ height: 1, backgroundColor: "white" }}></View>
  }

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View style={{ flex: 1, backgroundColor: "ligthgray" }}>
        <FlatList data={tarefas} renderItem={todo => RenderCard(todo)} ListHeaderComponent={RenderListaHeader} style={styles.lista} stickyHeaderIndices={[0]} ItemSeparatorComponent={RenderSeparador} />
      </View>
    </SafeAreaView>

  );
}

function AddTarefa({ navigation }) {

  const [titulo, setTitulo] = useState("");
  const [descricao, setDescricao] = useState("");

  const realm = useRealm();

  const createTodo = useCallback(() => {
    realm.write(() => {
      realm.create("Todo", { _id: uuid.v4(), titulo, descricao, projeto: "novooriente.ce", "subprojeto_id": "quadra0", responsavel: "" });
    });
  }, [realm, titulo, descricao]);

  async function handleAddTodo() {

    try {
      createTodo();
      navigation.navigate("Home")
    }
    catch (error) {
      console.log("Error Realm", error);
    }
  }

  return <SafeAreaView style={{ flex: 1, padding: 10, alignItems: "center", justifyContent: "center" }}>
    <View style={styles.containerInputs}>

      <TextInput placeholder="Título" style={styles.titutoTxt} value={titulo} onChangeText={setTitulo} />
      <TextInput placeholder="Descricao" style={styles.titutoTxt} value={descricao} onChangeText={setDescricao} />
    </View>
    <TouchableOpacity style={{ width: 150, backgroundColor: "green", padding: 20, alignItems: "center" }} onPress={handleAddTodo}>
      <Text style={{ color: "white" }}> ADICIONAR</Text>
    </TouchableOpacity>
  </SafeAreaView>
}

const LoginComponent = () => {

  const [usuario, setUsuario] = useState("");
  const [senha, setSenha] = useState("");
  const [ocultarSenha, setOcultarSenha] = useState(true);

  function alternarExibirSenha() {
    console.log("alterado");
    setOcultarSenha(estadoAnterior => !estadoAnterior);
  }

  const { logInWithEmailPassword, result } = useAuth();

  function logar() {
    try {
      logInWithEmailPassword({email: usuario, password: senha})
    }
    catch (error) {
      console.log("Login Error", error);
    }
  }

  return (
    <View style={{ display: "flex", height: 400}}>
      <View style={{ flex: 2, justifyContent: "flex-end", alignItems: "center" }}>
        <Text style={{ fontSize: 20, fontSize: 48 }}>Login</Text>
      </View>

      <TextInput placeholder="Usuário" style={{ flex: 1, padding: 10, backgroundColor: "white", borderColor: "black", borderStyle: "solid", borderWidth: 1, borderRadius: 5, margin: 10 }}
        value={usuario} onChangeText={setUsuario} />
      <TextInput placeholder="Senha" secureTextEntry={ocultarSenha} style={{ flex: 1, padding: 10, backgroundColor: "white", borderColor: "black", borderStyle: "solid", borderWidth: 1, borderRadius: 5, margin: 10 }}
        value={senha} onChangeText={setSenha} />
      <View style={{ flex: 1, flexDirection: "row", alignItems: "center", marginLeft: 10 }}>
        <Switch value={!ocultarSenha} onValueChange={alternarExibirSenha} />
        <Text>Mostrar Senha</Text>
      </View>

      <TouchableOpacity onPress={() => logar()} style={{ flex: 2, backgroundColor: "blue", margin: 10, justifyContent: "center", alignItems: "center", borderRadius: 5 }}>
        <Text style={{ color: "white", fontSize: 28, fontWeight: "bold" }}>Entrar</Text>
      </TouchableOpacity>
     
    </View>
  );
};


const AppComponent = () => {
  return (
    <>
      <NavigationContainer>
        <Stack.Navigator>
          <Stack.Screen name="Home" component={HomeScreen} options={{ title: 'Página Inicial', headerShown: false }} />
          <Stack.Screen name="AddTarefa" component={AddTarefa} options={{ title: 'Adicionar tarefa' }} />
          <Stack.Screen name="Foto" component={CameraView} options={{ title: 'Foto' }} />
          <Stack.Screen name="FotoView" component={FotoView} options={{ title: 'FotoView' }} />
          <Stack.Screen name="ConfigView" component={ConfigView} options={{ title: 'Configurações' }} />
          <Stack.Screen name="SyncView" component={SyncView} options={{ title: 'Sincronizar' }} />
        </Stack.Navigator>
      </NavigationContainer>
      <StatusBar style="auto" backgroundColor='darkgray' /></>
  );
};


export default function App() {



  return (
    <AppProvider id="devicesync-lkfhh">
      <UserProvider fallback={LoginComponent}>
        <RealmProvider
          schema={[FotoSchema, ProjetoSchema, SubProjetoSchema, TodoSchema]}
          sync={{
            flexible: true,
            initialSubscriptions: {
              update: (subs, realm) => {
                subs.add(
                  realm.objects("Todo").filtered("projeto = 'novooriente.ce'")
                );
              }
            },
          }}
        >
          <AppComponent />
        </RealmProvider>
      </UserProvider>
    </AppProvider>

  );
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',

  },
  titutoTxt: {
    padding: 10,
    borderStyle: 'solid',
    borderWidth: 1,
    borderColor: '#000',
    width: '100%',
    marginBottom: 10,
  },
  containerInputs: {
    width: '100%',

  },
  addButton: {
    color: "red",
    padding: 15
  },
  todoCard: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    direction: "row",
    padding: 10,
    width: '100%',
    backgroundColor: "lightgrey",
  },
  tituloCard: {
    flex: 1,
    lineHeight: 25,
    color: "black",
  },
  descricaoCard: {
    flex: 1,
    lineHeight: 25,
    color: "black",
  },
  headerLista: {
    flex: 1,
    flexDirection: "row",
    width: "100%",
    backgroundColor: "darkgray",
    padding: 10,
    paddingTop: 15,
  },
  headerListaText: {
    fontSize: 20,
    flex: 1,
    paddingTop: 15
  },
  lista: {
    width: "100%"
  }

});