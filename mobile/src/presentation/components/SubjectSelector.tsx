import React, { useState, useEffect, useRef } from "react";
import { View, Text, TextInput, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";

export interface Subject {
  id?: number;
  name: string;
}

interface Props {
  availableSubjects: Subject[];
  selectedSubjects: Subject[];
  onChange: (subjects: Subject[]) => void;
  clearTrigger?: number;
}

export default function SubjectSelector({
  availableSubjects,
  selectedSubjects,
  onChange,
  clearTrigger,
}: Props) {
  const [query, setQuery] = useState("");
  const [isFocused, setIsFocused] = useState(false);

  // Fix for web + mobile click issue
  const isSelectingRef = useRef(false);

  // Clear input after save
  useEffect(() => {
    setQuery("");
  }, [clearTrigger]);

  // Filter subjects
  const filteredSubjects = availableSubjects.filter((s) =>
    s.name.toLowerCase().includes(query.toLowerCase()),
  );

  // Add subject
  const addSubject = (subject: Subject) => {
    const exists = selectedSubjects.some(
      (s) => s.name.toLowerCase() === subject.name.toLowerCase(),
    );

    if (!exists) {
      onChange([...selectedSubjects, subject]);
    }

    setQuery("");
    setIsFocused(false);
  };

  // Add new subject locally
  const addNewSubject = () => {
    if (!query.trim()) return;
    addSubject({ name: query });
  };

  // Remove subject
  const removeSubject = (name: string) => {
    onChange(selectedSubjects.filter((s) => s.name !== name));
  };

  return (
    <View>
      {/* INPUT */}
      <TextInput
        placeholder="Search subject..."
        value={query}
        onChangeText={setQuery}
        onFocus={() => setIsFocused(true)}
        onBlur={() => {
          setTimeout(() => {
            if (!isSelectingRef.current) {
              setIsFocused(false);
            }
            isSelectingRef.current = false;
          }, 150);
        }}
        style={{
          borderWidth: 1,
          padding: 10,
          borderRadius: 8,
          backgroundColor: "white",
        }}
      />

      {/* DROPDOWN */}
      {(isFocused || query.length > 0) && (
        <View
          style={{
            borderWidth: 1,
            marginTop: 5,
            borderRadius: 8,
            backgroundColor: "white",
          }}
        >
          {filteredSubjects.map((item) => (
            <Pressable
              key={item.id}
              onPress={() => addSubject(item)}
              onPressIn={() => {
                isSelectingRef.current = true;
              }}
            >
              <Text style={{ padding: 10 }}>{item.name}</Text>
            </Pressable>
          ))}

          {/* ADD NEW SUBJECT */}
          {query.length > 0 && filteredSubjects.length === 0 && (
            <Pressable
              onPress={addNewSubject}
              onPressIn={() => {
                isSelectingRef.current = true;
              }}
            >
              <Text style={{ padding: 10, color: "blue" }}>{`Add "${query}"`}</Text>
            </Pressable>
          )}
        </View>
      )}

      {/* SELECTED SUBJECTS (CHIPS) */}
      <View
        style={{
          flexDirection: "row",
          flexWrap: "wrap",
          marginTop: 10,
        }}
      >
        {selectedSubjects.map((item) => (
          <View
            key={item.name}
            style={{
              backgroundColor: "#E3F2FD",
              paddingVertical: 6,
              paddingHorizontal: 10,
              borderRadius: 20,
              margin: 4,
              flexDirection: "row",
              alignItems: "center",
            }}
          >
            <Text style={{ color: "#1E63D5", fontWeight: "500" }}>
              {item.name}
            </Text>

            <Pressable onPress={() => removeSubject(item.name)}>
              <Ionicons
                name="close"
                size={16}
                color="#1E63D5"
                style={{ marginLeft: 5 }}
              />
            </Pressable>
          </View>
        ))}
      </View>
    </View>
  );
}
