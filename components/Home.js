import { View, Text, TouchableOpacity, ScrollView, Modal, Dimensions, TextInput, StatusBar, Image, StyleSheet, Alert } from 'react-native'
import React, { useState, useRef, useEffect } from 'react'
const { width, height } = Dimensions.get('window');
import AsyncStorage from '@react-native-async-storage/async-storage';
import auth from '@react-native-firebase/auth';
import RBSheet from 'react-native-raw-bottom-sheet';
import * as ImagePicker from 'react-native-image-picker';
import Icons from 'react-native-vector-icons/MaterialCommunityIcons';
import RNFetchBlob from 'rn-fetch-blob';
import { getDomain, getUser } from './functions/helper';

import Loader from './Loader';

const Home = ({ navigation }) => {
    const refRBSheet = useRef();
    const vendor = getUser();
    console.log(vendor)
    const [loading, setloading] = useState(false);
    const [modalVisibleCurrency, setmodalVisibleCurrency] = useState(false);
    const [modalVisibleSuccess, setmodalVisibleSuccess] = useState(false);
    const [modalVisiblePayment, setmodalVisiblePayment] = useState(false);
    const [currency, setcurrency] = useState([]);
    const [selCurr, setselCurr] = useState({
        ID: "91",
        LOOKUP_CODE: "SGD",
        LOOKUP_DESC: "SINGAPORE DOLLAR",
        Rates: {
            DEFAULT_RATE: "1",
            ID: "1",
            RATE: "1.0000"
        }
    });
    const [selPayment, setselPayment] = useState({
        ID: "64",
        LOOKUP_CODE: "CA",
        LOOKUP_DESC: "CASH"
    });
    const [expDesc, setexpDesc] = useState(null);
    const [amount, setamount] = useState(null);
    const [invoice_doc, setinvoice_doc] = useState(null);
    const [payment, setpayment] = useState([]);
    const onLogOut = () => {
        AsyncStorage.removeItem('username');
        AsyncStorage.removeItem('password');
        auth().signOut();
        navigation.reset({
            index: 0,
            routes: [{ name: 'ClientSign' }],
        });
    };
    const getImage = async type => {
        // console.log('HERE', uploadSection);
        var options = {
            mediaType: 'image',
            includeBase64: false,
            maxHeight: 800,
            maxWidth: 800,
        };
        console.log(options);
        switch (type) {
            case true:
                try {
                    options.mediaType = 'photo';
                    const result = await ImagePicker.launchImageLibrary(options);
                    console.log(result)
                    const file = result.assets[0];

                    onPressDocPreA_New(file);
                } catch (error) {
                    console.log(error);
                }
                break;
            case false:
                try {
                    const result = await ImagePicker.launchCamera(options);
                    const file = result.assets[0];
                    onPressDocPreA_New(file);
                } catch (error) {
                    console.log(error);
                }
                break;
            default:
                break;
        }
    };
    const onPressDocPreA_New = async (res) => {
        setloading(false);
        RNFetchBlob.fs
            .readFile(res.uri, 'base64')
            .then(encoded => {
                setloading(false);
                setinvoice_doc('data:' + res.type + ';base64,' + encoded);
            })
            .catch(error => {
                setloading(false);
                console.log(error);
            });

        // refRBSheet.current.close();
    };
    useEffect(() => {
        fetchInitialValues();
    }, []);

    const fetchInitialValues = () => {
        setloading(true);

        var domain = getDomain();
        // var domain = 'https://demo.vellas.net:94/arrowdemoapi_dev/api/Values';
        const url = `${domain}/GetPaymentRecieptDetail?_token=5B9CA45E-A570-4967-9C9E-21BA71DE4874`;
        console.log(url);
        fetch(url)
            .then(res => res.json())
            .then(data => {
                setloading(false);
                var apayment = [];
                var acurency = [];
                // console.log(data);
                data.map(val => {
                    // console.log(val)
                    val.TYPE == '11' ? acurency.push(val) : apayment.push(val)
                });
                console.log('curr', acurency)
                setcurrency(acurency);
                setpayment(apayment);

            })
            .catch(e => {
                console.log(e, 'Function error');
                setloading(false);
            })
    }
    const reset = () => {
        setamount(null);
        setexpDesc(null);
        setinvoice_doc(null);
        setselCurr({
            ID: "91",
            LOOKUP_CODE: "SGD",
            LOOKUP_DESC: "SINGAPORE DOLLAR",
            Rates: {
                DEFAULT_RATE: "1",
                ID: "1",
                RATE: "1.0000"
            }
        });
        setselPayment({
            ID: "64",
            LOOKUP_CODE: "CA",
            LOOKUP_DESC: "CASH"
        });
    }
    const submit = () => {

        if (!expDesc) {
            Alert.alert('Enter Expense description');
            return;

        }
        if (!amount) {
            Alert.alert('Enter Amount');
            return;
        }
        if (!invoice_doc) {
            Alert.alert('No invoice uploaded', 'Do you still want to proceed?', [
                {
                    text: 'No',
                    onPress: () => console.log('Cancel Pressed'),
                    style: 'cancel',
                },
                { text: 'Yes', onPress: () => postData() },
            ]);

        }
        else {
            postData();
        }
    }


    const postData = () => {
        setloading(true);
        var domain = getDomain();
        // var user = getUser();
        // var domain = 'https://demo.vellas.net:94/arrowdemoapi_dev/api/Values';
        var send = {

            "InvoiceParameters": {
                "UID": "",
                "INV_NO": "",
                REC_DATE: new Date().toISOString(),
                VENDOR_ID: vendor.id,
                REMARK: `Submitted by ${vendor.user} using ${selPayment.LOOKUP_DESC} \n ${expDesc}`,
                "OPCO": 3,
                "EXCH_ID": selCurr.Rates.ID,
                "EXCH_RATE": selCurr.Rates.RATE,
                STATUS: '0',
                UPDATE_BY: vendor.user,
                INVOICE_DOC: invoice_doc ? invoice_doc : ''
            },
            "InvoiceDetailParameters":
            {
                "UID": "",
                "UNIT_COST": parseFloat(amount),
            }

        };
        console.log(send);


        var myHeaders = new Headers();
        myHeaders.append('Accept', 'application/json');
        myHeaders.append("Content-Type", "application/json");
        var requestOptions = {
            method: 'POST',
            headers: myHeaders,
            body: JSON.stringify(send)
        };
        fetch(
            `${domain}/PostInvoice`,
            requestOptions,
        )
            .then(response => response.text())
            .then(result => {
                setloading(false);
                setmodalVisibleSuccess(true);
                reset();
                console.log(result);
                //   sethasUnsavedChanges(false)
            })
            .catch(error => {
                setloading(false);
                Alert.alert('Error in updating');
                console.log(error, 'Function error');
            });
    }




    return (
        <View style={{ flex: 1, backgroundColor: '#FFF', }}>
            <StatusBar barStyle="dark-content" backgroundColor="#FFF" />
            <Loader visible={loading} />
            <View style={{ flexDirection: 'row', padding: 10, justifyContent: 'space-between', paddingHorizontal: 20, alignItems: 'center' }}>
                <Text style={{ fontSize: width / 15, color: '#012f6c' }}>Upload Receipt</Text>
                <TouchableOpacity style={{ flexDirection: 'row' }} onPress={onLogOut}>
                    <Text style={{ fontSize: width / 25, color: '#012f6c', marginRight: 5 }}>Log Out</Text>

                    <Icons name="arrow-right-thin-circle-outline" size={width / 25} color={'#012f6c'} />

                </TouchableOpacity>
            </View>


            <ScrollView contentContainerStyle={{ flex: 1 }}>
                <View style={{ backgroundColor: 'white', padding: 20, flex: 1 }}>
                    <Text style={{ color: 'black', fontSize: width / 18, marginBottom: 20 }}>Vendor: {vendor.name}</Text>

                    <View style={{ flexDirection: 'row' }}>
                        <View style={{ justifyContent: 'center', padding: 10, backgroundColor: 'rgba(0,0,0,0.1)', borderRadius: 5, marginRight: 10 }}>
                            <Icons name="bookmark-outline" size={30} color={'#012f6c'} />
                        </View>
                        <TextInput value={expDesc} onChangeText={text => setexpDesc(text)} placeholder='Enter a description' placeholderTextColor={'rgba(0,0,0,0.4)'} textAlignVertical='top' style={{ color: 'black', borderBottomWidth: 1, borderColor: 'rgba(0,0,0,0.2)', fontSize: width / 20, flex: 1, }} />
                    </View>
                    <View style={{ flexDirection: 'row', marginTop: 20 }}>


                        <TouchableOpacity onPress={() => { setmodalVisibleCurrency(true); }} style={{ justifyContent: 'center', padding: 10, backgroundColor: 'rgba(0,0,0,0.1)', borderRadius: 5, marginRight: 10 }}>
                            <Text style={{ color: '#012f6c', fontSize: width / 20, fontWeight: 'bold' }}>{selCurr.LOOKUP_CODE}</Text>
                        </TouchableOpacity>
                        <TextInput keyboardType='decimal-pad' value={amount} onChangeText={text => setamount(text)} placeholder='Amount' placeholderTextColor={'rgba(0,0,0,0.4)'} textAlignVertical='top' style={{ color: 'black', borderBottomWidth: 1, borderColor: 'rgba(0,0,0,0.2)', fontSize: width / 20, flex: 1, }} />
                    </View>
                    <View style={{ marginTop: 20, justifyContent: 'center', flexDirection: 'row', alignItems: 'center' }}>
                        <Text style={{ color: 'black', fontSize: width / 18, marginRight: 20 }}>Paid by:</Text>
                        <TouchableOpacity onPress={() => { setmodalVisiblePayment(true); }} style={{ justifyContent: 'center', padding: 10, backgroundColor: 'rgba(0,0,0,0.1)', borderRadius: 5, marginRight: 10 }}>
                            <Text style={{ color: '#012f6c', fontSize: width / 20, fontWeight: 'bold' }}>{selPayment.LOOKUP_DESC}</Text>
                        </TouchableOpacity>
                    </View>

                    <TouchableOpacity onPress={submit} style={{ backgroundColor: '#012f6c', padding: 10, marginVertical: 20, borderRadius: 5 }}>
                        <Text style={{ color: 'white', textAlign: 'center', fontSize: width / 18 }}>Submit</Text>
                    </TouchableOpacity>
                    {invoice_doc && <View style={styleSheet.attachment}>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', width: '100%', alignItems: 'center', marginBottom: 10 }}>
                            <Text style={{ color: '#012f6c', fontSize: width / 20 }}>Expense invoice</Text>
                            <TouchableOpacity
                                onPress={() => setinvoice_doc(null)}
                            >
                                <Icons
                                    style={{ color: '#012f6c', marginLeft: 10 }}
                                    name="close"
                                    size={30}
                                />
                            </TouchableOpacity>
                        </View>
                        <View
                            style={{
                                height: 100,
                                width: '100%',
                                position: 'relative',
                                overflow: 'hidden',
                                alignItems: 'center'
                            }}>
                            <Image

                                resizeMode="cover"
                                source={{ uri: invoice_doc }}
                                style={{
                                    position: 'absolute',
                                    top: 0,
                                    width: '90%',
                                    height: '90%',
                                }}
                            />
                        </View>

                    </View>}

                </View>

            </ScrollView>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderTopWidth: 1, paddingHorizontal: 20, borderColor: 'rgba(0,0,0,0.2)', paddingVertical: 10 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Image
                        source={require('../assets/aero_icon.png')}
                        resizeMode="contain"
                        style={{ maxHeight: 30, width: 50, marginRight: 10 }}
                    />
                    <TouchableOpacity>
                        <Text style={{ color: '#012f6c', fontWeight: 'bold' }}>Simplify Aero</Text>
                    </TouchableOpacity>
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <TouchableOpacity onPress={() => getImage(false)}>
                        <Icons name="camera-outline" size={30} color={'#012f6c'} style={{ marginRight: 10 }} />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => getImage(true)}>
                        <Icons name="image-outline" size={30} color={'#012f6c'} />
                    </TouchableOpacity>

                </View>
            </View>
            <Modal animationType="fade" transparent={true} visible={modalVisibleCurrency}>
                <TouchableOpacity
                    style={{
                        top: 20,
                        right: 20,
                        position: 'absolute',
                        // backgroundColor: 'white',
                        zIndex: 99,
                        padding: 10,
                    }}
                    onPress={() => setmodalVisibleCurrency(false)}>
                    <Text style={{ color: 'white', fontSize: width / 15 }}>Close</Text>
                </TouchableOpacity>
                <View
                    style={{
                        flex: 1,
                        justifyContent: 'center',
                        alignItems: 'center',
                        backgroundColor: 'rgba(0,0,0,0.8)',
                        paddingTop: 80,
                    }}>
                    <ScrollView>
                        {
                            currency.map((val, index) => {
                                return <TouchableOpacity
                                    key={index}
                                    onPress={() => {
                                        setmodalVisibleCurrency(false);
                                        setselCurr(val);
                                        console.log(val)
                                    }}
                                    style={{
                                        // backgroundColor: 'white',
                                        width: width * 0.9,
                                        padding: 20,
                                        borderBottomWidth: 2,
                                    }}>
                                    <Text style={{ color: 'white', fontSize: width / 15, textAlign: 'center' }}>
                                        {val.LOOKUP_DESC}
                                    </Text>
                                </TouchableOpacity>
                            })
                        }

                    </ScrollView>
                </View>
            </Modal >

            <Modal animationType="fade" transparent={true} visible={modalVisiblePayment}>
                <TouchableOpacity
                    style={{
                        top: 20,
                        right: 20,
                        position: 'absolute',
                        // backgroundColor: 'white',
                        zIndex: 99,
                        padding: 10,
                    }}
                    onPress={() => setmodalVisiblePayment(false)}>
                    <Text style={{ color: 'white', fontSize: width / 15 }}>Close</Text>
                </TouchableOpacity>
                <View
                    style={{
                        flex: 1,
                        justifyContent: 'center',
                        alignItems: 'center',
                        backgroundColor: 'rgba(0,0,0,0.8)',
                        paddingTop: 80,
                    }}>
                    <ScrollView>
                        {
                            payment.map((val, index) => {
                                return <TouchableOpacity
                                    key={index}
                                    onPress={() => {
                                        setmodalVisiblePayment(false);
                                        setselPayment(val);
                                        console.log(val)
                                    }}
                                    style={{
                                        // backgroundColor: 'white',
                                        width: width * 0.9,
                                        padding: 20,
                                        borderBottomWidth: 2,
                                    }}>
                                    <Text style={{ color: 'white', fontSize: width / 15, textAlign: 'center' }}>
                                        {val.LOOKUP_DESC}
                                    </Text>
                                </TouchableOpacity>
                            })
                        }

                    </ScrollView>
                </View>
            </Modal >

            <Modal animationType="fade" transparent={true} visible={modalVisibleSuccess}>

                <View
                    style={{
                        flex: 1,
                        justifyContent: 'center',
                        alignItems: 'center',
                        backgroundColor: 'rgba(0,0,0,0.8)',

                    }}>
                    <View style={{
                        backgroundColor: 'white',
                        borderRadius: 10,
                        padding: 20,
                        width: '90%',
                        alignItems: 'center',
                        marginTop: 10,
                        // marginHorizontal: 5,
                        ...Platform.select({
                            ios: {
                                shadowColor: '#000',
                                shadowOffset: { width: 0, height: 2 },
                                shadowOpacity: 0.8,
                                shadowRadius: 2,
                            },
                            android: {
                                elevation: 3,
                            },
                        }),
                    }}>
                        <View style={{ justifyContent: 'flex-end', width: '100%' }}>
                            <TouchableOpacity
                                style={{

                                }}
                                onPress={() => setmodalVisibleSuccess(false)}>
                                <Text style={{ color: '#012f6c', fontSize: width / 15, textAlign: 'right' }}>X</Text>
                            </TouchableOpacity>
                        </View>
                        <Icons name="check-circle" size={80} color={'green'} />
                        <Text style={{ color: '#012f6c', fontSize: width / 15, textAlign: 'right' }}>Successfully uploaded</Text>


                    </View>
                </View>
            </Modal >
        </View >
    )
}

const styleSheet = StyleSheet.create({
    attachment: {
        backgroundColor: 'white',
        borderRadius: 10,
        padding: 10,
        alignItems: 'center',
        marginTop: 10,
        // marginHorizontal: 5,
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.8,
                shadowRadius: 2,
            },
            android: {
                elevation: 3,
            },
        }),
    },
})

export default Home