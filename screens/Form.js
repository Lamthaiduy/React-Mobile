import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  Alert,
} from "react-native";
import Dialog from "react-native-dialog";
import { Picker } from "@react-native-picker/picker";
import DateTimePicker from "@react-native-community/datetimepicker";
import * as SQLite from "expo-sqlite";

export default function FormScreen() {
  const [data, setData] = useState({
    propertyType: "Home",
    bedRoom: "",
    date: new Date(),
    price: "",
    furnitureType: "Furnished",
    notes: "",
    reporter: "",
  });

  const [show, setShow] = useState(false);

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

  const handleClick = () => {
    if (data.bedRoom === "") {
      Alert.alert("Error", "Bedroom must be filled");
    } else if (data.price === "") {
      Alert.alert("Error", "Price must be filled");
    } else if (data.notes.length > 100) {
      Alert.alert("Error", "The length of note must be less than 100");
    } else if (data.reporter === "") {
      Alert.alert("Error", "Reporter must be filled");
    } else {
      setToggle(true);
    }
  };

  const onChange = (event, selectedDate) => {
    const currentDate = selectedDate || data.date;
    setShow(Platform.OS === "ios");
    setData({ ...data, date: currentDate });
  };

  const submitForm = () => {
    db.transaction((tx) => {
      tx.executeSql(
        "select * from properties where property_type = ? and bedRoom = ? and reporter = ?",
        [data.propertyType, parseInt(data.bedRoom), data.reporter],
        (_, { rows }) => {
          console.log(rows?._array);
          if (rows?._array.length > 0) {
            Alert.alert(
              "Error",
              "this property had been existed in database, please edit your form!",
              [{ text: "OK", onPress: () => setToggle(false) }]
            );
            return;
          } else {
            db.transaction(
              (tx) => {
                tx.executeSql(
                  `
                      insert into properties (property_type,
                          bedRoom,
                          date,
                          price,
                          furniture_type,
                          notes,
                          reporter)
                      values(?, ?, ?, ?, ?, ?, ?)
                  `,
                  [
                    data.propertyType,
                    data.bedRoom,
                    `${data.date.getDate()}/${
                      data.date.getMonth() + 1
                    }/${data.date.getFullYear()}`,
                    data.price.toString(),
                    data.furnitureType.toString(),
                    data.notes.toString(),
                    data.reporter.toString(),
                  ]
                );
              },
              (error) => console.log(`Save False: ${error}`),
              () => {
                Alert.alert(
                  "Save Successful",
                  "Your property had been saved into database",
                  [
                    {
                      text: "OK",
                      onPress: () => {
                        setData({
                          propertyType: "Home",
                          bedRoom: "",
                          date: new Date(),
                          price: "",
                          furnitureType: "Furnished",
                          notes: "",
                          reporter: "",
                        });
                        setToggle(false);
                      },
                    },
                  ]
                );
              }
            );
          }
        }
      );
    });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Input Form</Text>

      <View style={styles.inputContainer}>
        <Text>Property Type:</Text>
        <Picker
          style={styles.inputField}
          selectedValue={data.propertyType}
          onValueChange={(text, itemIndex) =>
            setData({ ...data, propertyType: text })
          }
          mode="dropdown"
        >
          <Picker.Item label="Home" value="Home" />
          <Picker.Item label="Bugalow" value="Bugalow" />
          <Picker.Item label="Flat" value="Flat" />
          <Picker.Item label="Apartment" value="Apartment" />
        </Picker>
      </View>

      <View style={styles.inputContainer}>
        <Text>Bedroom:</Text>
        <TextInput
          style={styles.inputField}
          defaultValue={data.bedRoom}
          onChangeText={(text) => setData({ ...data, bedRoom: text })}
          keyboardType="decimal-pad"
        />
      </View>

      <View style={styles.inputContainer}>
        <Text>Date Added:</Text>
        <TouchableOpacity
          style={styles.inputField}
          onPress={() => setShow(true)}
        >
          <Text>{data.date.toString()}</Text>
        </TouchableOpacity>
      </View>

      {show && (
        <DateTimePicker
          testID="dateTimePicker"
          value={data.date}
          mode={"date"}
          is24Hour={true}
          display="default"
          maximumDate={new Date()}
          onChange={onChange}
        />
      )}

      <View style={styles.inputContainer}>
        <Text>Rent Price:</Text>
        <TextInput
          style={styles.inputField}
          defaultValue={data.price}
          onChangeText={(text) => setData({ ...data, price: text })}
          keyboardType="decimal-pad"
        />
      </View>

      <View style={styles.inputContainer}>
        <Text>Furniture Type:</Text>
        <Picker
          style={styles.inputField}
          selectedValue={data.furnitureType}
          onValueChange={(text, itemIndex) =>
            setData({ ...data, furnitureType: text })
          }
          mode="dropdown"
        >
          <Picker.Item label="Furnished" value="Furnished" />
          <Picker.Item label="Half Furnished" value="Half Furnished" />
          <Picker.Item label="Unfurnished" value="Unfurnished" />
        </Picker>
      </View>

      <View style={styles.inputContainer}>
        <Text>Notes:</Text>
        <TextInput
          style={styles.inputField}
          defaultValue={data.notes}
          onChangeText={(text) => setData({ ...data, notes: text })}
        />
      </View>

      <View style={styles.inputContainer}>
        <Text>Reporter:</Text>
        <TextInput
          style={styles.inputField}
          defaultValue={data.reporter}
          onChangeText={(text) => setData({ ...data, reporter: text })}
        />
      </View>

      <TouchableOpacity style={styles.btn} onPress={handleClick}>
        <Text style={styles.btnText}>Submit</Text>
      </TouchableOpacity>

      <Dialog.Container visible={toggle}>
        <Dialog.Title>Review</Dialog.Title>
        <Dialog.Description>
          <View style={styles.review}>
            <Text>Property Type: {data.propertyType}</Text>
            <Text>Bedroom: {data.bedRoom}</Text>
            <Text>Date: {data.date.toString()}</Text>
            <Text>Price: {data.price}</Text>
            <Text>Furniture Type: {data.furnitureType}</Text>
            <Text>Notes: {data.notes}</Text>
            <Text>Reporter: {data.reporter}</Text>
          </View>
        </Dialog.Description>
        <Dialog.Button label="Back Edit" onPress={() => setToggle(false)} />
        <Dialog.Button label="Save" onPress={submitForm} />
      </Dialog.Container>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 25,
    fontWeight: "bold",
    textAlign: "center",
  },
  inputContainer: {
    marginLeft: 40,
  },
  inputField: {
    borderWidth: 1,
    height: 30,
    width: 300,
    paddingHorizontal: 10,
    borderColor: "black",
    marginBottom: 10,
  },
  btn: {
    alignSelf: "center",
    marginVertical: 20,
    backgroundColor: "blue",
    paddingHorizontal: 30,
    paddingVertical: 10,
    borderRadius: 10,
  },
  btnText: {
    color: "white",
    fontWeight: "bold",
  },
  review: {
    flex: 1,
  },
});
