import { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet, ActivityIndicator } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { ArrowLeft, CreditCard, Smartphone, Plus, Minus } from 'lucide-react-native';
import { getEventById, processPayment } from '@/services/api';
import { EventType, EventPrice } from '@/types';
import { useNotification } from '@/contexts/NotificationContext';

export default function PaymentScreen() {
  const { eventId } = useLocalSearchParams<{ eventId: string }>();
  const { showNotification } = useNotification();
  const [event, setEvent] = useState<EventType | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'mobile'>('card');
  const [cardNumber, setCardNumber] = useState('');
  const [cardName, setCardName] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Ticket selection state
  const [selectedPriceCategory, setSelectedPriceCategory] = useState<EventPrice | null>(null);
  const [ticketQuantity, setTicketQuantity] = useState(1);

  useEffect(() => {
    const loadEvent = async () => {
      if (!eventId) return;
      
      try {
        const data = await getEventById(eventId);
        setEvent(data);
        // Set default price category to the first one
        if (data.prices && data.prices.length > 0) {
          setSelectedPriceCategory(data.prices[0]);
        }
      } catch (error) {
        showNotification('Failed to load event details', 'error');
        router.back();
      } finally {
        setIsLoading(false);
      }
    };

    loadEvent();
  }, [eventId]);

  const handleQuantityChange = (increment: boolean) => {
    if (increment) {
      setTicketQuantity(prev => Math.min(prev + 1, 10)); // Max 10 tickets
    } else {
      setTicketQuantity(prev => Math.max(prev - 1, 1)); // Min 1 ticket
    }
  };

  const getTotalPrice = () => {
    if (!selectedPriceCategory) return 0;
    return selectedPriceCategory.amount * ticketQuantity;
  };

  const handlePayment = async () => {
    if (!event || !selectedPriceCategory) return;

    // Basic validation
    if (paymentMethod === 'card') {
      if (!cardNumber || !cardName || !cardExpiry || !cardCvv) { 
        showNotification('Remplissez tous les détails de votre carte !', 'error');
        return;
      }
    } else if (paymentMethod === 'mobile') {
      if (!mobileNumber) {
        showNotification('Veuillez saisir votre numéro de téléphone !', 'error');
        return;
      }
    }

    setIsProcessing(true);
    try {
      const paymentData = {
        eventId: event.id,
        priceCategory: selectedPriceCategory.category,
        quantity: ticketQuantity,
        totalAmount: getTotalPrice(),
        method: paymentMethod,
        ...(paymentMethod === 'card' ? {
          cardNumber,
          cardName,
          cardExpiry,
          cardCvv
        } : {
          mobileNumber
        })
      };

      const result = await processPayment(paymentData);
      router.push({
        pathname: '/(app)/ticket',
        params: { ticketId: result.ticketId }
      });
      showNotification('Paiement effectué avec succès!', 'success');
    } catch (error) {
      showNotification('Paiement échoué', 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  if (isLoading) {
    return (
      <View className="flex-1 bg-background-dark justify-center items-center">
        <ActivityIndicator size="large" color="#8b5cf6" />
      </View>
    );
  }

  if (!event) {
    return (
      <View className="flex-1 bg-background-dark justify-center items-center p-6">
        <Text className="text-white font-['Montserrat-Medium'] text-lg text-center">
          Événement non trouvé !
        </Text>
        <TouchableOpacity 
          onPress={() => router.back()}
          className="mt-4 bg-primary-600 px-6 py-3 rounded-xl"
        >
          <Text className="text-white font-['Montserrat-SemiBold']">
            Revenir en arrière
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

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

          <Text className="text-white font-['Montserrat-Bold'] text-2xl mb-6">
            Réservation de Billets
          </Text>

          {/* Event Info */}
          <View className="bg-background-card rounded-xl p-4 mb-6">
            <Text className="text-gray-400 font-['Montserrat-Medium'] mb-2">
              Événement
            </Text>
            <Text className="text-white font-['Montserrat-SemiBold'] text-lg mb-1">
              {event.title}
            </Text>
            <Text className="text-gray-300 font-['Montserrat-Regular'] mb-3">
              {event.date} • {event.time_start}
            </Text>
          </View>

          {/* Ticket Type Selection */}
          <View className="mb-6">
            <Text className="text-white font-['Montserrat-Bold'] text-lg mb-4">
              Type de Billet
            </Text>
            <View className="gap-3">
              {event.prices.map((price) => (
                <TouchableOpacity
                  key={price.id}
                  onPress={() => setSelectedPriceCategory(price)}
                  className={`p-4 rounded-xl border-2 ${
                    selectedPriceCategory?.id === price.id
                      ? 'bg-primary-600/20 border-primary-600'
                      : 'bg-background-card border-gray-700'
                  }`}
                >
                  <View className="flex-row justify-between items-center">
                    <View>
                      <Text className="text-white font-['Montserrat-SemiBold'] text-base">
                        {price.category.charAt(0).toUpperCase() + price.category.slice(1)}
                      </Text>
                      <Text className="text-gray-400 font-['Montserrat-Regular'] text-sm">
                        Billet {price.category}
                      </Text>
                    </View>
                    <Text className="text-white font-['Montserrat-Bold'] text-lg">
                      {price.amount.toFixed(2)} {price.currency.toUpperCase()}
                    </Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Quantity Selection */}
          <View className="mb-6">
            <Text className="text-white font-['Montserrat-Bold'] text-lg mb-4">
              Nombre de Billets
            </Text>
            <View className="bg-background-card rounded-xl p-4">
              <View className="flex-row items-center justify-between">
                <TouchableOpacity
                  onPress={() => handleQuantityChange(false)}
                  className="w-10 h-10 bg-background-elevated rounded-full items-center justify-center"
                  disabled={ticketQuantity <= 1}
                >
                  <Minus size={20} color={ticketQuantity <= 1 ? "#6b7280" : "#fff"} />
                </TouchableOpacity>
                
                <View className="items-center">
                  <Text className="text-white font-['Montserrat-Bold'] text-2xl">
                    {ticketQuantity}
                  </Text>
                  <Text className="text-gray-400 font-['Montserrat-Regular'] text-sm">
                    {ticketQuantity === 1 ? 'billet' : 'billets'}
                  </Text>
                </View>
                
                <TouchableOpacity
                  onPress={() => handleQuantityChange(true)}
                  className="w-10 h-10 bg-background-elevated rounded-full items-center justify-center"
                  disabled={ticketQuantity >= 10}
                >
                  <Plus size={20} color={ticketQuantity >= 10 ? "#6b7280" : "#fff"} />
                </TouchableOpacity>
              </View>
            </View>
          </View>

          {/* Total Price */}
          <View className="bg-background-card rounded-xl p-4 mb-6">
            <View className="flex-row justify-between items-center">
              <Text className="text-gray-300 font-['Montserrat-Regular']">
                Total ({ticketQuantity} {ticketQuantity === 1 ? 'billet' : 'billets'})
              </Text>
              <Text className="text-white font-['Montserrat-Bold'] text-xl">
                {getTotalPrice().toFixed(2)} {selectedPriceCategory?.currency.toUpperCase()}
              </Text>
            </View>
          </View>

          {/* Payment Method */}
          <Text className="text-white font-['Montserrat-Bold'] text-lg mb-4">
            Méthode de Paiement
          </Text>

          <View className="flex-row gap-4 mb-6">
            <TouchableOpacity 
              onPress={() => setPaymentMethod('card')}
              className={`flex-1 p-4 rounded-xl flex-row items-center justify-center ${
                paymentMethod === 'card' ? 'bg-primary-600' : 'bg-background-card'
              }`}
            >
              <CreditCard size={20} color={paymentMethod === 'card' ? '#fff' : '#8b5cf6'} className="mr-2" />
              <Text className={`font-['Montserrat-SemiBold'] ${
                paymentMethod === 'card' ? 'text-white' : 'text-gray-300'
              }`}>
                Carte
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              onPress={() => setPaymentMethod('mobile')}
              className={`flex-1 p-4 rounded-xl flex-row items-center justify-center ${
                paymentMethod === 'mobile' ? 'bg-primary-600' : 'bg-background-card'
              }`}
            >
              <Smartphone size={20} color={paymentMethod === 'mobile' ? '#fff' : '#8b5cf6'} className="mr-2" />
              <Text className={`font-['Montserrat-SemiBold'] ${
                paymentMethod === 'mobile' ? 'text-white' : 'text-gray-300'
              }`}>
                Mobile
              </Text>
            </TouchableOpacity>
          </View>

          {/* Payment Form */}
          {paymentMethod === 'card' ? (
            <View className="gap-4 mb-8">
              <View>
                <Text className="text-white font-['Montserrat-Medium'] mb-2">Numéro de la Carte</Text>
                <TextInput
                  value={cardNumber}
                  onChangeText={setCardNumber}
                  placeholder="0000 0000 0000 0000"
                  placeholderTextColor="#6b7280"
                  className="bg-background-elevated text-white p-4 rounded-xl font-['Montserrat-Regular']"
                  keyboardType="number-pad"
                  maxLength={19}
                />
              </View>
              
              <View>
                <Text className="text-white font-['Montserrat-Medium'] mb-2">Nom du titulaire de la carte</Text>
                <TextInput
                  value={cardName}
                  onChangeText={setCardName}
                  placeholder="John Doe"
                  placeholderTextColor="#6b7280"
                  className="bg-background-elevated text-white p-4 rounded-xl font-['Montserrat-Regular']"
                />
              </View>
              
              <View className="flex-row gap-4">
                <View className="flex-1">
                  <Text className="text-white font-['Montserrat-Medium'] mb-2">Date d'Expiration</Text>
                  <TextInput
                    value={cardExpiry}
                    onChangeText={setCardExpiry}
                    placeholder="MM/YY"
                    placeholderTextColor="#6b7280"
                    className="bg-background-elevated text-white p-4 rounded-xl font-['Montserrat-Regular']"
                    keyboardType="number-pad"
                    maxLength={5}
                  />
                </View>
                
                <View className="flex-1">
                  <Text className="text-white font-['Montserrat-Medium'] mb-2">CVV</Text>
                  <TextInput
                    value={cardCvv}
                    onChangeText={setCardCvv}
                    placeholder="123"
                    placeholderTextColor="#6b7280"
                    className="bg-background-elevated text-white p-4 rounded-xl font-['Montserrat-Regular']"
                    keyboardType="number-pad"
                    maxLength={3}
                    secureTextEntry
                  />
                </View>
              </View>
            </View>
          ) : (
            <View className="mb-8">
              <Text className="text-white font-['Montserrat-Medium'] mb-2">Numéro de Téléphone</Text>
              <TextInput
                value={mobileNumber}
                onChangeText={setMobileNumber}
                placeholder="Entrer votre numéro de téléphone"
                placeholderTextColor="#6b7280"
                className="bg-background-elevated text-white p-4 rounded-xl font-['Montserrat-Regular']"
                keyboardType="phone-pad"
              />
            </View>
          )}

          <TouchableOpacity
            onPress={handlePayment}
            className="bg-primary-600 py-4 rounded-xl w-full items-center"
            disabled={isProcessing || !selectedPriceCategory}
            activeOpacity={0.8}
          >
            {isProcessing ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text className="font-['Montserrat-SemiBold'] text-white text-lg">
                Payer {getTotalPrice().toFixed(2)} {selectedPriceCategory?.currency.toUpperCase()}
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}