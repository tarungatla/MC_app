import React, { useContext, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  Alert,
  Switch,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AuthContext } from '../lib/AuthContext';
import { useRouter } from 'expo-router';

const ProfileScreen: React.FC = () => {
  const { user, logout } = useContext(AuthContext);
  const router = useRouter();
  const [notifications, setNotifications] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  const handleLogout = async () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            setIsLoading(true);
            try {
              await logout();
              router.replace('/login');
            } catch (error) {
              Alert.alert('Error', 'Failed to logout. Please try again.');
            } finally {
              setIsLoading(false);
            }
          },
        },
      ]
    );
  };

  const handleEditProfile = () => {
    // Navigate to edit profile screen
    router.push('/edit-profile');
  };

  const handleMyListings = () => {
    // Navigate to my listings screen
    router.push('/my-listings');
  };

  const handleSettings = () => {
    // Navigate to settings screen
    router.push('/settings');
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* Profile Header */}
      <View style={styles.header}>
        <View style={styles.profileImageContainer}>
          <View style={styles.profileImage}>
            <Ionicons name="person" size={40} color="#666" />
          </View>
          <TouchableOpacity style={styles.editImageButton}>
            <Ionicons name="camera" size={20} color="#FFF" />
          </TouchableOpacity>
        </View>
        
        <View style={styles.profileInfo}>
          <Text style={styles.name}>{user?.username}</Text>
          <Text style={styles.email}>{user?.email}</Text>
          <View style={styles.userTypeContainer}>
            <Ionicons 
              name={user?.userType === 'seller' ? 'business' : 'person'} 
              size={16} 
              color="#007AFF" 
            />
            <Text style={styles.userType}>
              {user?.userType === 'seller' ? 'Seller Account' : 'Buyer Account'}
            </Text>
          </View>
        </View>
      </View>

      {/* Quick Actions */}
      <View style={styles.quickActions}>
        <TouchableOpacity style={styles.actionButton} onPress={handleEditProfile}>
          <Ionicons name="create-outline" size={24} color="#007AFF" />
          <Text style={styles.actionText}>Edit Profile</Text>
        </TouchableOpacity>

        {user?.userType === 'seller' && (
          <TouchableOpacity style={styles.actionButton} onPress={handleMyListings}>
            <Ionicons name="list-outline" size={24} color="#007AFF" />
            <Text style={styles.actionText}>My Listings</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity style={styles.actionButton} onPress={handleSettings}>
          <Ionicons name="settings-outline" size={24} color="#007AFF" />
          <Text style={styles.actionText}>Settings</Text>
        </TouchableOpacity>
      </View>

      {/* Settings Sections */}
      <View style={styles.sections}>
        {/* Account Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account</Text>
          <TouchableOpacity style={styles.sectionItem}>
            <View style={styles.sectionItemLeft}>
              <Ionicons name="person-circle-outline" size={24} color="#666" />
              <Text style={styles.sectionItemText}>Personal Information</Text>
            </View>
            <Ionicons name="chevron-forward" size={24} color="#666" />
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.sectionItem}>
            <View style={styles.sectionItemLeft}>
              <Ionicons name="lock-closed-outline" size={24} color="#666" />
              <Text style={styles.sectionItemText}>Security</Text>
            </View>
            <Ionicons name="chevron-forward" size={24} color="#666" />
          </TouchableOpacity>
        </View>

        {/* Preferences Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Preferences</Text>
          <View style={styles.sectionItem}>
            <View style={styles.sectionItemLeft}>
              <Ionicons name="notifications-outline" size={24} color="#666" />
              <Text style={styles.sectionItemText}>Notifications</Text>
            </View>
            <Switch
              value={notifications}
              onValueChange={setNotifications}
              trackColor={{ false: '#767577', true: '#81b0ff' }}
              thumbColor={notifications ? '#007AFF' : '#f4f3f4'}
            />
          </View>

          <TouchableOpacity style={styles.sectionItem}>
            <View style={styles.sectionItemLeft}>
              <Ionicons name="language-outline" size={24} color="#666" />
              <Text style={styles.sectionItemText}>Language</Text>
            </View>
            <View style={styles.sectionItemRight}>
              <Text style={styles.secondaryText}>English</Text>
              <Ionicons name="chevron-forward" size={24} color="#666" />
            </View>
          </TouchableOpacity>
        </View>

        {/* Help Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Help & Support</Text>
          <TouchableOpacity style={styles.sectionItem}>
            <View style={styles.sectionItemLeft}>
              <Ionicons name="help-circle-outline" size={24} color="#666" />
              <Text style={styles.sectionItemText}>Help Center</Text>
            </View>
            <Ionicons name="chevron-forward" size={24} color="#666" />
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.sectionItem}>
            <View style={styles.sectionItemLeft}>
              <Ionicons name="mail-outline" size={24} color="#666" />
              <Text style={styles.sectionItemText}>Contact Support</Text>
            </View>
            <Ionicons name="chevron-forward" size={24} color="#666" />
          </TouchableOpacity>
        </View>

        {/* Logout Button */}
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={24} color="#DC2626" />
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
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
  header: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  profileImageContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#007AFF',
  },
  editImageButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#007AFF',
    borderRadius: 20,
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#FFFFFF',
  },
  profileInfo: {
    alignItems: 'center',
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 4,
  },
  email: {
    fontSize: 16,
    color: '#6B7280',
    marginBottom: 8,
  },
  userTypeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  userType: {
    marginLeft: 6,
    fontSize: 14,
    color: '#007AFF',
    fontWeight: '500',
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 16,
    backgroundColor: '#FFFFFF',
    marginVertical: 12,
  },
  actionButton: {
    alignItems: 'center',
  },
  actionText: {
    marginTop: 4,
    fontSize: 12,
    color: '#374151',
  },
  sections: {
    padding: 16,
  },
  section: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginBottom: 16,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 16,
  },
  sectionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  sectionItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sectionItemRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sectionItemText: {
    marginLeft: 12,
    fontSize: 16,
    color: '#374151',
  },
  secondaryText: {
    fontSize: 16,
    color: '#6B7280',
    marginRight: 8,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FEE2E2',
    padding: 16,
    borderRadius: 12,
    marginTop: 8,
  },
  logoutText: {
    marginLeft: 8,
    fontSize: 16,
    fontWeight: '600',
    color: '#DC2626',
  },
});

export default ProfileScreen;