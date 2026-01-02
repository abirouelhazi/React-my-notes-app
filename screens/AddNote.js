import React, { useState } from 'react'; 
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { collection, addDoc, updateDoc, doc, serverTimestamp, Timestamp } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { db } from '../firebase';
import DateTimePicker from '@react-native-community/datetimepicker';

export default function AddNote({ navigation, route }) {
  const noteToEdit = route.params?.note; //Récupère la note passée en paramètre

  const [title, setTitle] = useState(noteToEdit ? noteToEdit.title : '');
  const [content, setContent] = useState(noteToEdit ? noteToEdit.content : '');
  const [color, setColor] = useState(noteToEdit ? noteToEdit.color : '#fff');
  const [deadline, setDeadline] = useState(noteToEdit ? noteToEdit.deadline?.toDate() : null);
  const [category, setCategory] = useState(noteToEdit ? noteToEdit.category : '');
  const [showPicker, setShowPicker] = useState(false);

  const auth = getAuth();
  const user = auth.currentUser;

  const COLORS = ['#fff', '#ffadad', '#ffd6a5', '#fdffb6', '#caffbf', '#9bf6ff', '#a0c4ff', '#bdb2ff', '#ffc6ff'];

  const handleSave = async () => {
    if (!title || !content) {
      alert("Veuillez remplir le titre et le contenu");
      return;
    }

    try {
      const noteData = {
        title,
        content,
        color,
        category,
        deadline: deadline ? Timestamp.fromDate(new Date(deadline.setHours(0,0,0,0))) : null,
      };

      if (noteToEdit) {
        const noteRef = doc(db, "notes", noteToEdit.id);
        await updateDoc(noteRef, noteData);
      } else {
        await addDoc(collection(db, "notes"), {
          ...noteData,
          uid: user.uid,
          createdAt: serverTimestamp(),
        });
      }

      navigation.goBack();
    } catch (error) {
      console.log(error);
      alert("Erreur lors de l'enregistrement de la note");
    }
  };

  const onChangeDate = (event, selectedDate) => {
    setShowPicker(Platform.OS === 'ios');
    if (selectedDate) setDeadline(selectedDate); //Si une date est sélectionnée → Met à jour deadline
  };

  return (
    <View style={styles.container}>
      {/*Champ Titre */}
      <Text style={styles.label}>Titre</Text>
      <TextInput style={styles.input} value={title} onChangeText={setTitle} placeholder="Titre de la note" />

      {/* Champ Contenu */}
      <Text style={styles.label}>Contenu</Text>
      <TextInput
        style={[styles.input, { height: 100 }]}
        value={content}
        onChangeText={setContent}
        placeholder="Contenu de la note"
        multiline
      />

      {/* Champ Catégorie */}
      <Text style={styles.label}>Catégorie</Text>
      <TextInput
        style={styles.input}
        value={category}
        onChangeText={setCategory}
        placeholder="Catégorie de la note"
      />

      {/* Sélecteur de date */}
      <Text style={styles.label}>Date limite</Text>
      <TouchableOpacity onPress={() => setShowPicker(true)} style={styles.dateBtn}>
        <Text style={styles.dateBtnText}>
          {deadline ? deadline.toLocaleDateString() : "Choisir la date"}
        </Text>
      </TouchableOpacity>
      {showPicker && (
        <DateTimePicker
          value={deadline || new Date()}
          mode="date"
          display="default"
          onChange={onChangeDate}
          minimumDate={new Date()}
        />
      )}

      {/* Palette de couleurs */}
      <Text style={styles.label}>Couleur</Text>
      <View style={styles.colorContainer}>
        {COLORS.map(c => (
          <TouchableOpacity
            key={c}
            style={[styles.colorCircle, { backgroundColor: c, borderWidth: color === c ? 2 : 0 }]}
            onPress={() => setColor(c)}
          />
        ))}
      </View>

      {/* Bouton Enregistrer */}
      <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
        <Text style={styles.saveBtnText}>{noteToEdit ? "Mettre à jour" : "Enregistrer"}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#f7f7f7" },
  label: { fontSize: 16, fontWeight: "bold", marginTop: 15 },
  input: { backgroundColor: "#fff", borderRadius: 8, padding: 10, marginTop: 5 },
  dateBtn: { backgroundColor: "#e2e8f0", padding: 10, borderRadius: 8, marginTop: 5, alignItems: "center" },
  dateBtnText: { fontSize: 16 },
  colorContainer: { flexDirection: "row", flexWrap: "wrap", marginTop: 10 },
  colorCircle: { width: 40, height: 40, borderRadius: 20, marginRight: 10, marginBottom: 10 },
  saveBtn: { backgroundColor: "#28a745", padding: 15, borderRadius: 10, alignItems: "center", marginTop: 25 },
  saveBtnText: { color: "#fff", fontSize: 16, fontWeight: "bold" },
});
