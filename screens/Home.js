import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  TextInput,
  ScrollView
} from 'react-native';
import { getAuth, signOut } from 'firebase/auth';
import { collection, query, where, onSnapshot, orderBy, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { SwipeListView } from 'react-native-swipe-list-view';

export default function Home({ navigation }) {
  const [notes, setNotes] = useState([]);
  const [filteredNotes, setFilteredNotes] = useState([]);
  const [email, setEmail] = useState("Utilisateur");
  const [search, setSearch] = useState("");
  const [sortAsc, setSortAsc] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("Toutes");
  const [filterStatus, setFilterStatus] = useState("all");

  const auth = getAuth();

  //Récupérer l'email de l'utilisateur
  useEffect(() => {
    const user = auth.currentUser;
    if (user) setEmail(user.email);
  }, []);

  //Charger les notes depuis Firebase + les mettre à jour auto en temps réel
  useEffect(() => {
    //vérification de l'authentification
    const user = auth.currentUser;
    if (!user) return;

    //Création d'une requete firebase
    const q = query(
      collection(db, "notes"),
      where("uid", "==", user.uid),
      orderBy("createdAt", "desc")
    );

    //ecouter les changements en temps reel
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setNotes(data);
      setFilteredNotes(data);
    });

    return unsubscribe;
  }, []);

  //Filtrer les notes
  useEffect(() => {
    let temp = notes.filter(note =>
      note.title.toLowerCase().includes(search.toLowerCase()) ||
      note.content.toLowerCase().includes(search.toLowerCase())
    );

    if (selectedCategory !== "Toutes") {
      temp = temp.filter(note => note.category === selectedCategory);
    }

    if (filterStatus === "pending") temp = temp.filter(n => !n.completed);
    else if (filterStatus === "completed") temp = temp.filter(n => n.completed);

    setFilteredNotes(temp);
  }, [search, notes, selectedCategory, filterStatus]);

  //fonction: marquer une note comme terminée dans firebase
  const markCompleted = async (note) => {
    try {
      await updateDoc(doc(db, "notes", note.id), { completed: true });
    } catch (e) {
      alert("Erreur !");
    }
  };

  //fonction: supprimer une note
  const deleteNote = async (id) => {
    Alert.alert(
      "Supprimer",
      "Voulez-vous vraiment supprimer cette note ?",
      [
        { text: "Annuler", style: "cancel" },
        {
          text: "Supprimer",
          style: "destructive",
          onPress: async () => {
            await deleteDoc(doc(db, "notes", id));
          }
        }
      ]
    );
  };

  //fontion: transformer un timestamp Firebase en date lisible
  const formatDate = (timestamp) => {
    if (!timestamp) return '';
    const date = timestamp.toDate ? timestamp.toDate() : timestamp;
    return date.toLocaleDateString(); //Convertit une date en texte lisible selon la langue de l'utilisateur
  };

  //fonction: choisir la couleur de fond d'une note
  const getNoteBackgroundColor = (note) => {
    if (note.completed) return "#d4edda";
    if (note.color) return note.color;
    return "#fff";
  };

  //fonction: se déconnecter
  const handleLogout = async () => {
    try {
      await signOut(auth); //deconnecte l'user de firebase
      navigation.reset({ //redirection vers la page de connexion
        index: 0, //// Position dans l'historique (0 = première page)
        routes: [{ name: "Login" }],//L'historique contient UNE SEULE page : "Login"
      });
    } catch {
      alert("Impossible de se déconnecter.");
    }
  };

  //fonction: trier les notes par date et inverser l'ordre à chaque clic
  const toggleSort = () => {
      const sorted = [...filteredNotes].sort((a, b) => { //crée une copie du tableau filteredNotes et trie le tableau selon une règle personnalisée
      const dateA = a.createdAt.toDate(); //a.createdAt et b.createdAt Ce sont des Timestamps Firebase
      const dateB = b.createdAt.toDate();
      return sortAsc ? dateB - dateA : dateA - dateB;
    });
    setFilteredNotes(sorted);//Mettre à jour les notes triées
    setSortAsc(!sortAsc);
  };

  //Créer un tableau de toutes les catégories uniques + ajouter "Toutes" au début
  const categories = ["Toutes", 
    ...Array.from( //Convertit le Set en tableau normal
      new Set(//Crée un Set qui supprime automatiquement les doublons
      notes.map(n => n.category) //Extrait la catégorie de chaque note
                                //On a toutes les catégories (avec doublons et null)
      .filter(c => c)))];//c => c est une condition courte="garde seulement les valeurs vraies"

  //L'interface
  return (
    <View style={styles.container}>

      <ScrollView
        style={{ flexGrow: 0 }}
        contentContainerStyle={{ paddingBottom: 15 }}
        showsVerticalScrollIndicator={false}
      >
        {/*Bouton de déconnexion*/}
        <TouchableOpacity style={styles.topLogoutBtn} onPress={handleLogout}>
          <Text style={styles.topLogoutText}>⎋</Text>
        </TouchableOpacity>

        {/*Message de bienvenue avec l'email*/}
        <Text style={styles.welcome}>Bonjour, {email} 👋</Text>
        <Text style={styles.header}>Mes Notes</Text>

        {/*Barre de recherche*/}
        <TextInput
          style={styles.searchInput}
          placeholder="Rechercher une note..."
          value={search}
          onChangeText={setSearch}
        />

        {/*Filtres par catégorie*/}
        <View style={styles.categoryContainer}>
          {categories.map(cat => ( //Pour chaque catégorie, crée un bouton
            <TouchableOpacity
              key={cat}
              style={[styles.categoryBtn,  // Style de base
                selectedCategory === cat && styles.categorySelected]} //// Style si sélectionné
              onPress={() => setSelectedCategory(cat)}
            >
              <Text style={styles.categoryText}>{cat}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/*Filtres par statut*/}
        <View style={styles.statusRow}>
          {["all", "pending", "completed"].map(status => (
            <TouchableOpacity
              key={status}
              style={[styles.filterBtn, filterStatus === status && styles.filterBtnActive]}
              onPress={() => setFilterStatus(status)}
            >
              <Text style={styles.filterText}>
                {status === "all" ? "Toutes" : status === "pending" ? "En cours" : "Terminées"}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/*Bouton de tri par date*/}
        <TouchableOpacity style={styles.sortBtn} onPress={toggleSort}>
          <Text style={styles.sortBtnText}>
            Trier par date {sortAsc ? "(↑)" : "(↓)"}
          </Text>
        </TouchableOpacity>

        {/*Bouton "Ajouter une note"*/}
        <TouchableOpacity
          style={styles.addBtn}
          onPress={() => navigation.navigate("AddNote")}
        >
          <Text style={styles.addBtnText}>+ Ajouter une note</Text>
        </TouchableOpacity> 
        
        {/*Liste des notes avec swipe*/}
        <SwipeListView
          style={{ marginTop: 10 }}
          data={filteredNotes} //Les notes à afficher
          keyExtractor={(item) => item.id} //Identifie chaque note de manière unique
          renderItem={({ item }) => ( //Comment afficher chaque note 
            <View style={[styles.noteCard, { backgroundColor: getNoteBackgroundColor(item) }]}>
              <Text style={styles.title}>{item.title}</Text>
              <Text style={styles.categoryLabel}>{item.category || "Pas de catégorie"}</Text>
              <Text style={styles.content}>
                {item.content.length > 50 ? item.content.substring(0, 50) + "..." : item.content}
              </Text>

              <Text style={styles.date}>Créée : {formatDate(item.createdAt)}</Text>
              {item.deadline && (
                <Text style={styles.deadline}>Deadline : {formatDate(item.deadline)}</Text>
              )}

              {item.completed ? (
                <Text style={{ color: "green", fontWeight: "bold", marginTop: 5 }}>✔ Terminée</Text>
              ) : (
                <TouchableOpacity
                  style={styles.inlineDoneBtn}
                  onPress={() => markCompleted(item)}
                >
                  <Text style={{ color: "#fff", fontWeight: "bold" }}>Terminer</Text>
                </TouchableOpacity>
              )}
            </View>
          )}

          // Buttons that appear DURING swipe
          renderHiddenItem={({ item }) => (
            <View style={styles.rowBack}>

              {/* Swipe RIGHT → Modifier */}
              <TouchableOpacity
                style={[styles.backBtnLeft, { backgroundColor: "#007bff" }]}
                onPress={() => navigation.navigate("AddNote", { note: item })}
              >
                <Text style={styles.backTextWhite}>Modifier</Text>
              </TouchableOpacity>

              {/* Swipe LEFT → Supprimer */}
              <TouchableOpacity
                style={[styles.backBtnRight, { backgroundColor: "#dc3545" }]}
                onPress={() => deleteNote(item.id)}
              >
                <Text style={styles.backTextWhite}>Supprimer</Text>
              </TouchableOpacity>

            </View>
          )}

          leftOpenValue={75}     // Swipe droite pour modifier
          rightOpenValue={-75}   // Swipe gauche pour supprimer
        />


      </ScrollView>

    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#f7f7f7" },

  topLogoutBtn: {
    position: "absolute",
    top: 15,
    right: 15,
    backgroundColor: "#dc3545",
    width: 35,
    height: 35,
    borderRadius: 50,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 99,
  },
  topLogoutText: { color: "#fff", fontSize: 20, fontWeight: "bold" },

  welcome: { fontSize: 20, fontWeight: "bold", marginTop: 60 },
  header: { fontSize: 22, fontWeight: "bold", marginVertical: 10 },

  searchInput: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 10,
    borderRadius: 8,
    marginBottom: 10
  },

  categoryContainer: { flexDirection: "row", flexWrap: "wrap", marginBottom: 10 },

  categoryBtn: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    backgroundColor: "#e2e8f0",
    borderRadius: 15,
    marginRight: 8,
    marginBottom: 8
  },

  categorySelected: { backgroundColor: "#28a745" },
  categoryText: { color: "#111" },

  statusRow: { flexDirection: "row", marginBottom: 10 },

  filterBtn: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: "#e2e8f0",
    borderRadius: 10,
    marginRight: 10
  },
  filterBtnActive: { backgroundColor: "#0d6efd" },
  filterText: { color: "#fff", fontWeight: "bold" },

  sortBtn: {
    backgroundColor: "#6c757d",
    padding: 10,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 10
  },
  sortBtnText: { color: "#fff", fontWeight: "bold" },

  addBtn: {
    backgroundColor: "#28a745",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    marginBottom: 15
  },
  addBtnText: { color: "#fff", fontSize: 18, fontWeight: "bold" },

  noteCard: {
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
    elevation: 2,
    backgroundColor: '#fff' // Ajouté pour s'assurer que la note a un fond
  },

  inlineDoneBtn: {
    marginTop: 10,
    backgroundColor: "#28a745",
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: "center"
  },

  title: { fontSize: 18, fontWeight: "bold" },
  categoryLabel: { fontSize: 13, color: "#6c757d", marginTop: 3 },

  content: { fontSize: 15, marginTop: 8, color: "#444" },

  date: { marginTop: 5, fontSize: 12, color: "#666" },
  deadline: { marginTop: 2, fontSize: 13, fontWeight: "bold" },

  // ✅ STYLES CORRIGÉS POUR LE SWIPE
  rowBack: {
    alignItems: 'center',
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between', // ← Changé : espace entre les boutons
    marginBottom: 15,
    borderRadius: 10,
    backgroundColor: '#DDD',
    height: '100%' // ← Ajouté : prend toute la hauteur
  },

  // Bouton GAUCHE (Modifier - Bleu)
  backBtnLeft: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 75,
    height: '100%',
    borderTopLeftRadius: 10,    // ← Ajouté : coins arrondis
    borderBottomLeftRadius: 10
  },

  // Bouton DROITE (Supprimer - Rouge)
  backBtnRight: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 75,
    height: '100%',
    borderTopRightRadius: 10,    // ← Ajouté : coins arrondis
    borderBottomRightRadius: 10
  },

  backTextWhite: { 
    color: '#fff', 
    fontWeight: 'bold',
    fontSize: 14 // ← Ajouté : taille du texte
  },
});