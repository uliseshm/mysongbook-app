import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, FlatList, StyleSheet, ScrollView, StatusBar, TextInput } from "react-native";
import * as DocumentPicker from "expo-document-picker";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as FileSystem from "expo-file-system";
import { Ionicons } from "@expo/vector-icons";

const App = () => {
  const [songs, setSongs] = useState([]);
  const [fileContent, setFileContent] = useState("");
  const [selectedSong, setSelectedSong] = useState(null);
  const [darkMode, setDarkMode] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const loadSongs = async () => {
      try {
        const storedSongs = await AsyncStorage.getItem("songs");
        if (storedSongs) {
          setSongs(JSON.parse(storedSongs));
        }
      } catch (err) {
        console.error("Error al cargar canciones desde AsyncStorage:", err);
      }
    };
    loadSongs();
  }, []);

  const pickFile = async () => {
    try {
      const res = await DocumentPicker.getDocumentAsync({ type: "*/*" });
      console.log("Respuesta completa del selector:", res);
      
      if (!res || res.canceled || !res.assets) {
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

  const editFile = (text) => {
    setFileContent(text);
    if (selectedSong) {
      const updatedSongs = songs.map( song => 
        song.name === selectedSong.name ? { ...song, content: text } : song
      );
      setSongs(updatedSongs);
      AsyncStorage.setItem("songs", JSON.stringify(updatedSongs));
    }
  };

  const deleteSong = async (songName) => {
    const updatedSongs = songs.filter(song => song.name !== songName)
    setSongs(updatedSongs);
    await AsyncStorage.setItem("songs", JSON.stringify(updatedSongs));
    if (selectedSong && selectedSong.name === songName) {
      setSelectedSong(null);
      setFileContent("");
    }
  }

  const filteredSongs = songs.filter(song => song.name.toLowerCase().includes(searchQuery.toLowerCase()));

return (
  <View style={[styles.container, darkMode && styles.darkContainer]}>
    <StatusBar barStyle={darkMode ? "light-content" : "dark-content"} />
    <TouchableOpacity style={styles.themeButton} onPress={() => setDarkMode(!darkMode)}>
      <Ionicons name={darkMode ? "sunny" : "moon"} size={24} color={darkMode ? "#FFD700" : "#333"} />
    </TouchableOpacity>
    <TextInput 
      style={[styles.searchInput, darkMode && styles.darkText]} 
      placeholder="Buscar canción..." 
      placeholderTextColor={darkMode ? "#bbb" : "#555"} 
      value={searchQuery} 
      onChangeText={setSearchQuery} 
    />
    <TouchableOpacity style={styles.button} onPress={pickFile}>
      <Ionicons name="document-attach" size={24} color="white" />
      <Text style={styles.buttonText}>Importar Archivo .onsong</Text>
    </TouchableOpacity>
    <FlatList
      data={filteredSongs}
      keyExtractor={(item, index) => index.toString()}
      renderItem={({ item }) => (
        <View style={styles.songItemContainer}>
            <TouchableOpacity style={styles.songItem} onPress={() => { setSelectedSong(item); setFileContent(item.content); }}>
              <Ionicons name="musical-notes" size={20} color="#4A90E2" />
              <Text style={[styles.text, darkMode && styles.darkText]}>{item.name}</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => deleteSong(item.name)}>
              <Ionicons name="trash" size={20} color="red" />
            </TouchableOpacity>
          </View>
      )}
    />
    {selectedSong && (
      <ScrollView style={styles.fileContainer}>
        <TextInput 
          style={[styles.fileText, darkMode && styles.darkText, { fontFamily: "monospace" }]} 
          value={fileContent} 
          onChangeText={editFile} 
          multiline 
        />
      </ScrollView>
    )}
  </View>
);
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#F5F7FA",
  },
  darkContainer: {
    backgroundColor: "#1E1E1E",
  },
  themeButton: {
    position: "absolute",
    top: 30,
    right: 20,
    padding: 10,
  },
  button: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#4A90E2",
    padding: 10,
    borderRadius: 8,
    marginBottom: 20,
    marginTop: 80,
  },
  buttonText: {
    color: "white",
    fontSize: 16,
    marginLeft: 10,
  },
  songItemContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
    paddingHorizontal: 10,
  },
  songItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
  },
  text: {
    fontSize: 18,
    marginLeft: 10,
    color: "#333",
  },
  darkText: {
    color: "#F5F7FA",
  },
  fileContainer: {
    marginTop: 10,
    padding: 10,
    borderWidth: 1,
    borderColor: "#ccc",
    width: "90%",
    maxHeight: 450,
    backgroundColor: "transparent",
    borderRadius: 8,
  },
  fileText: {
    fontSize: 16,
    fontWeight: 700,
    color: "#555",
    textAlignVertical: "top",
    minHeight: 200,
  },
});

export default App;