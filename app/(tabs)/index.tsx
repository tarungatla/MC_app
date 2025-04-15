import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { 
  StyleSheet, 
  Platform, 
  View, 
  Text, 
  FlatList, 
  ActivityIndicator,
  TextInput,
  RefreshControl,
  SafeAreaView,
  TouchableOpacity
} from 'react-native';
import { ThemedView } from '@/components/ThemedView';
import { PropertyCard } from '@/components/PropertyCard';
import { Feather } from '@expo/vector-icons';
import { API_URL } from '../lib/config';
import { useDataFetching } from '@/hooks/useDataFetching';
import { debounce, throttle } from '@/app/lib/backgroundTasks';

interface Post {
  id: string;
  title: string;
  price: number;
  city: string;
  images: string[];
  category?: string;
  // ... other post properties
}

export default function HomeScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [localSearchQuery, setLocalSearchQuery] = useState('');

  const categories = ['All', 'House', 'Apartment', 'Condo', 'Villa'];

  // Use our custom hook for data fetching with caching and pagination
  const {
    data: posts,
    loading,
    error,
    refreshing,
    loadingMore,
    hasMore,
    refresh,
    loadMore
  } = useDataFetching<Post>(`${API_URL}/api/posts`, {
    cacheKey: 'cached_posts',
    cacheExpiryTime: 5 * 60 * 1000, // 5 minutes
    pageSize: 10,
    params: {
      category: selectedCategory !== 'All' ? selectedCategory : ''
    }
  });

  // Debounce search input to prevent excessive filtering
  const debouncedSetSearchQuery = useCallback(
    debounce((value: string) => {
      setSearchQuery(value);
    }, 300),
    []
  );

  // Handle search input changes
  const handleSearchChange = (text: string) => {
    // Update local state immediately for responsive UI
    setLocalSearchQuery(text);
    // Debounce the actual filtering
    debouncedSetSearchQuery(text);
  };

  // Throttle category changes to prevent excessive API calls
  const throttledSetCategory = useCallback(
    throttle((category: string) => {
      setSelectedCategory(category);
    }, 500),
    []
  );

  // Handle category selection
  const handleCategorySelect = (category: string) => {
    throttledSetCategory(category);
  };

  // Memoize filtered posts to prevent recalculation on every render
  const filteredPosts = useMemo(() => {
    if (!searchQuery) return posts;
    
    return posts.filter(post => {
      return post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
             post.city.toLowerCase().includes(searchQuery.toLowerCase());
    });
  }, [posts, searchQuery]);

  const renderHeader = () => (
    <View style={styles.header}>
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Feather name="search" size={20} color="#666" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search properties..."
            value={localSearchQuery}
            onChangeText={handleSearchChange}
            placeholderTextColor="#666"
          />
        </View>
        <TouchableOpacity style={styles.filterButton}>
          <Feather name="sliders" size={20} color="#666" />
        </TouchableOpacity>
      </View>
      <FlatList
        horizontal
        data={categories}
        showsHorizontalScrollIndicator={false}
        style={styles.categoryList}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[
              styles.categoryButton,
              selectedCategory === item && styles.categoryButtonActive
            ]}
            onPress={() => handleCategorySelect(item)}
          >
            <Text 
              style={[
                styles.categoryText,
                selectedCategory === item && styles.categoryTextActive
              ]}
            >
              {item}
            </Text>
          </TouchableOpacity>
        )}
        keyExtractor={item => item}
      />
    </View>
  );

  const renderFooter = () => {
    if (!loadingMore) return null;
    
    return (
      <View style={styles.footerLoader}>
        <ActivityIndicator size="small" color="#0066FF" />
      </View>
    );
  };

  const renderPost = useCallback(({ item }: { item: Post }) => (
    <View style={styles.cardWrapper}>
      <PropertyCard post={item} />
    </View>
  ), []);

  if (loading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0066FF" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={refresh}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ThemedView style={styles.container}>
        <FlatList
          data={filteredPosts}
          renderItem={renderPost}
          keyExtractor={(item) => item.id}
          numColumns={2}
          contentContainerStyle={styles.flatListContent}
          ListHeaderComponent={renderHeader}
          ListFooterComponent={renderFooter}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={refresh} />
          }
          onEndReached={loadMore}
          onEndReachedThreshold={0.5}
          maxToRenderPerBatch={10}
          windowSize={5}
          removeClippedSubviews={Platform.OS === 'android'}
          initialNumToRender={6}
        />
      </ThemedView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
  },
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    padding: 16,
    backgroundColor: '#fff',
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  locationText: {
    marginLeft: 8,
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
    color: '#333',
    height: Platform.OS === 'ios' ? 24 : undefined,
  },
  filterButton: {
    padding: 12,
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
  },
  categoryList: {
    marginTop: 16,
  },
  categoryButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
    borderRadius: 20,
    backgroundColor: '#f5f5f5',
  },
  categoryButtonActive: {
    backgroundColor: '#0066FF',
  },
  categoryText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  categoryTextActive: {
    color: '#fff',
  },
  flatListContent: {
    paddingBottom: 20,
  },
  cardWrapper: {
    flex: 1,
    padding: 8,
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
    color: '#FF3B30',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: '#0066FF',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  footerLoader: {
    paddingVertical: 20,
    alignItems: 'center',
  },
});