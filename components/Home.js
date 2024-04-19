import { View, Text, TouchableOpacity, ScrollView, Modal, Dimensions, TextInput, StatusBar, Image, StyleSheet, Alert } from 'react-native'
import React, { useState, useRef, useEffect } from 'react'
const { width, height } = Dimensions.get('window');
import * as ImagePicker from 'react-native-image-picker';
import Icons from 'react-native-vector-icons/MaterialCommunityIcons';
import IconsFont from 'react-native-vector-icons/FontAwesome';
import IconsFontM from 'react-native-vector-icons/MaterialIcons';
import RNFetchBlob from 'rn-fetch-blob';
import { getDomain, getUser } from './functions/helper';
import DatePicker from 'react-native-date-picker'
import Loader from './Loader';
import DocumentPicker from 'react-native-document-picker';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'


const Home = ({ navigation, route }) => {
    const vendor = getUser();
    const { receipt } = route.params;
    console.log("receipt", receipt)
    const [loading, setloading] = useState(false);
    const [fullCurrency, setfullCurrency] = useState([]);
    const [fullPaymentMode, setfullPaymentMode] = useState([]);
    const [modalVisibleCurrency, setmodalVisibleCurrency] = useState(false);
    const [statusModal, setstatusModal] = useState(false);
    const [modalVisibleCurrencyClaim, setmodalVisibleCurrencyClaim] = useState(false);
    const [modalVisibleSuccess, setmodalVisibleSuccess] = useState(false);
    const [modalVisiblePayment, setmodalVisiblePayment] = useState(false);
    const [currency, setcurrency] = useState([]);
    const [date, setDate] = useState(new Date())
    const [open, setOpen] = useState(false);
    const [Remove, setRemove] = useState(false);
    const [query, setQuery] = useState('');

    const Receiptstatus = [{ key: '3', desc: "Ready" }, { key: '2', desc: "Draft" }]
    const [receiptModal, setreceiptModal] = useState({
        "ReceiptParameters": {
            "REC_DATE": "",
            "INVOICE_DOC": "",
            "PAY_MODE": "",
            "PAY_MODE_TEXT": "",
            "EXCH_ID": "",
            "EXCH_ID_TEXT": "",
            "EXCH_RATE": "0",
            "UID": "",
            "INV_NO": "",
            "INV_TYPE": "0",
            "VENDOR_ID": vendor.ID,
            "REMARK": "",
            "OPCO": "3",
            "STATUS": "0",
            "EXCH_COST": "",
            "UPDATE_BY": vendor.user,
            "UploadDocs": [],
            "COMPLETED": "",
            "COMPLETED_DESC": "",
        },
        "ReceiptDetailParameters": {
            "UID": "",
            "DESCRIPTION": "",
            "UNIT_COST": "",
            "EXCH_ID": "92",
            "EXCH_RATE": "",
            "EXCH_ID_TEXT": "US DOLLAR",
            "CALL_SIGN": "",
            "TRIP_NUMBER": "",
        }
    });
    const handleSearch = text => {
        console.log('search text', text)
        const formattedQuery = text.toLowerCase();
        const filteredData = fullCurrency.filter(user => {
            return user.LOOKUP_CODE.toLowerCase().includes(formattedQuery);
        });
        console.log('filtered', filteredData)

        setcurrency(filteredData);
        setQuery(text);
    };
    const [payment, setpayment] = useState([]);
    const onRemove = () => {
        if (receipt && receipt.COMPLETED != 0) {
            Alert.alert("You cannot remove this completed receipt");
            setRemove(false)
            return;
        }
        setloading(true);
        var domain = getDomain();
        var myHeaders = new Headers();
        myHeaders.append('Accept', 'application/json');
        myHeaders.append("Content-Type", "application/json");
        console.log("delete", JSON.stringify({
            "token": "348EF663-2D24-4E96-BA1C-6B7AD98A44C2",
            "username": vendor.USERNAME,
            "ReceiptList": [{
                "uid": receipt.UID,
                "inv_no": receipt.INV_NO
            }
            ]
        }))
        var requestOptions = {
            method: 'POST',
            headers: myHeaders,
            body: JSON.stringify({
                "token": "348EF663-2D24-4E96-BA1C-6B7AD98A44C2",
                "username": vendor.USERNAME,
                "ReceiptList": [{
                    "uid": receipt.UID,
                    "inv_no": receipt.INV_NO
                }
                ]
            })
        };
        fetch(
            `${domain}/DeleteReceipt`,
            requestOptions,
        )
            .then(response => response.text())
            .then(result => {
                setloading(false);
                reset();
                navigation.replace("Receipts")
                //   sethasUnsavedChanges(false)
            })
            .catch(error => {
                setloading(false);
                Alert.alert('Error in updating');
                console.log(error, 'Function error');
            });
    };

    // const convertDateString = (date) =>{
    //     return 
    // }
    const getImage = async (type) => {
        var options = {
            mediaType: 'image',
            includeBase64: true,
            maxHeight: 800,
            maxWidth: 800,
        };
        console.log(options);
        switch (type) {
            case true:
                try {
                    const result = await ImagePicker.launchCamera(options);
                    console.log(result)
                    const file = result.assets[0];
                    var doc = {
                        "filename": file.fileName.split(".")[0],
                        "b64": 'data:' + file.type + ';base64,' + file.base64,
                        "fileExtension": file.type.split("/")[1]
                    };
                    var oldReceipt = { ...receiptModal };
                    oldReceipt.ReceiptParameters.UploadDocs.push(doc);
                    setreceiptModal({ ...oldReceipt })
                } catch (error) {
                    console.log(error);
                }
                break;
            case false:
                try {

                    const res = await DocumentPicker.pickSingle({
                        type: [DocumentPicker.types.images, DocumentPicker.types.pdf],
                    });

                    // console.log("doc", res);
                    onPressDocPreA_New(res);
                } catch (error) {
                    console.log(error);
                }
                break;
            default:
                break;
        }

    };
    const formatDate2 = (inputDate) => {

        let day = inputDate.getDate();

        let month = inputDate.getMonth() + 1;

        let year = inputDate.getFullYear();
        if (day < 10) {
            day = '0' + day;
        }

        if (month < 10) {
            month = `0${month}`;
        }

        let formatted = `${day}/${month}/${year}`;
        return formatted;
    };
    const onPressDocPreA_New = async (res) => {
        setloading(false);
        RNFetchBlob.fs
            .readFile(res.uri, 'base64')
            .then(encoded => {
                setloading(false);
                // console.log('data:' + res.type + ';base64,' + encoded);

                var doc = {
                    "filename": res.name.split(".")[0],
                    "b64": 'data:' + res.type + ';base64,' + encoded,
                    "fileExtension": res.type.split("/")[1]
                };
                var oldReceipt = { ...receiptModal };
                oldReceipt.ReceiptParameters.UploadDocs.push(doc);
                setreceiptModal({ ...oldReceipt })
                console.log(receiptModal);
            })
            .catch(error => {
                setloading(false);
                console.log(error);
            });

        // refRBSheet.current.close();
    };

    const saveFile = (val, fileName) => {
        const DownloadDir =
            Platform.OS == 'ios'
                ? RNFetchBlob.fs.dirs.DocumentDir
                : RNFetchBlob.fs.dirs.DownloadDir + '/Aviation_Receipt';
        const headers = {
            'data:image/png;base64': '.png',
            'data:image/jpeg;base64': '.jpg',
            'data:application/pdf;base64': '.pdf'
            // Add more checks for other file types as needed
        };
        var type = headers[val.split(",")[0]];
        var bs64 = val.split(",")[1];
        var pdfLocation = DownloadDir + '/' + fileName + type;
        // console.log(pdfLocation);
        // console.log(val)
        RNFetchBlob.fs
            .isDir(DownloadDir)
            .then(isDir => {
                if (isDir) {
                    console.log('iSDir');
                    RNFetchBlob.fs
                        .writeFile(pdfLocation, bs64, 'base64')
                        .then(res => {
                            // console.log('saved', res);
                            Alert.alert('Saved', 'Document has been saved in Downloads/Aviation_Receipt folder', [
                                {
                                    text: 'View', onPress: () => {
                                        // console.log(pdfLocation, val.split(',')[0].split(';')[0].split(':')[1])
                                        RNFetchBlob.android.actionViewIntent(pdfLocation, val.split(',')[0].split(';')[0].split(':')[1]);
                                    }
                                },
                                { text: 'OK' },
                            ])
                        })
                        .catch(err => {
                            console.log(err)
                            Alert.alert('Error in saving file')
                        });
                } else {
                    RNFetchBlob.fs
                        .mkdir(DownloadDir)
                        .then(() => {
                            console.log('Created Folder');
                            RNFetchBlob.fs
                                .writeFile(pdfLocation, bs64, 'base64')
                                .then(res => {
                                    console.log('saved');
                                    Alert.alert('Saved', 'Document has been saved in Downloads/Aviation_receipt folder', [
                                        {
                                            text: 'View', onPress: () => {
                                                // console.log(pdfLocation, val.split(',')[0].split(';')[0].split(':')[1])
                                                RNFetchBlob.android.actionViewIntent(pdfLocation, val.split(',')[0].split(';')[0].split(':')[1]);
                                            }
                                        },
                                        { text: 'OK' },
                                    ])
                                })
                                .catch(err => {
                                    Alert.alert('Error in saving file')
                                });
                        })
                        .catch(err => {
                            console.log('is Not dir', err);
                            Alert.alert('Error in saving file')
                        });
                }
            })
            .catch(err => {
                Alert.alert('Error in saving file')
            });
    }



    useEffect(() => {
        if (receipt) {
            setloading(true);
            var domain = getDomain();
            // var domain = 'https://demo.vellas.net:94/arrowdemoapi_dev/api/Values';
            const url = `${domain}/GetReceiptDetail?_token=b95909e1-d33f-469f-90c6-5a2fb1e5627c&UID=${receipt.UID}`;
            console.log(url);
            fetch(url)
                .then(res => res.json())
                .then(data => {
                    // setloading(false);
                    console.log(data, "detail")
                    if (data && data.length > 0) {
                        const url2 = `${domain}/GetReceiptFiles?_token=b95909e1-d33f-469f-90c6-5a2fb1e5627c&UID=${receipt.UID}`;
                        fetch(url2)
                            .then(res => res.json())
                            .then(dataFIle => {
                                setloading(false);
                                // console.log(dataFIle, "files")
                                // if (dataFIle && dataFIle.length > 0) {
                                // setreceiptList(data)
                                // console.log({
                                //     receipt: { ...receipt },
                                //     detail: { ...data[0] }
                                // })
                                setreceiptModal({
                                    "ReceiptParameters": {
                                        "REC_DATE": receipt.REC_DATE,
                                        "INVOICE_DOC": receipt.INVOICE_DOC,
                                        "PAY_MODE": receipt.PAY_MODE,
                                        "PAY_MODE_TEXT": receipt.PAY_MODE_DESC,
                                        "EXCH_ID": receipt.EXCH_ID,
                                        "EXCH_ID_TEXT": receipt.EXCH_DESC,
                                        "EXCH_RATE": receipt.EXCH_RATE?.toString(),
                                        "UID": receipt.UID,
                                        "INV_NO": receipt.INV_NO,
                                        "INV_TYPE": receipt.INV_TYPE,
                                        "VENDOR_ID": receipt.VENDOR_ID,
                                        "REMARK": receipt.REMARK,
                                        "OPCO": "3",
                                        "STATUS": "0",
                                        "UPDATE_BY": receipt.UPDATE_BY,
                                        "EXCH_COST": receipt.EXCH_COST?.toString(),
                                        "COMPLETED": receipt.COMPLETED,
                                        "COMPLETED_DESC": receipt.COMPLETED_DESC,
                                        "UploadDocs": dataFIle.length > 0 ? dataFIle : []
                                    },
                                    "ReceiptDetailParameters": {
                                        "UID": data[0].UID,
                                        "DESCRIPTION": data[0].DESC_ENG,
                                        "UNIT_COST": data[0].UNIT_COST?.toString(),
                                        "EXCH_ID": data[0].CUR_ID,
                                        "EXCH_RATE": data[0].CUR_RATE?.toString(),
                                        "EXCH_ID_TEXT": data[0].CURRENCY_DESC,
                                        "CALL_SIGN": "",
                                        "TRIP_NUMBER": "",
                                    }
                                });

                                // }


                            })
                            .catch(e => {
                                console.log(e, 'Function error');
                                setloading(false);
                            })
                    }

                })
                .catch(e => {
                    console.log(e, 'Function error');
                    setloading(false);
                })
        }
        else {
            setreceiptModal({
                "ReceiptParameters": {
                    "REC_DATE": "",
                    "INVOICE_DOC": "",
                    "PAY_MODE": "",
                    "PAY_MODE_TEXT": "",
                    "EXCH_ID": "",
                    "EXCH_ID_TEXT": "",
                    "EXCH_RATE": "0",
                    "UID": "",
                    "INV_NO": "",
                    "INV_TYPE": "0",
                    "VENDOR_ID": vendor.ID,
                    "REMARK": "",
                    "OPCO": "3",
                    "STATUS": "0",
                    "UPDATE_BY": vendor.user,
                    "UploadDocs": [],
                    "EXCH_COST": ""
                },
                "ReceiptDetailParameters": {
                    "UID": "",
                    "DESCRIPTION": "",
                    "UNIT_COST": "",
                    "EXCH_ID": "92",
                    "EXCH_RATE": "",
                    "EXCH_ID_TEXT": "US DOLLAR",
                    "CALL_SIGN": "",
                    "TRIP_NUMBER": "",
                }
            })
        }
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
                console.log('curr', acurency);
                setfullCurrency(acurency);
                setfullPaymentMode(apayment);
                setcurrency(acurency);
                setpayment(apayment);

            })
            .catch(e => {
                console.log(e, 'Function error');
                setloading(false);
            })
    }
    const reset = () => {
        setreceiptModal({
            "ReceiptParameters": {
                "REC_DATE": "",
                "INVOICE_DOC": "",
                "PAY_MODE": "",
                "PAY_MODE_TEXT": "",
                "EXCH_ID": "",
                "EXCH_ID_TEXT": "",
                "EXCH_RATE": "0",
                "UID": "",
                "INV_NO": "",
                "INV_TYPE": "0",
                "VENDOR_ID": vendor.ID,
                "REMARK": "",
                "OPCO": "3",
                "STATUS": "0",
                "UPDATE_BY": vendor.user,
                "UploadDocs": [],
                "EXCH_COST": ""
            },
            "ReceiptDetailParameters": {
                "UID": "",
                "DESCRIPTION": "",
                "UNIT_COST": "",
                "EXCH_ID": "",
                "EXCH_RATE": "",
                "EXCH_ID_TEXT": "",
                "CALL_SIGN": "",
                "TRIP_NUMBER": "",
            }
        })
    }
    const submit = () => {
        // console.log(receipt.COMPLETED)
        if (receipt && receipt.COMPLETED == 1) {
            Alert.alert("You cannot edit this completed receipt");
            return;
        }
        console.log(receiptModal);
        var oReceipt = ["REC_DATE",
            "INVOICE_DOC",
            "PAY_MODE",
            "EXCH_ID"];
        for (i = 0; i < oReceipt.length; i++) {
            console.log(oReceipt[i])
            if (!receiptModal.ReceiptParameters[oReceipt[i]]) {
                Alert.alert("Fields marked with (*) are mandatory");
                return;
                break;
            }

        }

        console.log("Next");

        var oReceiptDetail = ["UNIT_COST",
            "EXCH_ID",
            "EXCH_RATE"];
        for (i = 0; i < oReceiptDetail.length; i++) {
            console.log(oReceiptDetail[i])
            if (!receiptModal.ReceiptDetailParameters[oReceiptDetail[i]]) {
                Alert.alert("Fields marked with (*) are mandatory");
                return;
                break;
            }

        }
        postData();

    }

    const removeDoc = (index) => {
        var oldReceipt = { ...receiptModal };
        oldReceipt.ReceiptParameters.UploadDocs.splice(index, 1);
        setreceiptModal({ ...oldReceipt })
    }

    const postData = () => {
        setloading(true);
        var domain = getDomain();
        var postData = { ...receiptModal };

        postData.ReceiptParameters.REMARK = postData.ReceiptParameters.REMARK + `\nCall Sign : ` + postData.ReceiptDetailParameters.CALL_SIGN + `\nTrip Number: ` + postData.ReceiptDetailParameters.TRIP_NUMBER;
        console.log("receiptModal", JSON.stringify(postData));
        var myHeaders = new Headers();
        myHeaders.append('Accept', 'application/json');
        myHeaders.append("Content-Type", "application/json");
        var requestOptions = {
            method: 'POST',
            headers: myHeaders,
            body: JSON.stringify(postData)
        };
        fetch(
            `${domain}/PostReceipt`,
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
            <KeyboardAwareScrollView>
                <View style={{ backgroundColor: 'white', padding: 20, flex: 1 }}>

                    <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 20, justifyContent: "space-between" }}>
                        <TouchableOpacity onPress={() => {
                            navigation.replace("Receipts")
                        }}>
                            <IconsFont name="chevron-left" size={width / 15} color={'#012f6c'} />
                        </TouchableOpacity>
                        {vendor.ID !== 0 && <Text style={{ color: 'black', fontSize: width / 18, }}>Vendor: {vendor.NAME}</Text>}
                    </View>

                    <View style={{ flexDirection: 'column' }}>
                        <Text style={{ color: "#012f6c" }}>Enter Date*</Text>
                        <TouchableOpacity onPress={() => setOpen(true)} style={{ marginVertical: 10, borderRadius: 5, borderWidth: 1, borderColor: "rgba(0,0,0,0.3)", paddingVertical: 10, paddingLeft: 5 }}>
                            <Text style={{ color: receiptModal.ReceiptParameters.REC_DATE ? 'black' : 'rgba(0,0,0,0.4)', fontSize: width / 25 }}>{receiptModal.ReceiptParameters.REC_DATE ? formatDate2(new Date(receiptModal.ReceiptParameters.REC_DATE)) : "DD/MM/YYYY"}</Text>
                        </TouchableOpacity>
                        <DatePicker
                            modal
                            open={open}
                            date={date}
                            mode="date"
                            onConfirm={(date) => {
                                setDate(date)
                                setOpen(false)
                                setreceiptModal((prevModal) => ({
                                    ...prevModal,
                                    ReceiptParameters: {
                                        ...prevModal.ReceiptParameters,
                                        REC_DATE: date.toLocaleDateString('en-GB', {
                                            year: 'numeric',
                                            month: '2-digit',
                                            day: '2-digit',
                                        }).split('/').reverse().join('-')
                                    },
                                }));
                            }}
                            onCancel={() => {
                                setOpen(false)
                            }}
                        />
                    </View>
                    <View style={{ flexDirection: 'column' }}>
                        <Text style={{ color: "#012f6c" }}>Enter Receipt Number*</Text>
                        <TextInput value={receiptModal.ReceiptParameters.INVOICE_DOC} onChangeText={text => setreceiptModal((prevModal) => ({
                            ...prevModal,
                            ReceiptParameters: {
                                ...prevModal.ReceiptParameters,
                                INVOICE_DOC: text
                            }
                        }))} placeholder='Enter receipt number' placeholderTextColor={'rgba(0,0,0,0.4)'} style={{ marginVertical: 10, borderRadius: 5, borderWidth: 1, borderColor: "rgba(0,0,0,0.3)", paddingVertical: 10, paddingLeft: 5, fontSize: width / 25, color: "black" }} />
                    </View>
                    <View style={{ flexDirection: 'column' }}>
                        <Text style={{ color: "#012f6c" }}>Enter Call Sign*</Text>
                        <TextInput value={receiptModal.ReceiptDetailParameters.CALL_SIGN} onChangeText={text => setreceiptModal((prevModal) => ({
                            ...prevModal,
                            ReceiptDetailParameters: {
                                ...prevModal.ReceiptDetailParameters,
                                CALL_SIGN: text
                            }
                        }))} placeholder='Enter receipt number' placeholderTextColor={'rgba(0,0,0,0.4)'} style={{ marginVertical: 10, borderRadius: 5, borderWidth: 1, borderColor: "rgba(0,0,0,0.3)", paddingVertical: 10, paddingLeft: 5, fontSize: width / 25, color: "black" }} />
                    </View>
                    <View style={{ flexDirection: 'column' }}>
                        <Text style={{ color: "#012f6c" }}>Enter Trip Number*</Text>
                        <TextInput value={receiptModal.ReceiptDetailParameters.TRIP_NUMBER} onChangeText={text => setreceiptModal((prevModal) => ({
                            ...prevModal,
                            ReceiptDetailParameters: {
                                ...prevModal.ReceiptDetailParameters,
                                TRIP_NUMBER: text
                            }
                        }))} placeholder='Enter receipt number' placeholderTextColor={'rgba(0,0,0,0.4)'} style={{ marginVertical: 10, borderRadius: 5, borderWidth: 1, borderColor: "rgba(0,0,0,0.3)", paddingVertical: 10, paddingLeft: 5, fontSize: width / 25, color: "black" }} />
                    </View>

                    <View style={{ flexDirection: 'column' }}>
                        <Text style={{ color: "#012f6c" }}>Select Payment Mode*</Text>
                        <TouchableOpacity onPress={() => setmodalVisiblePayment(true)} style={{
                            backgroundColor: "rgb(255,255,255)", marginVertical: 10, borderRadius: 5, borderWidth: 1, borderColor: "rgba(0,0,0,0.3)", padding: 10, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'
                        }}>
                            <Text style={{ color: receiptModal.ReceiptParameters.PAY_MODE_TEXT ? 'black' : 'rgba(0,0,0,0.4)', fontSize: width / 25, flex: 1 }}>{receiptModal.ReceiptParameters.PAY_MODE_TEXT ? receiptModal.ReceiptParameters.PAY_MODE_TEXT : "Select"}</Text>
                            <IconsFont name="chevron-down" size={width / 20} color={'#012f6c'} />
                        </TouchableOpacity>
                    </View>

                    <View style={{ backgroundColor: '#eaf4ff', padding: 10, borderRadius: 6 }}>
                        <View style={{ flexDirection: 'column' }}>
                            <Text style={{ color: "#012f6c" }}>Currency*</Text>
                            <TouchableOpacity onPress={() => setmodalVisibleCurrency(true)} style={{
                                backgroundColor: "rgb(255,255,255)", marginVertical: 10, borderRadius: 5, borderWidth: 1, borderColor: "rgba(0,0,0,0.3)", padding: 10, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'
                            }}>
                                <Text style={{ color: receiptModal.ReceiptParameters.EXCH_ID_TEXT ? 'black' : 'rgba(0,0,0,0.4)', fontSize: width / 25, flex: 1 }}>{receiptModal.ReceiptParameters.EXCH_ID_TEXT ? receiptModal.ReceiptParameters.EXCH_ID_TEXT : "Select"}</Text>
                                <IconsFont name="chevron-down" size={width / 20} color={'#012f6c'} />
                            </TouchableOpacity>
                        </View>
                        <View style={{ flexDirection: 'column' }}>
                            <Text style={{ color: "#012f6c" }}>Amount*</Text>
                            <TextInput value={receiptModal.ReceiptDetailParameters.UNIT_COST} onChangeText={text => {
                                var cost = 0;
                                var rate = 0;
                                if (receiptModal.ReceiptDetailParameters.EXCH_RATE) {
                                    rate = parseFloat(receiptModal.ReceiptDetailParameters.EXCH_RATE);
                                }
                                if (text) {
                                    cost = text;
                                }
                                console.log("amount:", cost)
                                var convertAmount = cost * rate;
                                console.log("conv amount:", convertAmount);
                                var oldReceipt = { ...receiptModal };
                                oldReceipt.ReceiptDetailParameters.UNIT_COST = text;
                                oldReceipt.ReceiptParameters.EXCH_COST = convertAmount;
                                setreceiptModal({ ...oldReceipt });
                            }} placeholder='Enter amount' placeholderTextColor={'rgba(0,0,0,0.4)'} style={{ backgroundColor: "rgb(255,255,255)", marginVertical: 10, borderRadius: 5, borderWidth: 1, borderColor: "rgba(0,0,0,0.3)", paddingVertical: 10, paddingLeft: 5, fontSize: width / 25, color: "black" }} />
                        </View>

                        <View style={{ flexDirection: 'column' }}>
                            <Text style={{ color: "#012f6c" }}>Currency (Claim)</Text>
                            <TouchableOpacity onPress={() => setmodalVisibleCurrencyClaim(true)} style={{
                                backgroundColor: "rgb(255,255,255)", marginVertical: 10, borderRadius: 5, borderWidth: 1, borderColor: "rgba(0,0,0,0.3)", padding: 10, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'
                            }}>
                                <Text style={{ color: receiptModal.ReceiptDetailParameters.EXCH_ID_TEXT ? 'black' : 'rgba(0,0,0,0.4)', fontSize: width / 25, flex: 1 }}>{receiptModal.ReceiptDetailParameters.EXCH_ID_TEXT ? receiptModal.ReceiptDetailParameters.EXCH_ID_TEXT : "Select"}</Text>
                                <IconsFont name="chevron-down" size={width / 20} color={'#012f6c'} />
                            </TouchableOpacity>
                        </View>
                        <View style={{ flexDirection: 'column', alignItems: 'center' }}>
                            <Text style={{ color: "#012f6c" }}>Exchange Rate*</Text>
                            <TextInput value={receiptModal.ReceiptDetailParameters.EXCH_RATE} onChangeText={text => {

                                var cost = 0;
                                var rate = 0;
                                if (receiptModal.ReceiptDetailParameters.UNIT_COST) {
                                    cost = parseFloat(receiptModal.ReceiptDetailParameters.UNIT_COST);
                                }
                                if (text) {
                                    rate = text;
                                }
                                console.log("amount:", cost)
                                var convertAmount = cost * rate;
                                console.log("conv amount:", convertAmount);
                                var oldReceipt = { ...receiptModal };
                                oldReceipt.ReceiptDetailParameters.EXCH_RATE = text;
                                oldReceipt.ReceiptParameters.EXCH_COST = convertAmount;
                                console.log(oldReceipt)
                                setreceiptModal({ ...oldReceipt });
                            }} placeholder='Enter rate' placeholderTextColor={'rgba(0,0,0,0.4)'} style={{ marginVertical: 10, backgroundColor: "rgb(255,255,255)", borderRadius: 5, borderWidth: 1, borderColor: "rgba(0,0,0,0.3)", paddingVertical: 10, paddingLeft: 5, fontSize: width / 25, textAlign: 'center', color: "black" }} />
                        </View>
                        <View style={{ flexDirection: 'column' }}>
                            <Text style={{ color: "#012f6c" }}>Amount</Text>
                            <Text style={{ marginVertical: 10, borderRadius: 5, borderWidth: 1, borderColor: "rgba(0,0,0,0.3)", padding: 10, backgroundColor: "white", color: receiptModal.ReceiptParameters.EXCH_COST ? 'black' : 'rgba(0,0,0,0.4)', fontSize: width / 25, flex: 1 }}>{receiptModal.ReceiptParameters.EXCH_COST ? receiptModal.ReceiptParameters.EXCH_COST : "Enter amount"}</Text>
                        </View>
                    </View>
                    <View style={{ flexDirection: 'column', marginTop: 20 }}>
                        <Text style={{ color: "#012f6c" }}>Enter Description</Text>
                        <TextInput multiline numberOfLines={4} textAlignVertical='top' value={receiptModal.ReceiptDetailParameters.DESCRIPTION} onChangeText={text => setreceiptModal((prevModal) => ({
                            ...prevModal,
                            ReceiptDetailParameters: {
                                ...prevModal.ReceiptDetailParameters,
                                DESCRIPTION: text
                            }
                        }))} placeholder='Enter merchant' placeholderTextColor={'rgba(0,0,0,0.4)'} style={{ marginVertical: 10, borderRadius: 5, borderWidth: 1, borderColor: "rgba(0,0,0,0.3)", paddingVertical: 10, paddingLeft: 5, fontSize: width / 25, color: "black" }} />
                    </View>

                    <View style={{ flexDirection: 'column' }}>
                        <Text style={{ color: "#012f6c" }}>Enter Remark</Text>
                        <TextInput multiline numberOfLines={2} textAlignVertical='top' value={receiptModal.ReceiptParameters.REMARK} onChangeText={text => setreceiptModal((prevModal) => ({
                            ...prevModal,
                            ReceiptParameters: {
                                ...prevModal.ReceiptParameters,
                                REMARK: text
                            }
                        }))} placeholder='Enter remark' placeholderTextColor={'rgba(0,0,0,0.4)'} style={{ marginVertical: 10, borderRadius: 5, borderWidth: 1, borderColor: "rgba(0,0,0,0.3)", paddingVertical: 10, paddingLeft: 5, fontSize: width / 25, color: "black" }} />
                    </View>
                    <Text style={{ color: "#012f6c" }}>Upload Documents (UpTo 5)</Text>
                    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: 20 }}>
                        <TouchableOpacity disabled={receiptModal.ReceiptParameters.UploadDocs.length < 5 ? false : true} onPress={() => getImage(true)} style={{ flex: 1, alignItems: 'center', borderColor: '#012f6c', borderWidth: 1, borderRadius: 5, paddingVertical: 10, marginRight: 20 }}>
                            <Icons name="camera-outline" size={30} color={'#012f6c'} style={{ marginRight: 10 }} />
                        </TouchableOpacity>
                        <TouchableOpacity disabled={receiptModal.ReceiptParameters.UploadDocs.length < 5 ? false : true} onPress={() => getImage(false)} style={{ flex: 1, alignItems: 'center', borderColor: '#012f6c', borderWidth: 1, borderRadius: 5, paddingVertical: 10 }}>
                            <Icons name="image-outline" size={30} color={'#012f6c'} />
                        </TouchableOpacity>

                    </View>
                    {receiptModal.ReceiptParameters.UploadDocs.map((val, index) => {
                        return <View key={index} style={{ flexDirection: 'row', alignItems: 'center', marginTop: 20 }}>
                            <TouchableOpacity onPress={() => saveFile(val.b64, val.filename)} style={{ flex: 1, paddingRight: 20, flexWrap: "wrap", flexShrink: 1, flexDirection: 'row' }}>
                                <Text style={{ flex: 1, textDecorationLine: "underline", flexShrink: 1, color: "black" }}>{val.filename.toUpperCase()}</Text>
                            </TouchableOpacity>

                            <TouchableOpacity onPress={() => removeDoc(index)}>
                                <IconsFontM name="delete-outline" size={width / 15} color={'red'} />
                            </TouchableOpacity>
                        </View>
                    })}
                    <View style={{ flexDirection: 'column', marginTop: 20 }}>
                        <Text style={{ color: "#012f6c" }}>Select Outstanding Status</Text>
                        <TouchableOpacity onPress={() => setstatusModal(true)} style={{
                            backgroundColor: "rgb(255,255,255)", marginVertical: 10, borderRadius: 5, borderWidth: 1, borderColor: "rgba(0,0,0,0.3)", padding: 10, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'
                        }}>
                            <Text style={{ color: receiptModal.ReceiptParameters.COMPLETED_DESC ? 'black' : 'rgba(0,0,0,0.4)', fontSize: width / 25, flex: 1 }}>{receiptModal.ReceiptParameters.COMPLETED_DESC ? receiptModal.ReceiptParameters.COMPLETED_DESC : "Select"}</Text>
                            <IconsFont name="chevron-down" size={width / 20} color={'#012f6c'} />
                        </TouchableOpacity>
                    </View>
                    <TouchableOpacity onPress={submit} style={{ backgroundColor: '#012f6c', padding: 10, marginTop: 20, marginBottom: 10, borderRadius: 5 }}>
                        <Text style={{ color: 'white', textAlign: 'center', fontSize: width / 18 }}>Submit</Text>
                    </TouchableOpacity>
                    {receipt && <View style={{ flexDirection: 'row', justifyContent: "center", alignItems: "center", paddingHorizontal: 10, }}>
                        <TouchableOpacity onPress={() => setRemove(true)}>
                            {/* <Icons name="delete" size={width / 15} color={'red'} /> */}
                            <Text style={{ color: 'red' }}>Delete Receipt</Text>
                        </TouchableOpacity>
                    </View>}
                </View>

            </KeyboardAwareScrollView>
            <Modal transparent={true} visible={Remove} style={{ position: 'absolute', width: '100%' }}>
                <View style={{ backgroundColor: 'rgba(0,0,0,0.5)', flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                    <View style={{ backgroundColor: 'white', padding: 20, margin: 20, borderRadius: 8, alignItems: 'center' }}>
                        <Text style={{ color: 'black', fontWeight: 'bold', fontSize: width / 30 }}>Are you sure you want to delete this record ?</Text>
                        <View style={{ flexDirection: 'row', marginTop: 20 }}>
                            <TouchableOpacity onPress={onRemove} style={[styleSheet.button, { backgroundColor: 'white', }]}>
                                <Text style={[styleSheet.buttonText, { color: 'black', paddingHorizontal: 10 }]}>Yes</Text>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => setRemove(false)} style={[styleSheet.button, { marginLeft: 20 }]}>
                                <Text style={[styleSheet.buttonText, { paddingHorizontal: 10 }]}>No</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
            <Modal animationType="fade" transparent={true} visible={modalVisibleCurrency}>
                <TouchableOpacity
                    style={{
                        top: 10,
                        right: 20,
                        position: 'absolute',
                        // backgroundColor: 'white',
                        zIndex: 99,
                        padding: 10,
                    }}
                    onPress={() => { setmodalVisibleCurrency(false); setcurrency(fullCurrency); setQuery("") }}>
                    <Text style={{ color: '#012f6c', fontSize: width / 15 }}>Close</Text>
                </TouchableOpacity>
                <View
                    style={{
                        flex: 1,
                        justifyContent: 'center',
                        alignItems: 'center',
                        backgroundColor: 'white',
                        paddingTop: 80,
                    }}>
                    <TextInput
                        autoCapitalize="none"
                        autoCorrect={false}
                        clearButtonMode="always"
                        value={query}
                        onChangeText={queryText => handleSearch(queryText)}
                        placeholder="Search"
                        placeholderTextColor='black'
                        style={{ backgroundColor: 'rgba(0,0,0,0.1)', paddingHorizontal: 10, borderRadius: 5, color: 'black', width: '80%', marginHorizontal: 20 }}
                    />
                    <ScrollView>
                        {
                            currency.map((val, index) => {
                                return <TouchableOpacity
                                    key={index}
                                    onPress={() => {
                                        setmodalVisibleCurrency(false);
                                        var rate = 0;
                                        if (receiptModal.ReceiptDetailParameters.EXCH_ID == "92") {
                                            rate = val.Rates.RATE;
                                        }

                                        setreceiptModal((prevModal) => ({
                                            ...prevModal,
                                            ReceiptParameters: {
                                                ...prevModal.ReceiptParameters,
                                                EXCH_COST: 0,
                                                EXCH_ID: val.ID,
                                                EXCH_ID_TEXT: val.LOOKUP_DESC,
                                                EXCH_RATE: val.Rates.RATE
                                            },
                                            ReceiptDetailParameters: {
                                                ...prevModal.ReceiptDetailParameters,
                                                EXCH_RATE: rate,
                                            },
                                        }));
                                    }}
                                    style={{
                                        // backgroundColor: 'white',
                                        width: width * 0.9,
                                        padding: 20,
                                        borderBottomWidth: 2,
                                    }}>
                                    <Text style={{ color: '#012f6c', fontSize: width / 15, textAlign: 'center' }}>
                                        {`${val.LOOKUP_CODE}`}
                                    </Text>
                                </TouchableOpacity>
                            })
                        }

                    </ScrollView>
                </View>
            </Modal >
            <Modal animationType="fade" transparent={true} visible={modalVisibleCurrencyClaim}>
                <TouchableOpacity
                    style={{
                        top: 20,
                        right: 20,
                        position: 'absolute',
                        // backgroundColor: 'white',
                        zIndex: 99,
                        padding: 10,
                    }}
                    onPress={() => { setmodalVisibleCurrencyClaim(false); setcurrency(fullCurrency); setQuery("") }}>
                    <Text style={{ color: '#012f6c', fontSize: width / 15 }}>Close</Text>
                </TouchableOpacity>
                <View
                    style={{
                        flex: 1,
                        justifyContent: 'center',
                        alignItems: 'center',
                        backgroundColor: 'white',
                        paddingTop: 80,
                    }}>
                    <TextInput
                        autoCapitalize="none"
                        autoCorrect={false}
                        clearButtonMode="always"
                        value={query}
                        onChangeText={queryText => handleSearch(queryText)}
                        placeholder="Search"
                        placeholderTextColor='black'
                        style={{ backgroundColor: 'rgba(0,0,0,0.1)', paddingHorizontal: 10, borderRadius: 5, color: 'black', width: '80%', marginHorizontal: 20 }}
                    />
                    <ScrollView>
                        {
                            currency.map((val, index) => {
                                return <TouchableOpacity
                                    key={index}
                                    onPress={() => {
                                        setmodalVisibleCurrencyClaim(false);
                                        console.log(val);
                                        var cost = 0;
                                        var rate = 0;
                                        if (receiptModal.ReceiptParameters.EXCH_COST) {
                                            cost = parseFloat(receiptModal.ReceiptParameters.EXCH_COST);
                                        }
                                        if (val.ID == '92') {
                                            console.log("US", receiptModal.ReceiptParameters.EXCH_RATE)
                                            rate = parseFloat(receiptModal.ReceiptParameters.EXCH_RATE);
                                        }
                                        else {
                                            rate = 0;
                                            Alert.alert("Kindly provide the conversion exchange rate.")
                                        }
                                        console.log("amount:", cost)
                                        var convertAmount = cost * rate;
                                        console.log("conv amount:", convertAmount);
                                        setreceiptModal((prevModal) => ({
                                            ...prevModal,
                                            ReceiptDetailParameters: {
                                                ...prevModal.ReceiptDetailParameters,
                                                EXCH_ID: val.ID,
                                                EXCH_ID_TEXT: val.LOOKUP_DESC,
                                                EXCH_RATE: rate.toString(),
                                                UNIT_COST: convertAmount
                                            },
                                        }));
                                    }}
                                    style={{
                                        // backgroundColor: 'white',
                                        width: width * 0.9,
                                        padding: 20,
                                        borderBottomWidth: 2,
                                    }}>
                                    <Text style={{ color: '#012f6c', fontSize: width / 15, textAlign: 'center' }}>
                                        {`${val.LOOKUP_CODE}`}
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
                    <Text style={{ color: '#012f6c', fontSize: width / 15 }}>Close</Text>
                </TouchableOpacity>
                <View
                    style={{
                        flex: 1,
                        justifyContent: 'center',
                        alignItems: 'center',
                        backgroundColor: 'white',
                        paddingTop: 80,
                    }}>
                    <ScrollView>
                        {
                            payment.map((val, index) => {
                                return <TouchableOpacity
                                    key={index}
                                    onPress={() => {
                                        setmodalVisiblePayment(false);
                                        setreceiptModal((prevModal) => ({
                                            ...prevModal,
                                            ReceiptParameters: {
                                                ...prevModal.ReceiptParameters,
                                                PAY_MODE: val.ID,
                                                PAY_MODE_TEXT: val.LOOKUP_DESC
                                            },
                                        }));
                                    }}
                                    style={{
                                        // backgroundColor: 'white',
                                        width: width * 0.9,
                                        padding: 20,
                                        borderBottomWidth: 2,
                                    }}>
                                    <Text style={{ color: '#012f6c', fontSize: width / 15, textAlign: 'center' }}>
                                        {val.LOOKUP_DESC}
                                    </Text>
                                </TouchableOpacity>
                            })
                        }

                    </ScrollView>
                </View>
            </Modal >
            <Modal animationType="fade" transparent={true} visible={statusModal}>
                <TouchableOpacity
                    style={{
                        top: 20,
                        right: 20,
                        position: 'absolute',
                        // backgroundColor: 'white',
                        zIndex: 99,
                        padding: 10,
                    }}
                    onPress={() => setstatusModal(false)}>
                    <Text style={{ color: '#012f6c', fontSize: width / 15 }}>Close</Text>
                </TouchableOpacity>
                <View
                    style={{
                        flex: 1,
                        justifyContent: 'center',
                        alignItems: 'center',
                        backgroundColor: 'white',
                        paddingTop: 80,
                    }}>
                    <ScrollView>
                        {
                            Receiptstatus.map((val, index) => {
                                return <TouchableOpacity
                                    key={index}
                                    onPress={() => {
                                        setstatusModal(false);
                                        setreceiptModal((prevModal) => ({
                                            ...prevModal,
                                            ReceiptParameters: {
                                                ...prevModal.ReceiptParameters,
                                                COMPLETED: val.key,
                                                COMPLETED_DESC: val.desc
                                            },
                                        }));
                                    }}
                                    style={{
                                        // backgroundColor: 'white',
                                        width: width * 0.9,
                                        padding: 20,
                                        borderBottomWidth: 2,
                                    }}>
                                    <Text style={{ color: '#012f6c', fontSize: width / 15, textAlign: 'center' }}>
                                        {val.desc}
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
                                onPress={() => {
                                    setmodalVisibleSuccess(false);
                                    navigation.replace("Receipts")
                                }}>
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

export default Home