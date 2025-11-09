import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { useRouter } from 'expo-router';

export default function NewOrganization() {
  const router = useRouter();

  const [orgName, setOrgName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [passwordError, setPasswordError] = useState<string>('');
  const [emailError, setEmailError] = useState<string>('');

  const handlePasswordChange = (text: string) => {
    setPassword(text);
    if (confirmPassword && text !== confirmPassword) {
      setPasswordError('Passwords do not match.');
    } else {
      setPasswordError('');
    }
  };

  const handleConfirmPasswordChange = (text: string) => {
    setConfirmPassword(text);
    if (password && text !== password) {
      setPasswordError('Passwords do not match.');
    } else {
      setPasswordError('');
    }
  };

  const handleEmailChange = (text: string) => {
    setEmail(text);

    // Simple but robust regex for basic email structure
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    // Check validity only if user typed something
    if (text.length === 0) {
      setEmailError('');
    } else if (!emailPattern.test(text.trim())) {
      setEmailError('Please enter a valid email address.');
    } else {
      setEmailError('');
    }
  };

  const handleRegister = () => {
    if (
      orgName.trim() === '' ||
      email.trim() === '' ||
      password.trim() === '' ||
      confirmPassword.trim() === ''
    ) {
      Alert.alert('Missing Information', 'Please ensure that all fields are completed.');
      return;
    }

    if (emailError || passwordError) {
      Alert.alert('Invalid Fields', 'Please fix the highlighted errors before proceeding.');
      return;
    }

    Alert.alert('Registration Successful', 'Your organization account has been created.');
    router.back();
  };

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
            onChangeText={(text: string) => setOrgName(text)}
            placeholderTextColor="#7a7a7a"
          />

          <TextInput
            style={styles.input}
            placeholder="Contact Email"
            keyboardType="email-address"
            autoCapitalize="none"
            value={email}
            onChangeText={handleEmailChange}
            placeholderTextColor="#7a7a7a"
          />

          {emailError.length > 0 && (
            <Text style={styles.errorText}>{emailError}</Text>
          )}

          <TextInput
            style={styles.input}
            placeholder="Password"
            secureTextEntry
            value={password}
            onChangeText={handlePasswordChange}
            placeholderTextColor="#7a7a7a"
          />

          <TextInput
            style={styles.input}
            placeholder="Re-enter Password"
            secureTextEntry
            value={confirmPassword}
            onChangeText={handleConfirmPasswordChange}
            placeholderTextColor="#7a7a7a"
          />

          {passwordError.length > 0 && (
            <Text style={styles.errorText}>{passwordError}</Text>
          )}

          {/* Register Button */}
          <TouchableOpacity style={styles.button} onPress={handleRegister}>
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
  errorText: {
    color: 'red',
    fontSize: 14,
    marginBottom: 8,
    fontWeight: '500',
    textAlign: 'center',
  },
  button: {
    backgroundColor: '#1bb998',
    borderRadius: 25,
    paddingVertical: 14,
    paddingHorizontal: 60,
    marginTop: 5,
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
