import React, { useState, useEffect } from 'react';
import { View, Text, Image, StyleSheet, ScrollView, ActivityIndicator, TouchableOpacity, Linking, Alert, Dimensions } from 'react-native';
import { useRoute } from '@react-navigation/native';
import { useRouter, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

interface Post {
  id: string;
  title: string;
  price: number;
  images: string[];
  address: string;
  city: string;
  bedroom?: number;
  bathroom?: number;
  property?: string;
  latitude?: string;
  longitude?: string;
  postDetail?: {
    desc: string;
    utilities?: string;
    size?: number;
  };
  user: {
    username: string;
    phone?: string;
  };
}

const PropertyDetailsScreen: React.FC = () => {
  const route = useRoute();
  const router = useRouter();
  const postId = route.params?.id || router.params?.id;
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const response = await fetch(`http:/192.168.0.101:8800/api/posts/${postId}`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data: Post = await response.json();
        setPost(data);
      } catch (err: any) {
        console.error("Error fetching post:", err);
        setError(err.message || "Failed to fetch property details.");
      } finally {
        setLoading(false);
      }
    };

    if (postId) {
      fetchPost();
    } else {
      setError("Property ID is missing");
      setLoading(false);
    }
  }, [postId]);

  const handlePhonePress = async () => {
    if (post?.user?.phone) {
      try {
        // Remove any non-numeric characters from the phone number
        // const phoneNumber = post.user.phone.replace(/\D/g, '');
        const phoneNumber = "8450995973";
        
        // Check if device can handle telephone links
        const canOpen = await Linking.canOpenURL(`tel:${phoneNumber}`);
        
        if (canOpen) {
          await Linking.openURL(`tel:${phoneNumber}`);
        } else {
          Alert.alert(
            "Error",
            "Unable to open phone dialer. Please dial manually: " + post.user.phone
          );
        }
      } catch (error) {
        console.error("Error opening phone dialer:", error);
        Alert.alert(
          "Error",
          "Unable to open phone dialer. Please dial manually: " + post.user.phone
        );
      }
    } else {
      Alert.alert("Contact Information", "Seller's phone number not available.");
    }
  };

  const handleLocationPress = () => {
    if (post?.address && post?.city) {
      const address = `${post.address}, ${post.city}`;
      const encodedAddress = encodeURIComponent(address);
      const url = `https://www.google.com/maps/search/?api=1&query=${encodedAddress}`;
      Linking.openURL(url).catch(err => {
        Alert.alert(
          "Error",
          "Unable to open maps. Please try again later."
        );
      });
    } else {
      Alert.alert("Location", "Address information not available.");
    }
  };

  const nextImage = () => {
    if (post?.images && currentImageIndex < post.images.length - 1) {
      setCurrentImageIndex(prev => prev + 1);
    }
  };

  const previousImage = () => {
    if (currentImageIndex > 0) {
      setCurrentImageIndex(prev => prev - 1);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  if (!post) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Property not found</Text>
      </View>
    );
  }

  return (
    <>
      <Stack.Screen 
        options={{
          headerShown: false,
        }} 
      />
      <ScrollView style={styles.container}>
        <View style={styles.imageContainer}>
          {post.images && post.images.length > 0 ? (
            <>
              <Image source={{ uri: post.images[currentImageIndex] }} style={styles.image} />
              {post.images.length > 1 && (
                <View style={styles.imageNavigation}>
                  <TouchableOpacity 
                    style={[styles.navButton, currentImageIndex === 0 && styles.navButtonDisabled]} 
                    onPress={previousImage}
                    disabled={currentImageIndex === 0}
                  >
                    <Ionicons name="chevron-back" size={24} color="white" />
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={[styles.navButton, currentImageIndex === post.images.length - 1 && styles.navButtonDisabled]} 
                    onPress={nextImage}
                    disabled={currentImageIndex === post.images.length - 1}
                  >
                    <Ionicons name="chevron-forward" size={24} color="white" />
                  </TouchableOpacity>
                </View>
              )}
              <View style={styles.imageCounter}>
                <Text style={styles.imageCounterText}>
                  {currentImageIndex + 1}/{post.images.length}
                </Text>
              </View>
            </>
          ) : (
            <View style={styles.noImage}>
              <Ionicons name="image-outline" size={48} color="#666" />
              <Text style={styles.noImageText}>No Images Available</Text>
            </View>
          )}
        </View>

        <View style={styles.contentContainer}>
          <View style={styles.header}>
            <Text style={styles.title}>{post.title}</Text>
            <Text style={styles.price}>${post.price.toLocaleString()}</Text>
          </View>

          <View style={styles.propertyInfo}>
            <TouchableOpacity style={styles.locationButton} onPress={handleLocationPress}>
              <Ionicons name="location" size={20} color="#007AFF" />
              <Text style={styles.address}>{`${post.address}, ${post.city}`}</Text>
            </TouchableOpacity>

            <View style={styles.featuresGrid}>
              {post.bedroom && (
                <View style={styles.featureItem}>
                  <Ionicons name="bed-outline" size={24} color="#666" />
                  <Text style={styles.featureText}>{post.bedroom} Bedrooms</Text>
                </View>
              )}
              {post.bathroom && (
                <View style={styles.featureItem}>
                  <Ionicons name="water-outline" size={24} color="#666" />
                  <Text style={styles.featureText}>{post.bathroom} Bathrooms</Text>
                </View>
              )}
              {post.postDetail?.size && (
                <View style={styles.featureItem}>
                  <Ionicons name="resize-outline" size={24} color="#666" />
                  <Text style={styles.featureText}>{post.postDetail.size} sqft</Text>
                </View>
              )}
              {post.property && (
                <View style={styles.featureItem}>
                  <Ionicons name="home-outline" size={24} color="#666" />
                  <Text style={styles.featureText}>{post.property}</Text>
                </View>
              )}
            </View>
          </View>

          {post.postDetail && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Description</Text>
              <Text style={styles.descriptionText}>{post.postDetail.desc}</Text>
              
              {(post.postDetail.utilities || post.postDetail.pet) && (
                <View style={styles.additionalInfo}>
                  {post.postDetail.utilities && (
                    <View style={styles.infoItem}>
                      <Ionicons name="flash-outline" size={20} color="#666" />
                      <Text style={styles.infoText}>Utilities: {post.postDetail.utilities}</Text>
                    </View>
                  )}
                  {post.postDetail.pet && (
                    <View style={styles.infoItem}>
                      <Ionicons name="paw-outline" size={20} color="#666" />
                      <Text style={styles.infoText}>Pets: {post.postDetail.pet}</Text>
                    </View>
                  )}
                </View>
              )}
            </View>
          )}

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Contact Information</Text>
            <View style={styles.contactCard}>
              <View style={styles.userInfo}>
                <Ionicons name="person-circle-outline" size={40} color="#666" />
                <TouchableOpacity style={styles.userDetails} onPress={handlePhonePress}>
                  <Text style={[styles.username, post.user.phone && styles.clickableText]}>{post.user.username}</Text>
                  <Text style={styles.userType}>Property Owner</Text>
                </TouchableOpacity>
              </View>
              
              {post.user.phone && (
                <TouchableOpacity style={styles.callButton} onPress={handlePhonePress}>
                  <Ionicons name="call" size={20} color="white" />
                  <Text style={styles.callButtonText}>Call Now</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </View>
      </ScrollView>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    color: '#DC2626',
    fontSize: 16,
    textAlign: 'center',
  },
  imageContainer: {
    position: 'relative',
    backgroundColor: '#000',
  },
  image: {
    width: '100%',
    height: 300,
    resizeMode: 'cover',
  },
  imageNavigation: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 10,
  },
  navButton: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 20,
    padding: 8,
  },
  navButtonDisabled: {
    opacity: 0.5,
  },
  imageCounter: {
    position: 'absolute',
    bottom: 10,
    right: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    padding: 6,
    borderRadius: 12,
  },
  imageCounterText: {
    color: 'white',
    fontSize: 12,
  },
  noImage: {
    width: '100%',
    height: 300,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  noImageText: {
    marginTop: 8,
    color: '#666',
    fontSize: 16,
  },
  contentContainer: {
    padding: 20,
  },
  header: {
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 8,
  },
  price: {
    fontSize: 22,
    fontWeight: '600',
    color: '#059669',
  },
  propertyInfo: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  locationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  address: {
    marginLeft: 8,
    fontSize: 16,
    color: '#007AFF',
  },
  featuresGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -8,
  },
  featureItem: {
    flexBasis: '50%',
    padding: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  featureText: {
    marginLeft: 8,
    fontSize: 15,
    color: '#374151',
  },
  section: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 12,
  },
  descriptionText: {
    fontSize: 15,
    lineHeight: 24,
    color: '#4B5563',
  },
  additionalInfo: {
    marginTop: 16,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  infoText: {
    marginLeft: 8,
    fontSize: 15,
    color: '#4B5563',
  },
  contactCard: {
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    padding: 16,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  userDetails: {
    marginLeft: 12,
  },
  username: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  userType: {
    fontSize: 14,
    color: '#6B7280',
  },
  callButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#007AFF',
    borderRadius: 8,
    padding: 12,
  },
  callButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  clickableText: {
    color: '#007AFF',
    textDecorationLine: 'underline',
  },
});

export default PropertyDetailsScreen;