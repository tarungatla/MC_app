import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import { Link } from 'expo-router';
import { Pressable } from 'react-native';
import { useRouter } from 'expo-router';

export const PropertyCard = ({ post }) => {
  const router = useRouter();

  return (
    <Pressable onPress={() => router.push(`/property/${post.id}`)}>
      <View style={styles.card}>
        <Image source={{ uri: post.images[0] }} style={styles.image} />
        <View style={styles.textContainer}>
          <Text style={styles.title}>{post.title}</Text>
          <Text style={styles.price}>₹{post.price}</Text>
          <Text style={styles.location}>{post.city}</Text>
        </View>
      </View>
    </Pressable>
  );
};
const styles = StyleSheet.create({
  card: {
    flex: 0.5, // Two cards per row
    margin: 5,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: 'white',
    elevation: 3, // Android shadow
    shadowColor: '#000', // iOS shadow
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  image: {
    width: '100%',
    height: 150,
    resizeMode: 'cover',
  },
  textContainer: {
    padding: 10,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  price: {
    fontSize: 14,
    color: 'green',
    marginBottom: 5,
  },
  location: {
    fontSize: 12,
    color: 'gray',
  },
});
