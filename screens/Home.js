import React, { useState, useEffect } from "react";
import { StyleSheet, Text, View, Button, Vibration } from "react-native";
import Dialog from "react-native-dialog";
import { Audio } from "expo-av";

export default function HomeScreen() {
  const [toggle, setToggle] = useState(false);
  const [sound, setSound] = useState();

  async function playSound() {
    console.log("Loading Sound");
    const { sound } = await Audio.Sound.createAsync(
      require("../assets/bell-ringing-04.mp3")
    );
    setSound(sound);

    console.log("Playing Sound");
    await sound.playAsync();
  }

  useEffect(() => {
    return sound
      ? () => {
          sound.unloadAsync();
        }
      : undefined;
  }, [sound]);
  return (
    <View style={styles.container}>
      <Button title="Open Dialog" onPress={() => setToggle(true)} />
      <Dialog.Container visible={toggle}>
        <Dialog.Title>Dialog</Dialog.Title>
        <Dialog.Description>
          <View style={styles.btnContainer}>
            <View style={styles.btn}>
              <Button title="Vibrate" onPress={() => Vibration.vibrate()} />
            </View>
            <View>
              <Button title="Ring a bell" onPress={playSound} />
            </View>
          </View>
        </Dialog.Description>
        <Dialog.Button label="Cancel" onPress={() => setToggle(false)} />
      </Dialog.Container>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
  btn: {
    marginRight: 40,
  },
  btnContainer: {
    flexDirection: "row",
  },
});
