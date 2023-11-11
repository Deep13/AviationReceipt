/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow
 */

import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, StatusBar } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { createNativeStackNavigator } from '@react-navigation/native-stack';
import auth from '@react-native-firebase/auth';
import Home from './components/Home';
import Login from './components/Login';
import ClientLogin from './components/ClientLogin';
const Stack = createNativeStackNavigator();
export default function App() {
  const [initializing, setInitializing] = useState(true);
  const [isLoggedIn, setisLoggedIn] = useState(false);
  const [isNew, setisNew] = useState(true);
  const [isLoading, setisLoading] = useState(true);
  const [initialRoute, setinitialRoute] = useState('');


  function onAuthStateChanged(user) {
    // setUser(user);
    const { currentUser } = auth();
    console.log(currentUser)
    if (currentUser) {
      setinitialRoute('SignInContainer');
    } else {

      setinitialRoute('ClientSign');
    }
  }

  useEffect(() => {
    const subscriber = auth().onAuthStateChanged(onAuthStateChanged);
    return subscriber; // unsubscribe on unmount
  }, []);

  const SignInContainer = ({ navigation }) => {
    return (
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Login" component={Login} />
      </Stack.Navigator>
    );
  };

  const ClientSign = ({ navigation }) => {
    return (
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="ClientLogin" component={ClientLogin} />
      </Stack.Navigator>
    );
  };

  const LoggedInContainer = ({ navigation }) => {
    return (
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Home" component={Home} />
      </Stack.Navigator>
    );
  };
  return (
    // <View>
    //   <Text>sdsd</Text>
    // </View>
    <SafeAreaProvider>
      <StatusBar barStyle="dark-content" backgroundColor="#F4F6FA" />
      {initialRoute && (
        <NavigationContainer>
          <Stack.Navigator
            initialRouteName={initialRoute}
            screenOptions={{ headerShown: false }}>
            <Stack.Screen name="ClientSign" component={ClientSign} />
            <Stack.Screen
              name="LoggedInContainer"
              component={LoggedInContainer}
            />
            <Stack.Screen name="SignInContainer" component={SignInContainer} />
          </Stack.Navigator>
        </NavigationContainer>
      )}
    </SafeAreaProvider>
  );
}
