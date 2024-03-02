
import {
    View,
    Text,
    TouchableOpacity,
    TextInput,
    ActivityIndicator,
    Image,
    StatusBar
} from 'react-native';
import React, { useContext, useEffect, useState } from 'react';
import auth from '@react-native-firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'


const ClientLogin = ({ navigation }) => {
    const [loading, setloading] = useState(false);
    const [initializing, setInitializing] = useState(true);
    const [user, setUser] = useState();

    const [email, setemail] = useState('');
    const [pword, setpword] = useState('');
    const [emailinvalid, setemailinvalid] = useState(false);

    const [err, seterr] = useState(false);
    const [errmsg, seterrmsg] = useState(
        'Password and Confirm Password do not match',
    );


    const inValidator = (err, msg) => {
        seterr(true), seterrmsg(msg);
    };


    const loginStart = () => {
        if (emailinvalid) return console.log('NO VALID');
        else if (email.length === 0) return inValidator(true, 'Email required');
        else if (pword.length === 0)
            return inValidator(true, 'Password Field Cannot be left Empty');
        else if (pword.length < 6)
            return inValidator(true, 'Password Should at least be 6 characters');
        else {
            setloading(true);
            auth()
                .signInWithEmailAndPassword(email, pword)
                .then(() => {
                    console.log('User signed in!');
                    AsyncStorage.removeItem('username');
                    AsyncStorage.removeItem('password');
                    setloading(false);
                    navigation.reset({
                        index: 0,
                        routes: [{ name: 'SignInContainer' }],
                    });
                })
                .catch(error => {
                    console.log(error);

                    if (error.code === 'auth/user-not-found')
                        inValidator(true, 'Incorrect Credentials');
                    setloading(false);
                });
        }
    };
    const validateEmail = () => {
        var re = /\S+@\S+\.\S+/;
        return re.test(email);
    };


    return (
        <View
            style={{
                flexDirection: 'column',
                justifyContent: 'center',
                backgroundColor: '#FFF',
                flex: 1
            }}>
            <StatusBar barStyle="light-content" backgroundColor="#FFF" />
            <KeyboardAwareScrollView>
                <Image
                    source={require('../assets/aero_icon.png')}
                    resizeMode="contain"
                    style={{ maxHeight: 100, width: '100%' }}
                />

                <View style={{ marginTop: 20, backgroundColor: 'white', marginHorizontal: 20, borderWidth: 1, borderRadius: 20, marginBottom: 10, }}>
                    <Text
                        style={{
                            color: '#000',
                            fontWeight: 'bold',
                            textAlign: 'center',
                            fontSize: 20,
                            color: 'white',
                            backgroundColor: '#012f6c',
                            paddingTop: 5,
                            paddingBottom: 5,
                            borderTopLeftRadius: 20, borderTopRightRadius: 20
                        }}>
                        Sign In
                    </Text>
                    {err && (
                        <View
                            style={{
                                width: '100%',
                                height: 50,
                                paddingHorizontal: 10,
                                justifyContent: 'center',
                                backgroundColor: '#d3d3d360',
                            }}>
                            <Text style={{ color: 'red', fontSize: 14 }}>&bull; {errmsg}</Text>
                        </View>
                    )}
                    <View style={{ marginTop: 20, padding: 10 }}>
                        <Text style={{ color: '#000', fontSize: 18 }}>Email Address</Text>
                        {emailinvalid && (
                            <Text style={{ color: 'red', fontSize: 12, marginTop: 10 }}>
                                {email.length === 0
                                    ? 'Email Required'
                                    : 'Invalid Email Address'}
                            </Text>
                        )}
                        <TextInput
                            placeholder="example@example.com"
                            placeholderTextColor="#808080"
                            onChangeText={text => setemail(text)}
                            onFocus={() => {
                                setemailinvalid(false);
                            }}
                            onBlur={() => {
                                if (email.length === 0) setemailinvalid(true);
                                else if (!validateEmail()) {
                                    console.log('EMAIL INVALID');
                                    setemailinvalid(true);
                                } else {
                                    //setemailinvalid(false);
                                }
                            }}
                            style={{
                                width: '100%',
                                height: 50,
                                paddingLeft: 10,
                                backgroundColor: '#fff',
                                borderWidth: 1,
                                borderColor: '#d3d3d3',
                                marginTop: 10,
                                color: '#000',
                                borderRadius: 6
                            }}
                        />

                        <Text style={{ color: '#000', fontSize: 18, marginTop: 20 }}>
                            Password
                        </Text>
                        <TextInput
                            textContentType="password"
                            secureTextEntry={true}
                            onFocus={() => seterr(false)}
                            onChangeText={text => setpword(text)}
                            style={{
                                width: '100%',
                                height: 50,
                                backgroundColor: '#fff',
                                borderWidth: 1,
                                borderColor: '#d3d3d3',
                                marginTop: 10,
                                color: '#000',
                                borderRadius: 6

                            }}
                        />

                        {loading ? (
                            <TouchableOpacity
                                style={{
                                    width: '100%',
                                    height: 40,
                                    marginTop: 30,
                                    backgroundColor: '#012f6c',
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    borderRadius: 6
                                }}>
                                <ActivityIndicator />
                            </TouchableOpacity>
                        ) : (
                            <TouchableOpacity
                                onPress={loginStart}
                                style={{
                                    width: '100%',
                                    height: 40,
                                    marginTop: 30,
                                    backgroundColor: '#012f6c',
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    borderRadius: 6
                                }}>
                                <Text style={{ fontSize: 18, color: 'white' }}>Login</Text>
                            </TouchableOpacity>
                        )}
                    </View>
                </View>
            </KeyboardAwareScrollView>
        </View>
    )
}

export default ClientLogin