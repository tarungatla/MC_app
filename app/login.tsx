import React, { useState, useContext } from "react";
import {
  View,
  Text,
  TextInput,
  Button,
  Alert,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { AuthContext } from "../app/lib/AuthContext";

const LoginSignupScreen = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [userType, setUserType] = useState("buyer");
  const [phone, setPhone] = useState(""); // New state for phone number
  const router = useRouter();
  const { setUser } = useContext(AuthContext);

  const handleAuth = async () => {
    const endpoint = isLogin ? "/login" : "/register";
    const data = isLogin
      ? { username, password }
      : { username, email, password, userType, phone }; // Include phone number

    try {
      const response = await fetch(
        `http://192.168.0.101:8800/api/auth${endpoint}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(data),
        }
      );

      const responseData = await response.json();

      if (response.ok) {
        if (isLogin) {
          await AsyncStorage.setItem("token", responseData.token);
          setUser(responseData.user); // Set user in context (responseData.user now)
          if (responseData.user.userType === "seller")
            router.replace("(seller)");
          else router.replace("(tabs)");
        } else {
          Alert.alert("Success", responseData.message);
          setIsLogin(true);
        }
      } else {
        Alert.alert("Error", responseData.message || "Something went wrong");
      }
    } catch (error) {
      console.error(error);
      Alert.alert("Error", "Failed to connect to the server");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{isLogin ? "Login" : "Signup"}</Text>

      <TextInput
        style={styles.input}
        placeholder="Username"
        value={username}
        onChangeText={setUsername}
        autoCapitalize="none"
      />

      {!isLogin && (
        <>
          <TextInput
            style={styles.input}
            placeholder="Email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
          <TextInput // New input for phone number
            style={styles.input}
            placeholder="Phone Number"
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
          />

          <View style={styles.userTypeContainer}>
            <TouchableOpacity
              style={[
                styles.userTypeButton,
                userType === "buyer" && styles.selectedButton,
              ]}
              onPress={() => setUserType("buyer")}
            >
              <Text style={userType === "buyer" && styles.selectedButtonText}>
                Buyer
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.userTypeButton,
                userType === "seller" && styles.selectedButton,
              ]}
              onPress={() => setUserType("seller")}
            >
              <Text style={userType === "seller" && styles.selectedButtonText}>
                Seller
              </Text>
            </TouchableOpacity>
          </View>
        </>
      )}

      <TextInput
        style={styles.input}
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />

      <TouchableOpacity style={styles.authButton} onPress={handleAuth}>
        <Text style={styles.authButtonText}>
        {" "}{isLogin ? "Login" : "Signup"}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.switchButton}
        onPress={() => setIsLogin(!isLogin)}
      >
        <Text style={styles.switchButtonText}>{`Switch to ${
          isLogin ? "Signup" : "Login"
        }`}</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 20,
    backgroundColor: "#f0f0f0", // Light background color
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  input: {
    height: 40,
    borderColor: "gray",
    borderWidth: 1,
    marginBottom: 12,
    paddingHorizontal: 10,
    backgroundColor: "white", // White background for inputs
    borderRadius: 5, // Rounded corners for inputs
  },
  userTypeContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 12,
  },
  userTypeButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    backgroundColor: "#ddd", // Gray background for buttons
  },
  selectedButton: {
    backgroundColor: "blue", // Blue background for selected button
  },
  selectedButtonText: {
    color: "white", // White text for selected button
  },
  authButton: {
    backgroundColor: "blue",
    paddingVertical: 12,
    borderRadius: 5,
    alignItems: "center",
    marginBottom: 10,
  },
  authButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  switchButton: {
    backgroundColor: "gray",
    paddingVertical: 12,
    borderRadius: 5,
    alignItems: "center",
  },
  switchButtonText: {
    color: "white",
    fontSize: 16,
  },
});

export default LoginSignupScreen;
