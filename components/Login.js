
import {
    View,
    Text,
    TouchableOpacity,
    TextInput,
    Alert,
    ActivityIndicator,
    Image,
    StatusBar
} from 'react-native';
import React, { useRef, useEffect, useState } from 'react';
import firestore from '@react-native-firebase/firestore';

import auth from '@react-native-firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { setUser, setDomain } from './functions/helper';

const Login = ({ navigation }) => {
    const [loading, setloading] = useState(false);
    const [initializing, setInitializing] = useState(true);
    const [logUser, setlogUser] = useState();
    const domain = useRef(null);
    const [email, setemail] = useState('');
    const [pword, setpword] = useState('');
    const [emailinvalid, setemailinvalid] = useState(false);

    const [err, seterr] = useState(false);
    const [errmsg, seterrmsg] = useState(
        'Password and Confirm Password do not match',
    );
    useEffect(() => {
        setloading(true);

        const user = auth().currentUser;
        console.log('user', user);
        if (user.uid) {
            console.log(user.uid);
            setlogUser(user.email)
            firestore().collection('users_access').doc(user.uid).get().then(document => {
                // console.log(document.data().url);
                setloading(false);
                domain.current = document.data().url;
                setDomain(document.data().url);

                checkLogin();
            }).catch();
        }
        else {
            setloading(false);
            auth().signOut();

        }
    }, []);
    const inValidator = (err, msg) => {
        seterr(true), seterrmsg(msg);
    };

    const checkLogin = async () => {
        var username = await AsyncStorage.getItem('username');
        var password = await AsyncStorage.getItem('password');
        console.log(username + password);
        if (username && password) {
            setloading(true);
            const url = `${domain.current}/GetVendorLogin?username=${encodeURIComponent(username)}&pw=${encodeURIComponent(password)}&_token=b95909e1-d33f-469f-90c6-5a2fb1e5627c&_opco=`;
            console.log(url);
            fetch(url)
                .then(res => res.json())
                .then(data => {
                    console.log(data);
                    if (data.length > 0 && data[0].ACCESS_RIGHT !== null && data[0].CID !== null) {
                        setloading(false);

                        AsyncStorage.setItem('username', username);
                        AsyncStorage.setItem('password', password);
                        setUser({ ...data[0], user: email });
                        navigation.reset({
                            index: 0,
                            routes: [{ name: 'LoggedInContainer' }],
                        });
                    }
                    else {
                        setloading(false);
                        AsyncStorage.removeItem('username');
                        AsyncStorage.removeItem('password');
                    }
                })
                .catch(e => {
                    console.log(error, 'Function error');
                    setloading(false);
                    AsyncStorage.removeItem('username');
                    AsyncStorage.removeItem('password');
                })
        }
        else {

        }
    };

    const loginStart = () => {
        if (emailinvalid) return console.log('NO VALID');
        else if (email.length === 0) return inValidator(true, 'Username required');
        else if (pword.length === 0)
            return inValidator(true, 'Password Field Cannot be left Empty');
        else {
            setloading(true);
            const url = `${domain.current}/GetVendorLogin?username=${encodeURIComponent(email)}&pw=${encodeURIComponent(pword)}&_token=b95909e1-d33f-469f-90c6-5a2fb1e5627c&_opco=`;
            console.log(url);
            fetch(url)
                .then(res => res.json())
                .then(data => {
                    if (data.length > 0 && data[0].ACCESS_RIGHT !== null && data[0].CID !== null) {
                        setloading(false);
                        console.log(data[0]);
                        AsyncStorage.setItem('username', email);
                        AsyncStorage.setItem('password', pword);
                        setUser({ ...data[0], user: email });
                        navigation.reset({
                            index: 0,
                            routes: [{ name: 'LoggedInContainer' }],
                        });
                    }
                    else {
                        Alert.alert('Wrong credentials!')
                        setloading(false);
                    }
                })
                .catch(e => {
                    console.log('error:', e)
                    Alert.alert('Access Denied!');
                    // navigation.navigate('Home');
                    setloading(false);
                })
        }
    };
    const validateEmail = () => {
        var re = /\S+@\S+\.\S+/;
        return re.test(email);
    };
    const onLogOut = () => {
        auth().signOut();
        navigation.reset({
            index: 0,
            routes: [{ name: 'ClientSign' }],
        });
    };

    return (
        <View
            style={{
                flexDirection: 'column',
                justifyContent: 'center',
                paddingTop: 30,
                backgroundColor: '#FFF',
                flex: 1
            }}>
            <StatusBar barStyle="light-content" backgroundColor="#FFF" />

            <Image
                source={require('../assets/aero_icon.png')}
                resizeMode="contain"
                style={{ maxHeight: 100, width: '100%' }}
            />

            <View style={{ marginTop: 20, backgroundColor: 'white', marginHorizontal: 20, borderWidth: 1, borderRadius: 20, marginBottom: 10, paddingBottom: 20 }}>
                <Text
                    style={{
                        fontWeight: 'bold',
                        textAlign: 'center',
                        fontSize: 20,
                        color: 'white',
                        backgroundColor: '#012f6c',
                        paddingTop: 5,
                        paddingBottom: 5,
                        borderTopLeftRadius: 20, borderTopRightRadius: 20
                    }}>
                    User Sign In
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
                <View style={{ marginTop: 5, padding: 10 }}>
                    <Text
                        style={{
                            color: '#000',
                            fontWeight: 'bold',
                            fontSize: 16,
                            paddingTop: 5,
                            paddingBottom: 10,
                        }}>
                        Welcome {logUser},
                    </Text>
                    <Text style={{ color: '#000', fontSize: 18 }}>Username</Text>
                    {emailinvalid && (
                        <Text style={{ color: 'red', fontSize: 12, marginTop: 10 }}>
                            {email.length === 0
                                ? 'Username Required'
                                : 'Invalid Username'}
                        </Text>
                    )}
                    <TextInput

                        onChangeText={text => setemail(text)}
                        onFocus={() => {
                            setemailinvalid(false);
                        }}
                        onBlur={() => {
                            if (email.length === 0) setemailinvalid(true);
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
                                borderRadius: 6,
                                alignItems: 'center',
                            }}>
                            <ActivityIndicator />
                        </TouchableOpacity>
                    ) : (
                        <>
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
                            <TouchableOpacity>
                                <Text
                                    style={{ textAlign: 'center', color: '#000', marginTop: 20 }}
                                    onPress={onLogOut}>
                                    Log out Client
                                </Text>
                            </TouchableOpacity></>
                    )}
                </View>
            </View>

        </View>

    )
}

export default Login