import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter } from 'expo-router';

export default function NewOrganization() {
  const router = useRouter();

  const [orgName, setOrgName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={{ flex: 1 }}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.container}>
          <Text style={styles.title}>New Organization</Text>

          {/* Input Fields */}
          <TextInput
            style={styles.input}
            placeholder="Organization Name"
            value={orgName}
            onChangeText={setOrgName}
            placeholderTextColor="#7a7a7a"
          />

          <TextInput
            style={styles.input}
            placeholder="Contact Email"
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

          <TextInput
            style={styles.input}
            placeholder="Re-enter Password"
            secureTextEntry
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            placeholderTextColor="#7a7a7a"
          />

          {/* Register Button */}
          <TouchableOpacity style={styles.button}>
            <Text style={styles.buttonText}>Register</Text>
          </TouchableOpacity>

          {/* Go back link */}
          <TouchableOpacity onPress={() => router.back()} style={styles.backLink}>
            <Text style={styles.backText}>← Back to Home</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60, 
    backgroundColor: '#fbfaf2',
  },
  container: {
    width: '90%',
    alignItems: 'center',
    backgroundColor: '#fbfaf2',
    paddingHorizontal: 10, 
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
    paddingVertical: 14, 
    paddingHorizontal: 20,
    borderRadius: 10,
    marginBottom: 18,
    fontSize: 16,
    color: '#000',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 3,
    elevation: 1,

    borderWidth: 0.5,
    borderColor: '#1bb998',
  },
  button: {
    backgroundColor: '#1bb998',
    borderRadius: 25,
    paddingVertical: 14,
    paddingHorizontal: 60, 
    marginTop: 15,
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
    marginTop: 30, 
  },
  backText: {
    color: '#1bb998',
    fontWeight: '600',
  },
});
