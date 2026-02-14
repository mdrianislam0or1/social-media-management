import { CreatePostModal } from '@/components/Createpostmodal';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  FlatList,
  Platform,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { PostCard } from '../../components/PostCard';
import {
  addNotificationReceivedListener,
  addNotificationResponseReceivedListener,
  registerForPushNotificationsAsync,
  removeNotificationSubscription,
} from '../../services/notifications';
import { getPosts } from '../../services/posts';
import { updateFcmToken } from '../../services/user';
import { Post } from '../../types';

const { width } = Dimensions.get('window');
const isTablet = width >= 768;

export default function FeedScreen() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filterUsername, setFilterUsername] = useState('');
  const [searchInput, setSearchInput] = useState('');

  useEffect(() => {
    loadPosts();
    setupNotifications();
  }, []);

  const setupNotifications = async () => {
    try {
      const token = await registerForPushNotificationsAsync();

      if (token) {
        // Update FCM token on backend
        await updateFcmToken(token);
        console.log('✅ FCM token registered:', token);
      } else {
        console.log('⚠️ Push notifications not available (Expo Go limitation on Android SDK 53+)');
        console.log('💡 To enable notifications, build a development build or use iOS');
      }

      const notificationListener = addNotificationReceivedListener((notification) => {
        console.log('📬 Notification received:', notification);
        // Show in-app notification banner
        Alert.alert(
          notification.request.content.title || 'New Notification',
          notification.request.content.body || ''
        );
      });

      const responseListener = addNotificationResponseReceivedListener((response) => {
        console.log('👆 Notification tapped:', response);
        // Refresh feed when notification is tapped
        handleRefresh();
      });

      return () => {
        removeNotificationSubscription(notificationListener);
        removeNotificationSubscription(responseListener);
      };
    } catch (error) {
      console.error('❌ Error setting up notifications:', error);
    }
  };

  const loadPosts = async (page = 1, username = '') => {
    try {
      if (page === 1) {
        setIsLoading(true);
      }

      const response = await getPosts({ page, limit: 10, username });

      if (page === 1) {
        setPosts(response.data);
      } else {
        setPosts((prev) => [...prev, ...response.data]);
      }

      setCurrentPage(response.page);
      setTotalPages(response.totalPages);
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to load posts');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
      setIsLoadingMore(false);
    }
  };

  const handleRefresh = useCallback(() => {
    setIsRefreshing(true);
    setCurrentPage(1);
    loadPosts(1, filterUsername);
  }, [filterUsername]);

  const handleLoadMore = useCallback(() => {
    if (!isLoadingMore && currentPage < totalPages) {
      setIsLoadingMore(true);
      loadPosts(currentPage + 1, filterUsername);
    }
  }, [isLoadingMore, currentPage, totalPages, filterUsername]);

  const handleSearch = () => {
    setFilterUsername(searchInput);
    setCurrentPage(1);
    loadPosts(1, searchInput);
  };

  const handleClearFilter = () => {
    setSearchInput('');
    setFilterUsername('');
    setCurrentPage(1);
    loadPosts(1, '');
  };

  const renderHeader = () => (
    <View style={styles.searchContainer}>
      <View style={styles.searchInputContainer}>
        <Ionicons name="search" size={20} color="#666" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Filter by username"
          placeholderTextColor="#999"
          value={searchInput}
          onChangeText={setSearchInput}
          onSubmitEditing={handleSearch}
          returnKeyType="search"
        />
        {(searchInput || filterUsername) && (
          <TouchableOpacity onPress={handleClearFilter} style={styles.clearButton}>
            <Ionicons name="close-circle" size={20} color="#666" />
          </TouchableOpacity>
        )}
      </View>
      {filterUsername && (
        <Text style={styles.filterText}>
          Showing posts by: <Text style={styles.filterUsername}>{filterUsername}</Text>
        </Text>
      )}
    </View>
  );

  const renderFooter = () => {
    if (!isLoadingMore) return null;
    return (
      <View style={styles.footerLoader}>
        <ActivityIndicator size="small" color="#007AFF" />
      </View>
    );
  };

  const renderEmpty = () => {
    if (isLoading) return null;
    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="chatbubbles-outline" size={64} color="#ccc" />
        <Text style={styles.emptyText}>
          {filterUsername ? `No posts found by ${filterUsername}` : 'No posts yet'}
        </Text>
        <Text style={styles.emptySubtext}>
          {filterUsername ? 'Try a different username' : 'Be the first to share something!'}
        </Text>
      </View>
    );
  };

  if (isLoading && posts.length === 0) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return (
    <>
      <StatusBar style="dark" />
      <View style={styles.container}>
        <FlatList
          data={posts}
          renderItem={({ item }) => (
            <View style={isTablet && styles.tabletCard}>
              <PostCard post={item} onUpdate={handleRefresh} />
            </View>
          )}
          keyExtractor={(item) => item.postId}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={handleRefresh}
              tintColor="#007AFF"
            />
          }
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.5}
          ListHeaderComponent={renderHeader}
          ListFooterComponent={renderFooter}
          ListEmptyComponent={renderEmpty}
          contentContainerStyle={[
            styles.listContent,
            posts.length === 0 && styles.listContentEmpty,
            isTablet && styles.tabletContent,
          ]}
        />

        <TouchableOpacity
          style={styles.fab}
          onPress={() => setShowCreateModal(true)}
          activeOpacity={0.8}
        >
          <Ionicons name="add" size={28} color="#fff" />
        </TouchableOpacity>

        <CreatePostModal
          visible={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          onPostCreated={handleRefresh}
        />
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  listContent: {
    paddingBottom: 80,
  },
  listContentEmpty: {
    flexGrow: 1,
  },
  tabletContent: {
    paddingHorizontal: width * 0.15,
  },
  tabletCard: {
    maxWidth: 800,
    alignSelf: 'center',
    width: '100%',
  },
  searchContainer: {
    backgroundColor: '#fff',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f9f9f9',
    borderRadius: 12,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 44,
    fontSize: 15,
    color: '#333',
  },
  clearButton: {
    padding: 4,
  },
  filterText: {
    fontSize: 13,
    color: '#666',
    marginTop: 8,
  },
  filterUsername: {
    fontWeight: '600',
    color: '#007AFF',
  },
  footerLoader: {
    paddingVertical: 20,
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#666',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
    marginTop: 8,
    textAlign: 'center',
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: Platform.OS === 'ios' ? 90 : 80,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
});
