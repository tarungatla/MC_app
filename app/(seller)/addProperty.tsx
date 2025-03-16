import React, { useState, useContext } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert, Image, ActivityIndicator } from 'react-native';
import { AuthContext } from '../lib/AuthContext';
import * as ImagePicker from 'expo-image-picker';
import { Picker as RNPicker } from '@react-native-picker/picker';
import { Ionicons } from '@expo/vector-icons';

interface PostData {
  title: string;
  price: number;
  images: string[];
  address: string;
  city: string;
  bedroom?: number;
  bathroom?: number;
  latitude?: string;
  longitude?: string;
  property: 'apartment' | 'house' | 'condo' | 'land';
}

interface PostDetailData {
  desc: string;
  utilities?: string;
  size?: number;
}

const AddPropertyScreen: React.FC = () => {
  const { user } = useContext(AuthContext);
  const [postData, setPostData] = useState<PostData>({
    title: '',
    price: 0,
    images: [],
    address: '',
    city: '',
    property: 'apartment',
  });
  const [postDetail, setPostDetail] = useState<PostDetailData>({
    desc: '',
  });
  const [uploading, setUploading] = useState(false);

  const handleInputChange = (field: keyof PostData, value: string | number) => {
    setPostData({ ...postData, [field]: value });
  };

  const handlePostDetailChange = (field: keyof PostDetailData, value: string | number) => {
    setPostDetail({ ...postDetail, [field]: value });
  };

  const pickImage = async () => {
    Alert.alert(
      "Add Photo",
      "Choose a photo from",
      [
        {
          text: "Camera",
          onPress: async () => {
            // Request camera permissions
            const { status } = await ImagePicker.requestCameraPermissionsAsync();
            if (status !== 'granted') {
              Alert.alert('Sorry, we need camera permissions to make this work!');
              return;
            }
  
            let result = await ImagePicker.launchCameraAsync({
              mediaTypes: ImagePicker.MediaTypeOptions.Images,
              allowsEditing: true,
              aspect: [4, 3],
              quality: 1,
            });
  
            if (!result.canceled) {
              setPostData({ ...postData, images: [...postData.images, result.assets[0].uri] });
            }
          }
        },
        {
          text: "Gallery",
          onPress: async () => {
            let result = await ImagePicker.launchImageLibraryAsync({
              mediaTypes: ImagePicker.MediaTypeOptions.Images,
              allowsEditing: true,
              aspect: [4, 3],
              quality: 1,
            });
  
            if (!result.canceled) {
              setPostData({ ...postData, images: [...postData.images, result.assets[0].uri] });
            }
          }
        },
        {
          text: "Cancel",
          style: "cancel"
        }
      ]
    );
  };

  const removeImage = (index: number) => {
    const newImages = [...postData.images];
    newImages.splice(index, 1);
    setPostData({ ...postData, images: newImages });
  };

  const handleSubmit = async () => {
    if (!postData.title || !postData.price || !postData.address || !postData.city) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    try {
      setUploading(true);
      const response = await fetch('http://192.168.0.101:8800/api/posts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ postData, postDetail }),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create post');
      }
      Alert.alert('Success', 'Property added successfully!');
      setPostData({
        title: '',
        price: 0,
        images: [],
        address: '',
        city: '',
        property: 'apartment',
      });
      setPostDetail({
        desc: '',
      });
    } catch (error: any) {
      console.error(error);
      Alert.alert('Error', error.message || 'Failed to add property.');
    } finally {
      setUploading(false);
    }
  };

  const renderInput = (
    label: string,
    field: keyof PostData | keyof PostDetailData,
    placeholder: string,
    options?: {
      multiline?: boolean;
      numeric?: boolean;
      required?: boolean;
      isDetail?: boolean;
    }
  ) => {
    const value = options?.isDetail ? postDetail[field as keyof PostDetailData] : postData[field as keyof PostData];
    const handleChange = options?.isDetail ? handlePostDetailChange : handleInputChange;

    return (
      <View style={styles.inputContainer}>
        <Text style={styles.label}>
          {label} {options?.required && <Text style={styles.required}>*</Text>}
        </Text>
        <TextInput
          style={[
            styles.input,
            options?.multiline && styles.multilineInput,
          ]}
          placeholder={placeholder}
          value={value?.toString()}
          onChangeText={(text) => 
            handleChange(
              field,
              options?.numeric ? (Number(text) || undefined) : text
            )
          }
          keyboardType={options?.numeric ? 'numeric' : 'default'}
          multiline={options?.multiline}
        />
      </View>
    );
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>Add New Property</Text>
        <Text style={styles.subHeaderText}>Fill in the details below</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Basic Information</Text>
        {renderInput('Title', 'title', 'Enter property title', { required: true })}
        {renderInput('Price', 'price', 'Enter price', { numeric: true, required: true })}
        
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Property Type <Text style={styles.required}>*</Text></Text>
          <View style={styles.pickerContainer}>
            <RNPicker
              selectedValue={postData.property}
              style={styles.picker}
              onValueChange={(itemValue) => 
                handleInputChange('property', itemValue as PostData['property'])
              }
            >
              <RNPicker.Item label="Apartment" value="apartment" />
              <RNPicker.Item label="House" value="house" />
              <RNPicker.Item label="Condo" value="condo" />
              <RNPicker.Item label="Land" value="land" />
            </RNPicker>
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Location</Text>
        {renderInput('Address', 'address', 'Enter property address', { required: true })}
        {renderInput('City', 'city', 'Enter city', { required: true })}
        <View style={styles.row}>
          {renderInput('Latitude', 'latitude', 'Enter latitude')}
          {renderInput('Longitude', 'longitude', 'Enter longitude')}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Property Details</Text>
        <View style={styles.row}>
          {renderInput('Bedrooms', 'bedroom', 'Number of bedrooms', { numeric: true })}
          {renderInput('Bathrooms', 'bathroom', 'Number of bathrooms', { numeric: true })}
        </View>
        {renderInput('Size', 'size', 'Size in sqft', { numeric: true, isDetail: true })}
        {renderInput('Utilities', 'utilities', 'Available utilities', { isDetail: true })}
        {renderInput('Description', 'desc', 'Property description', { multiline: true, isDetail: true })}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Property Images</Text>
        <TouchableOpacity style={styles.imagePickerButton} onPress={pickImage}>
          <Ionicons name="camera-outline" size={24} color="#007AFF" />
          <Text style={styles.imagePickerText}>Add Photos</Text>
        </TouchableOpacity>
        
        <View style={styles.imageGrid}>
          {postData.images.map((imageUri, index) => (
            <View key={index} style={styles.imageContainer}>
              <Image source={{ uri: imageUri }} style={styles.pickedImage} />
              <TouchableOpacity
                style={styles.removeImageButton}
                onPress={() => removeImage(index)}
              >
                <Ionicons name="close-circle" size={24} color="#FF3B30" />
              </TouchableOpacity>
            </View>
          ))}
        </View>
      </View>

      <TouchableOpacity
        style={[styles.submitButton, uploading && styles.submitButtonDisabled]}
        onPress={handleSubmit}
        disabled={uploading}
      >
        {uploading ? (
          <ActivityIndicator color="#FFFFFF" />
        ) : (
          <Text style={styles.submitButtonText}>Add Property</Text>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    padding: 20,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
  },
  subHeaderText: {
    fontSize: 16,
    color: '#6B7280',
    marginTop: 4,
  },
  section: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    marginTop: 12,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#E5E7EB',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 16,
  },
  inputContainer: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 8,
  },
  required: {
    color: '#FF3B30',
  },
  input: {
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#111827',
  },
  multilineInput: {
    height: 100,
    textAlignVertical: 'top',
  },
  pickerContainer: {
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    overflow: 'hidden',
  },
  picker: {
    height: 50,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  imagePickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
  },
  imagePickerText: {
    marginLeft: 8,
    fontSize: 16,
    color: '#007AFF',
    fontWeight: '500',
  },
  imageGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  imageContainer: {
    position: 'relative',
  },
  pickedImage: {
    width: 100,
    height: 100,
    borderRadius: 8,
  },
  removeImageButton: {
    position: 'absolute',
    top: -12,
    right: -12,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
  },
  submitButton: {
    backgroundColor: '#007AFF',
    borderRadius: 8,
    padding: 16,
    margin: 20,
    alignItems: 'center',
  },
  submitButtonDisabled: {
    backgroundColor: '#A1A1A1',
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default AddPropertyScreen;