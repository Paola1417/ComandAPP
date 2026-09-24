import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator, TouchableOpacity } from 'react-native';

export default function MenuScreen({ navigation, route }) {
  const nombre = route.params?.nombre || '';
  // Estructura real del menú: array de categorías, cada una con nombre, descripcion y productos[]
  // [
  //   {
  //     nombre: "Prueba",
  //     descripcion: "Categoria de prueba para el flujo academico",
  //     productos: [
  //       { id: 2, tipo: "bebida", ... }
  //     ]
  //   }
  // ]
  const menu = route.params?.menu || [];

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Procesar la estructura de categorías y aplanar los productos
    if (menu && menu.length > 0) {
      // Aplanar todos los productos de todas las categorías
      const allProducts = menu.flatMap(categoria => categoria.productos || []);
      setProducts(allProducts);
      setLoading(false);
    } else {
      setError('No hay menú disponible');
      setLoading(false);
    }
  }, [menu]);

  const handleLogout = () => {
    navigation.goBack();
  };

  const renderProduct = ({ item }) => {
    // item tiene: id y tipo (según la estructura del backend)
    return (
      <View style={styles.productCard}>
        <Text style={styles.productName}>{item.nombre || item.tipo || 'Producto'}</Text>
        <Text style={styles.productDesc}>{item.descripcion || 'Sin descripción'}</Text>
        <Text style={styles.productPrice}>{item.precio != null ? item.precio.toLocaleString('es-CO') : 'Sin precio'}</Text>
      </View>
    );
  };

  const renderContent = () => {
    if (loading) {
      return (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#FF6B35" />
          <Text style={styles.loadingText}>Cargando menú...</Text>
        </View>
      );
    }
    if (error) {
      return (
        <View style={styles.center}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={() => navigation.goBack()}>
            <Text style={styles.retryText}>Volver</Text>
          </TouchableOpacity>
        </View>
      );
    }
    if (products.length === 0) {
      return (
        <View style={styles.center}>
          <Text style={styles.emptyText}>No hay productos disponibles</Text>
        </View>
      );
    }
    return null;
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Hola, {nombre}</Text>

        <TouchableOpacity onPress={handleLogout}>
          <Text style={styles.logoutText}>Salir</Text>
        </TouchableOpacity>
      </View>

      {renderContent()}

      {products.length > 0 && (
        <FlatList
          data={products}
          renderItem={renderProduct}
          keyExtractor={(item) => (item.id ? item.id.toString() : Math.random().toString(36))}
          contentContainerStyle={styles.list}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5'
  },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#FF6B35'
  },

  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff'
  },

  logoutText: {
    color: '#fff',
    fontSize: 16
  },

  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32
  },

  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666'
  },

  errorText: {
    fontSize: 16,
    color: '#d32f2f',
    textAlign: 'center',
    marginBottom: 16
  },

  retryButton: {
    backgroundColor: '#FF6B35',
    borderRadius: 8,
    padding: 12,
    paddingHorizontal: 24
  },

  retryText: {
    color: '#fff',
    fontSize: 16
  },

  list: {
    padding: 16
  },

  productCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    elevation: 3
  },

  productName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333'
  },

  productDesc: {
    fontSize: 14,
    color: '#666',
    marginTop: 4
  },

  productPrice: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4CAF50',
    marginTop: 8
  },

  emptyText: {
    fontSize: 16,
    color: '#999'
  }
});