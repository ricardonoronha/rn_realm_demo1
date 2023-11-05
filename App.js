import { StatusBar } from 'expo-status-bar';
import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, TextInput, View, Button, FlatList, TouchableOpacity } from 'react-native';
import { getRealm } from './databases/realm';
import uuid from 'react-native-uuid';
import { NavigationContainer, useIsFocused } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import CameraView from './telas/CameraView';

const Stack = createNativeStackNavigator();

function HomeScreen({ navigation }) {

  const [tarefas, setTarefas] = useState([]);
  const isFocused = useIsFocused();

  useEffect(() => {

    refreshData()

  }, [isFocused]);

  async function removerTodo(todo) {
    
    const realm = await getRealm();

    try {

      const tarefaADeltar = realm.objects("Todo").filtered(`_id = '${todo._id}'`);
      realm.write(() => {
        realm.delete(tarefaADeltar);
      });
    }
    catch (error) {
      console.log("Error Realm", error);
    }
    finally {
      realm.close();
    }

    refreshData();

  }


  function RenderCard({ item }) {
    
    return <View style={styles.todoCard}>
      <View style={{ width: "100%", flex: 3 }}>
        <Text style={styles.tituloCard}>{item.titulo}</Text>
        <Text style={styles.descricaoCard}>{item.descricao}</Text>
      </View>
      <TouchableOpacity style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: "red", flex: 1, alignItems: "center" }} onPress={() => removerTodo(item)} >
        <Text style={{ lineHeight: 20, textAlign: "center", marginTop: 10 }}>Remover</Text>
      </TouchableOpacity>
      <TouchableOpacity style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: "lightblue", flex: 1, alignItems: "center", marginLeft: 10 }} onPress={() => navigation.navigate("Foto")} >
        <Text style={{ lineHeight: 20, textAlign: "center", marginTop: 10 }}>Foto</Text>
      </TouchableOpacity>
    </View>
  }

  async function refreshData() {

    const realm = await getRealm();

    try {
      const tarefasCorrente = realm
        .objects("Todo")
        .toJSON();

      setTarefas(tarefasCorrente);
    }
    catch (error) {
      console.log("Error Realm", error);
    }
    finally {

      realm.close();
    }
  }

  function RenderListaHeader() {
    return <View style={styles.headerLista}>
      <Text style={styles.headerListaText}>Lista de tarefas</Text>
      <TouchableOpacity style={{ width: 60, height: 60, borderRadius: 30, backgroundColor: "green" }} onPress={() => navigation.navigate("AddTarefa")} >
        <Text style={{ lineHeight: 40, width: 60, textAlign: "center", marginTop: 10, color: "white" }}>+</Text>
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

  async function handleAddTodo() {

    const realm = await getRealm();

    try {
      realm.write(() => {
        realm.create("Todo", { _id: uuid.v4(), titulo, descricao });
      });

      realm.close();
      navigation.navigate("Home")
    }
    catch (error) {
      console.log("Error Realm", error);
    }
    finally {
      realm.close();
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

export default function App() {


  return (
    <>
      <NavigationContainer>
        <Stack.Navigator>
          <Stack.Screen name="Home" component={HomeScreen} options={{ title: 'Página Inicial', headerShown: false }} />
          <Stack.Screen name="AddTarefa" component={AddTarefa} options={{ title: 'Adicionar tarefa' }} />
          <Stack.Screen name="Foto" component={CameraView} options={{ title: 'Foto' }} />
        </Stack.Navigator>
      </NavigationContainer>
      <StatusBar style="auto" backgroundColor='darkgray' />
    </>
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