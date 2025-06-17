import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { User, EventType, TicketType, CategoryType, WishlistItem } from '@/types';

// In a real app, this would be an environment variable
const API_URL = 'https://testv2.b-tickets-app.com/api';

// For demo purposes, we're simulating API calls
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Mock data
const mockEvents: EventType[] = [
  {
    id: '1',
    title: 'Summer Music Festival',
    description: 'Join us for the biggest music festival of the year! Featuring top artists from around the world, this three-day event will be filled with amazing performances, great food, and unforgettable memories. Bring your friends and enjoy the summer vibes!',
    date: '2025-07-15',
    time: '16:00',
    location: 'Central Park, New York',
    price: 89.99,
    image: 'https://images.pexels.com/photos/1190297/pexels-photo-1190297.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    category: '1',
    featured: true,
    isFavorite: false
  },
  {
    id: '2',
    title: 'Tech Conference 2025',
    description: 'The most anticipated tech conference of the year is back! Learn about the latest technologies, attend workshops, and network with industry professionals. This is your chance to stay ahead in the tech world.',
    date: '2025-09-20',
    time: '09:00',
    location: 'Convention Center, San Francisco',
    price: 199.99,
    image: 'https://images.pexels.com/photos/2774556/pexels-photo-2774556.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    category: '2',
    featured: true,
    isFavorite: false
  },
  {
    id: '3',
    title: 'International Food Festival',
    description: 'Taste cuisines from around the world at our International Food Festival. With over 50 food stalls representing different countries, this is a food lover\'s paradise. Don\'t miss the cooking demonstrations by renowned chefs!',
    date: '2025-06-10',
    time: '12:00',
    location: 'Riverfront Park, Chicago',
    price: 45.00,
    image: 'https://images.pexels.com/photos/5379707/pexels-photo-5379707.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    category: '3',
    featured: false,
    isFavorite: false
  },
  {
    id: '4',
    title: 'Art & Design Expo',
    description: 'Explore the world of art and design at our annual expo. See works from emerging and established artists, attend panel discussions, and participate in interactive workshops. Perfect for art enthusiasts and professionals alike.',
    date: '2025-08-05',
    time: '10:00',
    location: 'Modern Art Gallery, Los Angeles',
    price: 25.00,
    image: 'https://images.pexels.com/photos/1509534/pexels-photo-1509534.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    category: '4',
    featured: false,
    isFavorite: false
  },
  {
    id: '5',
    title: 'Marathon City Run',
    description: 'Challenge yourself with our annual city marathon. The 42km route takes you through the most scenic parts of the city. All participants receive a medal, and prizes are awarded to top finishers. Register now to secure your spot!',
    date: '2025-10-12',
    time: '07:00',
    location: 'Downtown, Boston',
    price: 75.00,
    image: 'https://images.pexels.com/photos/2774895/pexels-photo-2774895.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    category: '5',
    featured: true,
    isFavorite: false
  },
  {
    id: '6',
    title: 'Comedy Night Special',
    description: 'Laugh your heart out at our Comedy Night Special. We\'ve brought together the funniest comedians for an evening of entertainment. Grab your tickets now for a night filled with laughter and fun!',
    date: '2025-07-28',
    time: '20:00',
    location: 'Comedy Club, Austin',
    price: 35.00,
    image: 'https://images.pexels.com/photos/713149/pexels-photo-713149.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    category: '6',
    featured: false,
    isFavorite: false
  }
];

const mockCategories: CategoryType[] = [
  { id: '1', name: 'Music' },
  { id: '2', name: 'Technology' },
  { id: '3', name: 'Food & Drink' },
  { id: '4', name: 'Art & Culture' },
  { id: '5', name: 'Sports' },
  { id: '6', name: 'Entertainment' }
];

const mockTickets: TicketType[] = [
  {
    id: 'ticket1',
    event: mockEvents[0],
    status: 'active',
    purchaseDate: '2025-05-10',
    qrCode: 'https://example.com/qr/ticket1'
  },
  {
    id: 'ticket2',
    event: mockEvents[2],
    status: 'used',
    purchaseDate: '2025-04-15',
    qrCode: 'https://example.com/qr/ticket2'
  },
  {
    id: 'ticket3',
    event: mockEvents[4],
    status: 'expired',
    purchaseDate: '2024-12-20',
    qrCode: 'https://example.com/qr/ticket3'
  }
];

const mockWishlist: WishlistItem[] = [
  {
    id: 'wish1',
    event: mockEvents[1],
    addedDate: '2025-01-10'
  },
  {
    id: 'wish2',
    event: mockEvents[3],
    addedDate: '2025-01-08'
  }
];

// Auth functions
export const login = async (email: string, password: string) => {
  try {

    const response = await axios.post(`${API_URL}/auth/login`, {
      email,
      password,
    });

    const { token, user } = response.data.data;

    //Stocke le token
    // await AsyncStorage.setItem('@b_ticket_token', token);

    //Configure les intercepteurs pour les requêtes futures
    await setupApiInterceptors();

    return { user, token };
  } catch (error: any) {
    // showNotification(error.response?.data?.message || 'Connexion échoouée !', 'error');
    throw Error(error.response?.data?.message || 'Login failed');
  }
};

export const register = async (name: string, email: string, password: string) => {

  try {

    const response = await axios.post(`${API_URL}/auth/register`, {
      name,
      email,
      password,
    });

    const { token, user } = response.data.data;

    //Stocke le token
    await AsyncStorage.setItem('@b_ticket_token', token);

    //Configure les intercepteurs pour les requêtes futures
    await setupApiInterceptors();

    return { user, token };
  } catch (error: any) {
    console.log(error.response?.data?.message || 'Register failed');
  }

};

export const logout = async (token: string) => {
  // await delay(800); // Simulate API delay
  // In a real app, this would be a POST request to the API
  try {
    const response = await axios.post(`${API_URL}/logout`);

    const { success } = response.data;

    return { success: success };
  } catch (error: any) {
    console.log(error.response?.data?.message || 'Logout failed');
  }
};

// User profile functions
export const updateUserProfile = async (userData: { name: string; email: string; profileImage?: string }) => {
  try {
    const response = await axios.put(`${API_URL}/user/profile`, userData);
    const { success, user } = response.data;
    return { success, user };
  } catch (error: any) {
    console.log(error.response?.data?.message || 'Profile update failed');
    throw error;
  }
};

export const uploadProfileImage = async (base64Image: string) => {
  try {
    const response = await axios.post(`${API_URL}/user/upload-profile-image`, {
      image: base64Image
    });
    const { success, imageUrl } = response.data;
    return { success, imageUrl };
  } catch (error: any) {
    console.log(error.response?.data?.message || 'Image upload failed');
    throw error;
  }
};

export const deleteAccount = async (token: string) => {
  // await delay(1200); // Simulate API delay
  // In a real app, this would be a DELETE request to the API
  try {
    const response = await axios.post(`${API_URL}/account/delete`);

    const { success } = response.data;

    return { success: success };
  } catch (error: any) {
    console.log(error.response?.data?.message || 'Logout failed');
  }
};

// Events functions
export const getEvents = async () => {
  // await delay(1000); // Simulate API delay
  // In a real app, this would be a GET request to the API
  // return mockEvents;
  try {

    const response = await axios.get(`${API_URL}/event/recents`);

    const { recentEvents } = response.data;

    return recentEvents;
  } catch (error: any) {
    console.log(error.response?.data?.message || 'Register failed');
  }
};

// Events functions
export const getEventsPopular = async () => {
  // await delay(1000); // Simulate API delay
  // In a real app, this would be a GET request to the API
  // return mockEvents;
  try {

    const response = await axios.get(`${API_URL}/favorites/popular`);

    const { data } = response.data;

    return data;
  } catch (error: any) {
    console.log(error.response?.data?.message || 'Register failed');
  }
};

export const getEventById = async (id: string) => {
  // await delay(800); // Simulate API delay
  // In a real app, this would be a GET request to the API
   try {

    const response = await axios.get(`${API_URL}/events/${id}`);
    const event = response.data.data;
    // console.log(event)

    // const event = mockEvents.find(event => event.id === id);
    if (!event) {
      throw new Error('Evénement non trouvé !');
    }
    return event;
  } catch (error: any) {
    console.log(error.response?.data?.message || 'Loading failed');
  }
};

export const getFavorites = async () => {
  try {

    const response = await axios.get(`${API_URL}/favorites/list`);
    const { data } = response.data;
    
    // console.log(data)
    
    return data;
  } catch (error: any) {
    console.log(error.response?.data?.message || 'Loading failed');
  }
};

export const toggleFavorite = async (eventId: number, isFavorite: boolean) => {
  // In a real app, this would be a POST request to the API
  try {
    let response;

    if (isFavorite) {
      response = await axios.post(`${API_URL}/favorites/remove/${eventId}`);
        const { event } = response.data.data;
        return { isFavorite: false }; 
    }

    response = await axios.post(`${API_URL}/favorites/add/${eventId}`);
    const { event } = response.data.data;
    return { isFavorite: true };   

  } catch (error: any) {
    console.log(error.response?.data?.message || 'Loading failed');
    throw new Error('Evénement non trouvé');
  }
};

// Wishlist functions
export const getWishlist = async () => {
  await delay(1000); // Simulate API delay
  // In a real app, this would be a GET request to the API
  return mockWishlist;
};

export const addToWishlist = async (eventId: string) => {
  await delay(800); // Simulate API delay
  // In a real app, this would be a POST request to the API
  const event = mockEvents.find(e => e.id === eventId);
  if (!event) {
    throw new Error('Event not found');
  }
  
  const wishlistItem: WishlistItem = {
    id: `wish${Date.now()}`,
    event,
    addedDate: new Date().toISOString().split('T')[0]
  };
  
  mockWishlist.push(wishlistItem);
  return { success: true, item: wishlistItem };
};

export const removeFromWishlist = async (wishlistItemId: string) => {
  await delay(600); // Simulate API delay
  // In a real app, this would be a DELETE request to the API
  const index = mockWishlist.findIndex(item => item.id === wishlistItemId);
  if (index > -1) {
    mockWishlist.splice(index, 1);
    return { success: true };
  }
  throw new Error('Wishlist item not found');
};

// Categories functions
export const getCategories = async () => {
  // await delay(800); // Simulate API delay
  // In a real app, this would be a GET request to the API
  // return mockCategories;

  try {

    const response = await axios.get(`${API_URL}/event/recents`);
    const { recentEvents } = response.data;
    
    const categories : CategoryType[] = [];

    recentEvents.forEach((el: any) => {
      if (!categories.includes(el.category)) {
        categories.push(el.category);
      }
    });
    
    console.log(categories)

    
    return categories;
  } catch (error: any) {
    console.log(error.response?.data?.message || 'Loading failed');
  }
};

// Tickets functions
export const getUserTickets = async () => {
  try {

    const response = await axios.get(`${API_URL}/tickets`);
    const { data } = response.data;
    
    // console.log(data)
    
    return data;
  } catch (error: any) {
    console.log(error.response?.data?.message || 'Loading failed');
  }
};

export const getTicketById = async (id: string) => {
   try {

    const response = await axios.get(`${API_URL}/tickets/${id}`);
    const { data } = response.data;
    
    // console.log(data)
    
    return data;
  } catch (error: any) {
    console.log(error.response?.data?.message || 'Loading failed');
  }
};

// Payment function
export const processPayment = async (paymentData: any) => {
  try {
    const response = await axios.post(`${API_URL}/payments/process`, paymentData);
    const { success, ticketId } = response.data;
    return { success, ticketId };
  } catch (error: any) {
    console.log(error.response?.data?.message || 'Payment failed');
    throw error;
  }
};

// Set up axios interceptors for adding token to requests
export const setupApiInterceptors = async () => {
  axios.interceptors.request.use(
    async config => {
      const token = await AsyncStorage.getItem('@b_ticket_token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    error => {
      return Promise.reject(error);
    }
  );
};

function capitalize(str: string) {
  str = str.toLowerCase(); // met tout en minuscules d'abord
  return str.charAt(0).toUpperCase() + str.slice(1);
}