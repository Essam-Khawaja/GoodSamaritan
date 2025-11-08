import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router'; 

export default function LandingPage() {
  const router = useRouter(); 

  return (
    <View style={styles.container}>
      <Text style={styles.title}>GoodSamaritan</Text>
      {/* Samaritan Buttons */}
      <View style={styles.row}>
        <TouchableOpacity
          style={styles.button}
          onPress={() => router.push('/becomeSamaritan')}
        >
          <Text style={styles.buttonText}>Become a Samaritan</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.button}>
          <Text style={styles.buttonText}>Returning Samaritan</Text>
        </TouchableOpacity>
      </View>

      {/* Organization Buttons */}
      <View style={styles.row}>
        <TouchableOpacity
            style={styles.button}
            onPress={() => router.push('/newOrganization')}
            >
            <Text style={styles.buttonText}>New Organization</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button}>
          <Text style={styles.buttonText}>Returning Organization</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fbfaf2',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1bb998',
    marginBottom: 50,
    textAlign: 'center',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#1bb998',
    borderRadius: 30,
    paddingVertical: 16,
    paddingHorizontal: 24,
    marginHorizontal: 8,
    width: 160,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 3,
  },
  buttonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#fbfaf2',
    textAlign: 'center',
  },
});
