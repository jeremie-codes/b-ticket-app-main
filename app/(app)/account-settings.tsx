import { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { ArrowLeft, Camera, User, Mail, Save } from 'lucide-react-native';
import { useAuth } from '@/contexts/AuthContext';
import { useNotification } from '@/contexts/NotificationContext';
import { updateUserProfile } from '@/services/api';

export default function AccountSettingsScreen() {
  const { user, login } = useAuth();
  const { showNotification } = useNotification();
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [isLoading, setIsLoading] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    const nameChanged = name !== user?.name;
    const emailChanged = email !== user?.email;
    setHasChanges(nameChanged || emailChanged);
  }, [name, email, user]);

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSave = async () => {
    if (!name.trim()) {
      showNotification('Le nom est requis', 'error');
      return;
    }

    if (!email.trim()) {
      showNotification('L\'email est requis', 'error');
      return;
    }

    if (!validateEmail(email)) {
      showNotification('Format d\'email invalide', 'error');
      return;
    }

    setIsLoading(true);
    try {
      const result = await updateUserProfile({
        name: name.trim(),
        email: email.trim(),
        profileImage: user?.profileImage
      });

      if (result.success) {
        // Update the auth context with new user data
        // In a real app, you might want to refresh the user data from the server
        showNotification('Profil mis à jour avec succès', 'success');
        setHasChanges(false);
      }
    } catch (error) {
      showNotification('Erreur lors de la mise à jour du profil', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleProfileImagePress = () => {
    Alert.alert(
      "Photo de Profil",
      "Cette fonctionnalité sera disponible prochainement",
      [{ text: "OK" }]
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-background-dark">
      <StatusBar style="light" />
      <ScrollView showsVerticalScrollIndicator={false}>
        <View className="p-6">
          <TouchableOpacity 
            onPress={() => router.back()}
            className="p-2 rounded-full bg-background-elevated self-start mb-6"
          >
            <ArrowLeft size={24} color="#fff" />
          </TouchableOpacity>

          <Text className="text-white font-['Montserrat-Bold'] text-2xl mb-8">
            Paramètres de Compte
          </Text>

          {/* Profile Picture Section */}
          <View className="items-center mb-8">
            <TouchableOpacity 
              onPress={handleProfileImagePress}
              className="relative"
            >
              <View className="bg-primary-600 w-24 h-24 rounded-full items-center justify-center">
                <Text className="text-white font-['Montserrat-Bold'] text-3xl">
                  {name.charAt(0).toUpperCase() || 'U'}
                </Text>
              </View>
              <View className="absolute -bottom-2 -right-2 bg-background-card p-2 rounded-full border-2 border-background-dark">
                <Camera size={16} color="#8b5cf6" />
              </View>
            </TouchableOpacity>
            <Text className="text-gray-400 font-['Montserrat-Regular'] text-sm mt-2">
              Appuyez pour changer la photo
            </Text>
          </View>

          {/* Form Section */}
          <View className="bg-background-card rounded-xl p-5 mb-6">
            <Text className="text-white font-['Montserrat-SemiBold'] text-lg mb-4">
              Informations Personnelles
            </Text>

            <View className="mb-4">
              <Text className="text-white font-['Montserrat-Medium'] mb-2">
                Nom Complet
              </Text>
              <View className="flex-row items-center bg-background-elevated rounded-xl p-4">
                <User size={20} color="#8b5cf6" className="mr-3" />
                <TextInput
                  value={name}
                  onChangeText={setName}
                  placeholder="Entrez votre nom complet"
                  placeholderTextColor="#6b7280"
                  className="text-white font-['Montserrat-Regular'] flex-1"
                />
              </View>
            </View>

            <View className="mb-6">
              <Text className="text-white font-['Montserrat-Medium'] mb-2">
                Adresse Email
              </Text>
              <View className="flex-row items-center bg-background-elevated rounded-xl p-4">
                <Mail size={20} color="#8b5cf6" className="mr-3" />
                <TextInput
                  value={email}
                  onChangeText={setEmail}
                  placeholder="Entrez votre email"
                  placeholderTextColor="#6b7280"
                  className="text-white font-['Montserrat-Regular'] flex-1"
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>
            </View>

            <TouchableOpacity
              onPress={handleSave}
              disabled={!hasChanges || isLoading}
              className={`flex-row items-center justify-center py-4 rounded-xl ${
                hasChanges && !isLoading 
                  ? 'bg-primary-600' 
                  : 'bg-gray-600'
              }`}
            >
              {isLoading ? (
                <ActivityIndicator color="white" />
              ) : (
                <>
                  <Save size={20} color="white" className="mr-2" />
                  <Text className="text-white font-['Montserrat-SemiBold'] text-base">
                    Sauvegarder les Modifications
                  </Text>
                </>
              )}
            </TouchableOpacity>
          </View>

          {/* Info Section */}
          <View className="bg-background-card rounded-xl p-5">
            <Text className="text-white font-['Montserrat-SemiBold'] text-lg mb-3">
              Informations du Compte
            </Text>
            <View className="space-y-3">
              <View className="flex-row justify-between">
                <Text className="text-gray-400 font-['Montserrat-Regular']">
                  ID du Compte
                </Text>
                <Text className="text-white font-['Montserrat-Medium']">
                  #{user?.id || 'N/A'}
                </Text>
              </View>
              <View className="flex-row justify-between">
                <Text className="text-gray-400 font-['Montserrat-Regular']">
                  Membre depuis
                </Text>
                <Text className="text-white font-['Montserrat-Medium']">
                  Janvier 2025
                </Text>
              </View>
              <View className="flex-row justify-between">
                <Text className="text-gray-400 font-['Montserrat-Regular']">
                  Statut du Compte
                </Text>
                <View className="bg-green-500/10 px-3 py-1 rounded-full">
                  <Text className="text-green-500 font-['Montserrat-Medium'] text-sm">
                    Actif
                  </Text>
                </View>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}