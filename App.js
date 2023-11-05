import { StatusBar } from 'expo-status-bar';
import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, TextInput, View, Button, FlatList, TouchableOpacity } from 'react-native';
import { getRealm } from './databases/realm';
import uuid from 'react-native-uuid';


export default function App() {
  const [titulo, setTitulo] = useState("");
  const [descricao, setDescricao] = useState("");
  const [tarefas, setTarefas] = useState([])

  useEffect(() => {

    refreshData()

  }, []);

  async function refreshData() {

    const realm = await getRealm();

    if (realm === undefined) {
      console.log("realm is undefined");
    }
    try {
      const tarefasCorrente = realm
        .objects("Todo")
        .toJSON();


      console.log("Tarefas Corrente ==> ", tarefasCorrente);


      setTarefas(tarefasCorrente);
    }
    catch (error) {
      console.log("Error Realm", error);
    }
    finally {

      realm.close();
    }
  }

  async function handleAddTodo() {



    const realm = await getRealm();

    try {
      realm.write(() => {
        realm.create("Todo", { _id: uuid.v4(), titulo, descricao });
      });

      realm.close();

      setTitulo("");
      setDescricao("");
    }
    catch (error) {
      console.log("Error Realm", error);
    }
    finally {
      realm.close();
    }

    refreshData();
  }

  console.log(tarefas);

  function RenderHeader() {
    return <>
      <View style={styles.containerInputs}>

        <TextInput placeholder="Título" style={styles.titutoTxt} value={titulo} onChangeText={setTitulo} />

        <TextInput placeholder="Descricao" style={styles.titutoTxt} value={descricao} onChangeText={setDescricao} />

      </View>

      <Button title="Add" color={"red"} onPress={handleAddTodo} />


    </>
  }

  function RenderListaHeader() {
    return <View style={styles.headerLista}>
      <Text style={styles.headerListaText}>Lista de tarefas</Text>
    </View>
  }

  function RenderCard({ item }) {
    console.log("render todo", item);
    return <View style={styles.todoCard}>
      <View style={{width: "50%", backgroundColor: "blue"}}>
        <Text style={styles.tituloCard}>{item.titulo}</Text>
        <Text style={styles.descricaoCard}>{item.descricao}</Text>
      </View>
      <TouchableOpacity style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: "red" }} >
        <Text style={{ lineHeight: 20 , width: 40, textAlign: "center", marginTop: 10}}>X</Text>
      </TouchableOpacity>
    </View>
  }

  return (
    <View style={styles.container}>


      {RenderHeader()}

      <FlatList data={tarefas} renderItem={todo => RenderCard(todo)} ListHeaderComponent={RenderListaHeader} style={styles.lista} stickyHeaderIndices={[0]} />

      <StatusBar style="auto" />
    </View>
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

    padding: 10
  },
  addButton: {
    color: "red",
    padding: 15
  },
  todoCard: {
    flex: 1,
    direction: "column",
    padding: 10,
    margin: 5,
    borderRadius: 5,
    width: '100%',
    backgroundColor: "lightgray",
  },
  tituloCard: {
    lineHeight: 25,
    color: "black",
  },
  descricaoCard: {
    lineHeight: 25,
    color: "black",
  },
  headerLista: {
    width: "100%",
    marginTop: 5,
    backgroundColor: "lightgray",
    padding: 5
  },
  headerListaText: {
    fontSize: 20
  },
  lista: {
    marginTop: 5,
    width: "100%",
  }

});