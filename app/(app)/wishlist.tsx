import { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { ArrowLeft, Heart, Trash2, ShoppingBag } from 'lucide-react-native';
import { useNotification } from '@/contexts/NotificationContext';
import { getWishlist, removeFromWishlist } from '@/services/api';
import { WishlistItem } from '@/types';
import EventCard from '@/components/EventCard';

export default function WishlistScreen() {
  const { showNotification } = useNotification();
  const [wishlist, setWishlist] = useState<WishlistItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [removingItems, setRemovingItems] = useState<Set<string>>(new Set());

  useEffect(() => {
    loadWishlist();
  }, []);

  const loadWishlist = async () => {
    try {
      const data = await getWishlist();
      setWishlist(data);
    } catch (error) {
      showNotification('Erreur lors du chargement de la wishlist', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveFromWishlist = (item: WishlistItem) => {
    Alert.alert(
      "Supprimer de la Wishlist",
      `Êtes-vous sûr de vouloir supprimer "${item.event.title}" de votre wishlist ?`,
      [
        {
          text: "Annuler",
          style: "cancel"
        },
        {
          text: "Supprimer",
          style: "destructive",
          onPress: () => confirmRemoveFromWishlist(item.id)
        }
      ]
    );
  };

  const confirmRemoveFromWishlist = async (itemId: string) => {
    setRemovingItems(prev => new Set(prev).add(itemId));
    try {
      await removeFromWishlist(itemId);
      setWishlist(prev => prev.filter(item => item.id !== itemId));
      showNotification('Supprimé de la wishlist', 'success');
    } catch (error) {
      showNotification('Erreur lors de la suppression', 'error');
    } finally {
      setRemovingItems(prev => {
        const newSet = new Set(prev);
        newSet.delete(itemId);
        return newSet;
      });
    }
  };

  const WishlistItemCard = ({ item }: { item: WishlistItem }) => (
    <View className="bg-background-card rounded-xl overflow-hidden mb-4">
      <EventCard event={item.event} />
      <View className="p-4 border-t border-gray-700">
        <View className="flex-row justify-between items-center">
          <View>
            <Text className="text-gray-400 font-['Montserrat-Regular'] text-sm">
              Ajouté le {new Date(item.addedDate).toLocaleDateString('fr-FR')}
            </Text>
          </View>
          <View className="flex-row gap-2">
            <TouchableOpacity
              onPress={() => router.push({
                pathname: '/(app)/event-details',
                params: { id: item.event.id }
              })}
              className="bg-primary-600 px-4 py-2 rounded-lg flex-row items-center"
            >
              <ShoppingBag size={16} color="white" className="mr-1" />
              <Text className="text-white font-['Montserrat-SemiBold'] text-sm">
                Réserver
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => handleRemoveFromWishlist(item)}
              disabled={removingItems.has(item.id)}
              className="bg-red-500/10 border border-red-500 px-3 py-2 rounded-lg"
            >
              {removingItems.has(item.id) ? (
                <ActivityIndicator size="small" color="#ef4444" />
              ) : (
                <Trash2 size={16} color="#ef4444" />
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );

  return (
    <SafeAreaView className="flex-1 bg-background-dark">
      <StatusBar style="light" />
      <View className="flex-1">
        <View className="p-6 border-b border-gray-800">
          <View className="flex-row items-center justify-between mb-2">
            <TouchableOpacity 
              onPress={() => router.back()}
              className="p-2 rounded-full bg-background-elevated"
            >
              <ArrowLeft size={24} color="#fff" />
            </TouchableOpacity>
            <View className="flex-row items-center">
              <Heart size={24} color="#8b5cf6" fill="#8b5cf6" />
              {wishlist.length > 0 && (
                <View className="bg-primary-600 rounded-full w-6 h-6 items-center justify-center ml-2">
                  <Text className="text-white font-['Montserrat-Bold'] text-xs">
                    {wishlist.length}
                  </Text>
                </View>
              )}
            </View>
          </View>
          <Text className="text-white font-['Montserrat-Bold'] text-2xl">
            Ma Wishlist
          </Text>
          <Text className="text-gray-400 font-['Montserrat-Regular']">
            Événements que vous souhaitez réserver plus tard
          </Text>
        </View>

        {isLoading ? (
          <View className="flex-1 justify-center items-center">
            <ActivityIndicator size="large" color="#8b5cf6" />
            <Text className="text-gray-400 font-['Montserrat-Medium'] mt-4">
              Chargement de votre wishlist...
            </Text>
          </View>
        ) : (
          <ScrollView 
            className="flex-1 p-6"
            showsVerticalScrollIndicator={false}
          >
            {wishlist.length > 0 ? (
              <>
                {wishlist.map(item => (
                  <WishlistItemCard key={item.id} item={item} />
                ))}
              </>
            ) : (
              <View className="flex-1 justify-center items-center py-20">
                <View className="bg-background-card p-8 rounded-full mb-6">
                  <Heart size={48} color="#6b7280" />
                </View>
                <Text className="text-white font-['Montserrat-Bold'] text-xl mb-2">
                  Votre wishlist est vide
                </Text>
                <Text className="text-gray-400 font-['Montserrat-Regular'] text-center mb-6 px-4">
                  Explorez les événements et ajoutez ceux qui vous intéressent à votre wishlist
                </Text>
                <TouchableOpacity
                  onPress={() => router.push('/(app)/(tabs)/search')}
                  className="bg-primary-600 px-6 py-3 rounded-xl"
                >
                  <Text className="text-white font-['Montserrat-SemiBold']">
                    Explorer les Événements
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </ScrollView>
        )}
      </View>
    </SafeAreaView>
  );
}