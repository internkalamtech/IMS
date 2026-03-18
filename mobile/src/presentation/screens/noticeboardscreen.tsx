import React, { useState } from "react";
import { View, Text, TextInput, Button, StyleSheet } from "react-native";

export default function NoticeBoardScreen() {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  const handlePost = () => {
    console.log("Notice Posted:", title, content);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Notice Board</Text>

      <TextInput
        placeholder="Notice Title"
        value={title}
        onChangeText={setTitle}
        style={styles.input}
      />

      <TextInput
        placeholder="Notice Content"
        value={content}
        onChangeText={setContent}
        style={styles.input}
      />

      <Button title="Post Notice" onPress={handlePost} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  heading: { fontSize: 22, fontWeight: "bold", marginBottom: 20 },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 10,
    marginBottom: 15,
    borderRadius: 5,
  },
});