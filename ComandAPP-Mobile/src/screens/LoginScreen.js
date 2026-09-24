import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, StyleSheet, Alert } from 'react-native';
import { getTables, getMenuByToken } from '../services/api';

export default function LoginScreen({ navigation }) {

const [nombre, setNombre] = useState('');
const [loading, setLoading] = useState(false);

const handleContinuar = async () => {
  // 1. Verificar que el nombre no esté vacío ni contenga solamente espacios
  if (!nombre || !nombre.trim()) {
    Alert.alert('Error', 'El nombre es obligatorio');
    setLoading(false);
    return;
  }

  setLoading(true);

  // 2. Obtener mesa activa y token desde el backend
  try {
    const mesas = await getTables();
    console.log('Respuesta mesas:', mesas);

    // Manejar respuesta vacía o inesperada
    if (!mesas || mesas.length === 0) {
      Alert.alert('Error', 'No hay mesas disponibles');
      setLoading(false);
      return;
    }

    const primeraMesa = mesas[0];
    console.log('Primera mesa:', primeraMesa);

    const token = primeraMesa?.accessToken;

    if (!token) {
      Alert.alert('Error', 'La mesa no tiene token asignado');
      setLoading(false);
      return;
    }

    // 3. Obtener menú usando el token
    try {
      const menuData = await getMenuByToken(token);
      console.log('Respuesta menu:', menuData);

      // Navegar a Menu con el menú y el nombre
      navigation.replace('Menu', { menu: menuData, nombre: nombre.trim() });
    } catch (menuErr) {
      Alert.alert('Error', 'No se pudo obtener el menú: ' + (menuErr.message || menuErr));
      setLoading(false);
      return;
    }
  } catch (err) {
    Alert.alert('Error', 'Error inesperado: ' + (err.message || err));
    setLoading(false);
    return;
  }
};

return ( <View style={styles.container}> <Text style={styles.title}>COMANDAPP</Text> <Text style={styles.subtitle}>Sistema de Pedidos</Text>

  <TextInput
    style={styles.input}
    placeholder="Ingresa tu nombre"
    value={nombre}
    onChangeText={setNombre}
  />

  <TouchableOpacity style={styles.button} onPress={handleContinuar} disabled={loading}>
    {loading ? (
      <ActivityIndicator color="#fff" size="small" />
    ) : (
      <Text style={styles.buttonText}>Continuar</Text>
    )}
  </TouchableOpacity>
</View>
);
}

const styles = StyleSheet.create({
container: { flex: 1, justifyContent: 'center', padding: 32, backgroundColor: '#fff' },
title: { fontSize: 36, fontWeight: 'bold', textAlign: 'center', marginBottom: 8 },
subtitle: { fontSize: 16, textAlign: 'center', color: '#666', marginBottom: 48 },
input: { borderWidth: 1, borderColor: '#ddd', borderRadius: 8, padding: 16, marginBottom: 16, fontSize: 16 },
button: { backgroundColor: '#FF6B35', borderRadius: 8, padding: 16, alignItems: 'center', marginTop: 8 },
buttonText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
});