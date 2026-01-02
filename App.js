import React, { useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import Login from './screens/Login';
import Signup from './screens/Signup';
import Home from './screens/Home';
import AddNote from './screens/AddNote';
import { getAuth, onAuthStateChanged } from 'firebase/auth';

const Stack = createStackNavigator();

export default function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); //État de chargement
  const auth = getAuth(); //auth : L'objet d'authentification Firebase


  //Écouter l'état d'authentification
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, u => { // Écoute en temps réel l'état de connexion
      setUser(u); //Si connecté : objet utilisateur sinon: null
      setLoading(false); //Arrête le chargement
    });
    return unsubscribe;
  }, []);

  // Écran de chargement
  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" /> {/* Roue qui tourne */}
      </View>
    );
  }

  return (
    <NavigationContainer>  {/*Conteneur principal pour React Navigation */}
      <Stack.Navigator 
        screenOptions={{
          headerStyle: { backgroundColor: '#f8fafc' },
          headerTintColor: '#111827',
        }}
      >
        {user ? (
          <>
            <Stack.Screen name="Home" component={Home} options={{ title: 'MyNotes' }} />
            <Stack.Screen name="AddNote" component={AddNote} options={{ title: 'Ajouter une note' }} />
          </>
        ) : (
          <>
            <Stack.Screen name="Login" component={Login} options={{ title: 'Se connecter' }} />
            <Stack.Screen name="Signup" component={Signup} options={{ title: "S'inscrire" }} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
