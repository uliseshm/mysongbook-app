import React, { useState, useEffect } from "react";
import { View, Text, Button, FlatList, StyleSheet, ScrollView, TouchableOpacity, Alert } from "react-native";
import * as DocumentPicker from "expo-document-picker";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as FileSystem from "expo-file-system";

const App = () => {
  const [songs, setSongs] = useState([]);
  const [fileContent, setFileContent] = useState("");

  useEffect(() => {
    console.log("🔄 Cargando archivos desde AsyncStorage...");
    const loadSongs = async () => {
      try {
        const storedSongs = await AsyncStorage.getItem("songs");
        if (storedSongs) {
          console.log("✅ Archivos encontrados en AsyncStorage:", storedSongs);
          setSongs(JSON.parse(storedSongs));
        } else {
          console.log("⚠️ No hay archivos guardados.");
        }
      } catch (error) {
        console.error("❌ Error cargando archivos:", error);
      }
    };
    loadSongs();
  }, []);

  const pickFile = async () => {
    try {
      const res = await DocumentPicker.getDocumentAsync({ type: "*/*" });
      console.log("Respuesta completa del selector:", res);
      
      if (!res || res.canceled || !res.assets) {
        console.log("Selección de archivo cancelada o sin contenido válido");
        return;
      }

      const file = res.assets[0];
      const fileUri = file.uri;
      const content = await FileSystem.readAsStringAsync(fileUri, { encoding: FileSystem.EncodingType.UTF8 });
      
      const newSong = { name: file.name, uri: fileUri, content };
      
      setSongs((prevSongs) => {
        const updatedSongs = [...prevSongs, newSong];
        AsyncStorage.setItem("songs", JSON.stringify(updatedSongs));
        return updatedSongs;
      });
    } catch (err) {
      console.error("Error al seleccionar el archivo:", err);
    }
  };

  const readFile = async (content) => {
    setFileContent(content);
  };

return (
  <View style={styles.container}>
    <Button title="Importar Archivo .onsong" onPress={pickFile} />
    <FlatList
      data={songs}
      keyExtractor={(item, index) => index.toString()}
      renderItem={({ item }) => (
        <TouchableOpacity onPress={() => readFile(item.content)}>
          <Text style={styles.text}>{item.name}</Text>
        </TouchableOpacity>
      )}
    />
    {fileContent ? (
      <ScrollView style={styles.fileContainer}>
        <Text style={styles.fileText}>{fileContent}</Text>
      </ScrollView>
    ) : null}
  </View>
);
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    paddingTop: 120,
    paddingBottom: 30,
    backgroundColor: "#2f2f2f"
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    marginVertical: 10,
  },
  text: {
    fontSize: 18,
    marginTop: 10,
    color: "blue",
  },
  fileContainer: {
    marginTop: 20,
    padding: 10,
    borderWidth: 1,
    borderColor: "#ccc",
    width: "90%",
    maxHeight: 600,
  },
  fileText: {
    fontSize: 16,
    color: "#999",
  },
  infoText: {
    marginTop: 20,
    fontSize: 16,
    color: "gray",
  },
});

export default App;