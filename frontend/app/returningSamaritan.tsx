import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';

export default function ReturningSamaritan() {
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Returning Samaritan</Text>

      {/* Input Fields */}
      <TextInput
        style={styles.input}
        placeholder="Email Address"
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
        placeholderTextColor="#7a7a7a"
      />

      <TextInput
        style={styles.input}
        placeholder="Password"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
        placeholderTextColor="#7a7a7a"
      />

      {/* Login Button */}
      <TouchableOpacity style={styles.button}>
        <Text style={styles.buttonText}>Login</Text>
      </TouchableOpacity>

      {/* Go back link */}
      <TouchableOpacity onPress={() => router.back()} style={styles.backLink}>
        <Text style={styles.backText}>← Back to Home</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fbfaf2', 
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 30,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1bb998',
    marginBottom: 40,
    textAlign: 'center',
  },
  input: {
    width: '100%',
    backgroundColor: '#fff',
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderRadius: 10,
    marginBottom: 15,
    fontSize: 16,
    color: '#000',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 3,
    elevation: 1,

    borderWidth: 0.25,
    borderColor: '#1bb998',
  },
  button: {
    backgroundColor: '#1bb998', 
    borderRadius: 25,
    paddingVertical: 14,
    paddingHorizontal: 40,
    marginTop: 10,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 4,
    elevation: 2,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fbfaf2',
  },
  backLink: {
    marginTop: 20,
  },
  backText: {
    color: '#1bb998',
    fontWeight: '600',
  },
});
