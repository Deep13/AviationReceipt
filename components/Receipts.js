import React, { useState, useRef, useEffect } from 'react'
import { getDomain, getUser } from './functions/helper';
import { View, Text, TouchableOpacity, ScrollView, Modal, Dimensions, TextInput, StatusBar, Image, StyleSheet, Alert } from 'react-native';
import Loader from './Loader';
import AsyncStorage from '@react-native-async-storage/async-storage';
import auth from '@react-native-firebase/auth';
const { width, height } = Dimensions.get('window');
import IconsFont from 'react-native-vector-icons/FontAwesome';
import IconsFontIonicons from 'react-native-vector-icons/Ionicons';

export default function Receipts({ navigation }) {
    const vendor = getUser();
    const [onLogOut, setonLogOut] = useState(false);
    const [loading, setloading] = useState(false);
    const [receiptList, setreceiptList] = useState([]);
    const onLogOutPressed = () => {
        AsyncStorage.removeItem('username');
        AsyncStorage.removeItem('password');
        // auth().signOut();
        navigation.reset({
            index: 0,
            routes: [{ name: 'SignInContainer' }],
        });
    };

    const refresh = () => {
        setloading(true);

        var domain = getDomain();
        // var domain = 'https://demo.vellas.net:94/arrowdemoapi_dev/api/Values';
        const url = `${domain}/GetListOfInvoiceByUser?_token=b95909e1-d33f-469f-90c6-5a2fb1e5627c&username=${vendor.user}`;
        console.log(url);
        fetch(url)
            .then(res => res.json())
            .then(data => {
                setloading(false);
                console.log(data)
                if (data && data.length > 0) {
                    // data[0].COMPLETED = 1;
                    setreceiptList([...data])
                }

            })
            .catch(e => {
                console.log(e, 'Function error');
                setloading(false);
            })
    }

    useEffect(() => {
        setloading(true);

        var domain = getDomain();
        // var domain = 'https://demo.vellas.net:94/arrowdemoapi_dev/api/Values';
        const url = `${domain}/GetListOfInvoiceByUser?_token=b95909e1-d33f-469f-90c6-5a2fb1e5627c&username=${vendor.user}`;
        console.log(url);
        fetch(url)
            .then(res => res.json())
            .then(data => {
                setloading(false);
                console.log(data)
                if (data && data.length > 0) {
                    // data[0].COMPLETED = 1;
                    setreceiptList([...data])
                }

            })
            .catch(e => {
                console.log(e, 'Function error');
                setloading(false);
            })
    }, [])

    return (
        <View style={{ flex: 1, backgroundColor: '#FFF', }}>
            <StatusBar barStyle="dark-content" backgroundColor="#FFF" />
            <Loader visible={loading} />
            <View style={{ flexDirection: 'row', padding: 10, justifyContent: 'space-between', alignItems: "flex-start", paddingHorizontal: 10, }}>
                <View style={{ flexDirection: 'row', justifyContent: 'flex-start', alignItems: "flex-start", flex: 1, marginRight: 10, flexWrap: "wrap" }}>
                    <Image
                        source={require('../assets/aero_icon.png')}
                        resizeMode="contain"
                        style={{ maxHeight: 30, width: 50, marginRight: 10 }}
                    />
                    <Text style={{ fontSize: width / 25, color: '#012f6c' }}>{vendor.user}</Text>
                </View>
                <TouchableOpacity onPress={() => setonLogOut(true)}>
                    <IconsFont name="power-off" size={width / 20} color={'red'} />
                </TouchableOpacity>
            </View>
            <View style={{ justifyContent: 'space-between', alignItems: "center", flexDirection: 'row', paddingBottom: 10, borderBottomWidth: 1, borderBottomColor: 'rgba(0,0,0,0.4)', marginHorizontal: 10 }}>
                <Text style={{ fontSize: width / 20, color: "black" }}>Receipts</Text>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <TouchableOpacity onPress={() => {
                        navigation.navigate("Home", {
                            receipt: null
                        })
                    }} style={{ backgroundColor: "#012f6c", marginTop: 10, padding: 10, borderRadius: 8, flexDirection: 'row', alignItems: 'center' }}>
                        <IconsFont name="plus" size={width / 20} color={'white'} />
                        <Text style={{ color: "white", marginLeft: 10 }}>Add Receipt</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => {
                        refresh()
                    }} style={{ marginTop: 10, padding: 10, borderRadius: 8, flexDirection: 'row', alignItems: 'center' }}>
                        <IconsFontIonicons name="reload" size={width / 15} color={'#012f6c'} />
                    </TouchableOpacity>
                </View>
            </View>
            <ScrollView contentContainerStyle={{ paddingBottom: 20 }}>
                {receiptList.map((val, index) => {
                    return <TouchableOpacity onPress={() => navigation.navigate("Home", {
                        receipt: val
                    })} key={index} style={{ backgroundColor: "#3f77c8", marginTop: 10, padding: 10, borderRadius: 8, marginHorizontal: 20 }}>
                        <Text style={{ color: "white" }}>Receipt No.: {val.INV_NO}</Text>
                        <Text style={{ color: "white" }}>{val.REC_DATE}</Text>
                        <Text style={{ color: "white" }}>Amount: {val.TOTAL_AMOUNT}</Text>
                    </TouchableOpacity>
                })}
            </ScrollView>
            <Modal transparent={true} visible={onLogOut} style={{ position: 'absolute', width: '100%' }}>
                <View style={{ backgroundColor: 'rgba(0,0,0,0.5)', flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                    <View style={{ backgroundColor: 'white', padding: 20, margin: 20, borderRadius: 8, alignItems: 'center' }}>
                        <Text style={{ color: 'black', fontWeight: 'bold', fontSize: width / 30 }}>Are you sure you want to Log Out ?</Text>
                        <View style={{ flexDirection: 'row', marginTop: 20 }}>
                            <TouchableOpacity onPress={onLogOutPressed} style={[styleSheet.button, { backgroundColor: 'white', }]}>
                                <Text style={[styleSheet.buttonText, { color: 'black', paddingHorizontal: 10 }]}>Yes</Text>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => setonLogOut(false)} style={[styleSheet.button, { marginLeft: 20 }]}>
                                <Text style={[styleSheet.buttonText, { paddingHorizontal: 10 }]}>No</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    )
}

const styleSheet = StyleSheet.create({
    button: {
        backgroundColor: '#01315C',
        borderRadius: 8,
        padding: 10,
    },

    buttonText: {
        color: 'white',
        textAlign: 'center',
    }
})