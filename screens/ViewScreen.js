import React, { useState, useEffect } from "react";
import * as SQLite from "expo-sqlite";
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  FlatList,
  Alert,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import Dialog from "react-native-dialog";

export default function ViewScreen() {
  const [data, setData] = useState([]);
  const [searchParam, setSearchParam] = useState("");
  const [note, setNote] = useState("");
  const [id, setId] = useState(null);

  const [toggle, setToggle] = useState(false);

  function openDatabase() {
    if (Platform.OS === "web") {
      return {
        transaction: () => {
          return {
            executeSql: () => {},
          };
        },
      };
    }
    const db = SQLite.openDatabase("database.db");
    return db;
  }
  const db = openDatabase();

  useEffect(() => {
    db.transaction((tx) => {
      tx.executeSql(
        `create table if not exists properties (id integer primary key not null, 
        property_type text,
        bedRoom int,
        date text,
        price text,
        furniture_type text,
        notes text,
        reporter text);`,
        [],
        () => {
          console.log("create success");
        },
        () => {
          console.log("create fail");
        }
      );
    });
  }, []);

  const load = () => {
    setSearchParam("");
    db.transaction((tx) => {
      tx.executeSql(
        "select * from properties",
        [],
        (_, { rows }) => {
          if (rows._array.length >= 0) {
            setData(rows._array);
          }
        },
        (_, e) => {
          console.log(e);
        }
      );
    });
    console.log("loaded");
  };

  const handleDelete = (id) => {
    db.transaction((tx) => {
      tx.executeSql("delete from properties where id = ?", [id], null, (_, e) =>
        console.log(e)
      );
    });
    load();
  };

  const openEdit = (id, note) => {
    setNote(note);
    setId(id);
    setToggle(true);
  };

  const handleEdit = () => {
    db.transaction((tx) => {
      tx.executeSql(
        "update properties set notes = ? where id = ?",
        [note, id],
        () => {
          Alert.alert("Success", "Edit successfully");
          setToggle(false);
        },
        (_, e) => console.log(e)
      );
    });
    load();
  };

  const search = () => {
    if (searchParam === "") {
      load();
    } else {
      db.transaction((tx) => {
        tx.executeSql(
          "select * from properties where property_type = ?",
          [searchParam],
          (_, { rows }) => {
            if (rows._array.length >= 0) {
              setData(rows._array);
            }
          },
          (_, e) => {
            console.log(e);
          }
        );
      });
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>All Data</Text>
      <View style={styles.bar}>
        <TouchableOpacity style={styles.button} onPress={load}>
          <Text style={styles.btnText}>Load Data</Text>
        </TouchableOpacity>
        <Picker
          style={{ width: 150 }}
          selectedValue={searchParam}
          onValueChange={(text, itemIndex) => setSearchParam(text)}
          mode="dropdown"
        >
          <Picker.Item label="" value="" enabled={false} />
          <Picker.Item label="Home" value="Home" />
          <Picker.Item label="Bugalow" value="Bugalow" />
          <Picker.Item label="Flat" value="Flat" />
          <Picker.Item label="Apartment" value="Apartment" />
        </Picker>
        <TouchableOpacity
          style={[styles.button, { backgroundColor: "blue" }]}
          onPress={search}
        >
          <Text style={styles.btnText}>Search</Text>
        </TouchableOpacity>
      </View>
      <FlatList
        data={data}
        renderItem={({ item }) => (
          <View style={styles.item}>
            <Text>
              <Text style={styles.bold}>Id:</Text> {item.id}
            </Text>
            <Text>
              <Text style={styles.bold}>Property Type:</Text>{" "}
              {item.property_type}
            </Text>
            <Text>
              <Text style={styles.bold}>Bedroom:</Text> {item.bedRoom}
            </Text>
            <Text>
              <Text style={styles.bold}>Date:</Text> {item.date.toString()}
            </Text>
            <Text>
              <Text style={styles.bold}>Price:</Text> {item.price}
            </Text>
            <Text>
              <Text style={styles.bold}>Furniture Type:</Text>{" "}
              {item.furniture_type}
            </Text>
            <Text>
              <Text style={styles.bold}>Notes:</Text> {item.notes}
            </Text>
            <Text>
              <Text style={styles.bold}>Reporter:</Text> {item.reporter}
            </Text>
            <TouchableOpacity
              style={[styles.itemBtn, { backgroundColor: "green" }]}
              onPress={() => openEdit(item.id, item.notes)}
            >
              <Text style={styles.btnText}>Edit</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.itemBtn}
              onPress={() => handleDelete(item.id)}
            >
              <Text style={styles.btnText}>Delete</Text>
            </TouchableOpacity>
          </View>
        )}
      />
      <Dialog.Container visible={toggle}>
        <Dialog.Title>Edit</Dialog.Title>
        <Dialog.Description>
          <View>
            <Text>Notes:</Text>
            <TextInput
              style={styles.input}
              defaultValue={note}
              onChangeText={(text) => setNote(text)}
            />
          </View>
        </Dialog.Description>
        <Dialog.Button
          label="Cancel"
          onPress={() => {
            setToggle(false);
            setNote("");
          }}
        />
        <Dialog.Button label="Submit" onPress={() => handleEdit()} />
      </Dialog.Container>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  title: {
    fontWeight: "bold",
    fontSize: 25,
    textAlign: "center",
  },
  bold: {
    fontWeight: "bold",
  },
  item: {
    marginTop: 30,
    borderWidth: 1,
    paddingHorizontal: 30,
    paddingVertical: 20,
    borderColor: "black",
    marginHorizontal: 30,
  },
  bar: {
    flexDirection: "row",
  },
  button: {
    marginLeft: 20,
    borderRadius: 10,
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: "green",
  },
  btnText: {
    textAlign: "center",
    color: "white",
    fontWeight: "bold",
  },
  itemBtn: {
    marginHorizontal: 50,
    marginVertical: 10,
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 10,
    backgroundColor: "red",
  },
  input: {
    borderWidth: 1,
    height: 30,
    width: 300,
    paddingHorizontal: 10,
    borderColor: "black",
    marginBottom: 10,
  },
});
