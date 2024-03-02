import { View, Text, TouchableOpacity, ScrollView, Modal, Dimensions, TextInput, StatusBar, Image, StyleSheet, Alert } from 'react-native'
import React, { useEffect, useState } from 'react'
import { getDomain, getUser } from './functions/helper';
import Loader from './Loader';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'
import DatePicker from 'react-native-date-picker'
const { width, height } = Dimensions.get('window');
import IconsFont from 'react-native-vector-icons/FontAwesome';

export default function ReceiptDetail({ navigation, route }) {
    const [receiptModal, setreceiptModal] = useState(null);
    const [loading, setloading] = useState(false);
    const [date, setDate] = useState(new Date())
    const [open, setOpen] = useState(false);
    useEffect(() => {
        const { receipt } = route.params;
        console.log(receipt);
        setloading(true);
        var domain = getDomain();
        // var domain = 'https://demo.vellas.net:94/arrowdemoapi_dev/api/Values';
        const url = `${domain}/GetReceiptDetail?_token=b95909e1-d33f-469f-90c6-5a2fb1e5627c&UID=${receipt.UID}`;
        console.log(url);
        fetch(url)
            .then(res => res.json())
            .then(data => {
                setloading(false);
                console.log(data, "detail")
                if (data && data.length > 0) {
                    const url2 = `${domain}/GetReceiptFiles?_token=b95909e1-d33f-469f-90c6-5a2fb1e5627c&UID=${receipt.UID}`;
                    fetch(url2)
                        .then(res => res.json())
                        .then(dataFIle => {
                            setloading(false);
                            console.log(receipt, "files")
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
                                    "EXCH_ID": "",
                                    "EXCH_ID_TEXT": "",
                                    "EXCH_RATE": "",
                                    "UID": receipt.UID,
                                    "INV_NO": receipt.INV_NO,
                                    "INV_TYPE": receipt.INV_TYPE,
                                    "VENDOR_ID": receipt.VENDOR_ID,
                                    "REMARK": receipt.REMARK,
                                    "OPCO": "3",
                                    "STATUS": "0",
                                    "UPDATE_BY": receipt.UPDATE_BY,
                                    "UploadDocs": dataFIle
                                },
                                "ReceiptDetailParameters": {
                                    "UID": data[0].UID,
                                    "DESCRIPTION": data[0].DESC_ENG,
                                    "UNIT_COST": receipt.TOTAL_AMOUNT,
                                    "EXCH_ID": receipt.EXCH_ID,
                                    "EXCH_RATE": receipt.EXCH_RATE,
                                    "EXCH_ID_TEXT": receipt.EXCH_DESC
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
    }, [])

    return (
        <View>
            <StatusBar barStyle="dark-content" backgroundColor="#FFF" />
            <Loader visible={loading} />
            {receiptModal && <KeyboardAwareScrollView>
                <View style={{ backgroundColor: 'white', padding: 20, flex: 1 }}>


                    <View style={{ flexDirection: 'column' }}>
                        <Text style={{ color: "#012f6c" }}>Enter Date*</Text>
                        <TouchableOpacity onPress={() => setOpen(true)} style={{ marginVertical: 10, borderRadius: 5, borderWidth: 1, borderColor: "rgba(0,0,0,0.3)", paddingVertical: 10, paddingLeft: 5 }}>
                            <Text style={{ color: receiptModal.ReceiptParameters.REC_DATE ? 'black' : 'rgba(0,0,0,0.4)', fontSize: width / 25 }}>{receiptModal.ReceiptParameters.REC_DATE ? receiptModal.ReceiptParameters.REC_DATE : "DD/MM/YYYY"}</Text>
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
                        }))} placeholder='Enter receipt number' placeholderTextColor={'rgba(0,0,0,0.4)'} style={{ marginVertical: 10, borderRadius: 5, borderWidth: 1, borderColor: "rgba(0,0,0,0.3)", paddingVertical: 10, paddingLeft: 5, fontSize: width / 25 }} />
                    </View>

                    <View style={{ flexDirection: 'column' }}>
                        <Text style={{ color: "#012f6c" }}>Select Payment Mode*</Text>
                        <TouchableOpacity style={{
                            backgroundColor: "rgb(255,255,255)", marginVertical: 10, borderRadius: 5, borderWidth: 1, borderColor: "rgba(0,0,0,0.3)", padding: 10, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'
                        }}>
                            <Text style={{ color: receiptModal.ReceiptParameters.PAY_MODE_TEXT ? 'black' : 'rgba(0,0,0,0.4)', fontSize: width / 25, flex: 1 }}>{receiptModal.ReceiptParameters.PAY_MODE_TEXT ? receiptModal.ReceiptParameters.PAY_MODE_TEXT : "Select"}</Text>
                            <IconsFont name="chevron-down" size={width / 20} color={'#012f6c'} />
                        </TouchableOpacity>
                    </View>

                    <View style={{ backgroundColor: '#eaf4ff', padding: 10, borderRadius: 6 }}>
                        {/* <View style={{ flexDirection: 'column' }}>
                            <Text style={{ color: "#012f6c" }}>Currency*</Text>
                            <TouchableOpacity style={{
                                backgroundColor: "rgb(255,255,255)", marginVertical: 10, borderRadius: 5, borderWidth: 1, borderColor: "rgba(0,0,0,0.3)", padding: 10, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'
                            }}>
                                <Text style={{ color: receiptModal.ReceiptParameters.EXCH_ID_TEXT ? 'black' : 'rgba(0,0,0,0.4)', fontSize: width / 25, flex: 1 }}>{receiptModal.ReceiptParameters.EXCH_ID_TEXT ? receiptModal.ReceiptParameters.EXCH_ID_TEXT : "Select"}</Text>
                                <IconsFont name="chevron-down" size={width / 20} color={'#012f6c'} />
                            </TouchableOpacity>
                        </View> */}
                        {/* <View style={{ flexDirection: 'column' }}>
                            <Text style={{ color: "#012f6c" }}>Amount*</Text>
                            <TextInput value={receiptModal.ReceiptParameters.UNIT_COST} onChangeText={text => {
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
                                oldReceipt.ReceiptParameters.UNIT_COST = text;
                                oldReceipt.ReceiptDetailParameters.UNIT_COST = convertAmount;
                                setreceiptModal({ ...oldReceipt });
                            }} placeholder='Enter amount' placeholderTextColor={'rgba(0,0,0,0.4)'} style={{ backgroundColor: "rgb(255,255,255)", marginVertical: 10, borderRadius: 5, borderWidth: 1, borderColor: "rgba(0,0,0,0.3)", paddingVertical: 10, paddingLeft: 5, fontSize: width / 25 }} />
                        </View> */}

                        <View style={{ flexDirection: 'column' }}>
                            <Text style={{ color: "#012f6c" }}>Currency (Claim)</Text>
                            <TouchableOpacity style={{
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
                                if (receiptModal.ReceiptParameters.UNIT_COST) {
                                    cost = parseFloat(receiptModal.ReceiptParameters.UNIT_COST);
                                }
                                if (text) {
                                    rate = text;
                                }
                                console.log("amount:", cost)
                                var convertAmount = cost * rate;
                                console.log("conv amount:", convertAmount);
                                var oldReceipt = { ...receiptModal };
                                oldReceipt.ReceiptDetailParameters.EXCH_RATE = text;
                                oldReceipt.ReceiptDetailParameters.UNIT_COST = convertAmount;
                                console.log(oldReceipt)
                                setreceiptModal({ ...oldReceipt });
                            }} placeholder='Enter rate' placeholderTextColor={'rgba(0,0,0,0.4)'} style={{ marginVertical: 10, backgroundColor: "rgb(255,255,255)", borderRadius: 5, borderWidth: 1, borderColor: "rgba(0,0,0,0.3)", paddingVertical: 10, paddingLeft: 5, fontSize: width / 25, textAlign: 'center' }} />
                        </View>
                        <View style={{ flexDirection: 'column' }}>
                            <Text style={{ color: "#012f6c" }}>Amount</Text>
                            <Text style={{ marginVertical: 10, borderRadius: 5, borderWidth: 1, borderColor: "rgba(0,0,0,0.3)", padding: 10, backgroundColor: "white", color: receiptModal.ReceiptDetailParameters.UNIT_COST ? 'black' : 'rgba(0,0,0,0.4)', fontSize: width / 25, flex: 1 }}>{receiptModal.ReceiptDetailParameters.UNIT_COST ? receiptModal.ReceiptDetailParameters.UNIT_COST : "Enter amount"}</Text>
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
                        }))} placeholder='Enter description' placeholderTextColor={'rgba(0,0,0,0.4)'} style={{ marginVertical: 10, borderRadius: 5, borderWidth: 1, borderColor: "rgba(0,0,0,0.3)", paddingVertical: 10, paddingLeft: 5, fontSize: width / 25 }} />
                    </View>

                    <View style={{ flexDirection: 'column' }}>
                        <Text style={{ color: "#012f6c" }}>Enter Remark</Text>
                        <TextInput multiline numberOfLines={2} textAlignVertical='top' value={receiptModal.ReceiptParameters.REMARK} onChangeText={text => setreceiptModal((prevModal) => ({
                            ...prevModal,
                            ReceiptParameters: {
                                ...prevModal.ReceiptParameters,
                                REMARK: text
                            }
                        }))} placeholder='Enter remark' placeholderTextColor={'rgba(0,0,0,0.4)'} style={{ marginVertical: 10, borderRadius: 5, borderWidth: 1, borderColor: "rgba(0,0,0,0.3)", paddingVertical: 10, paddingLeft: 5, fontSize: width / 25 }} />
                    </View>
                    <Text style={{ color: "#012f6c" }}>Upload Documents (UpTo 5)</Text>
                    <View style={{ flexDirection: "row", flexWrap: 'wrap', marginTop: 10 }}>
                        <TouchableOpacity style={{ width: '25%', borderWidth: 1, borderColor: "rgba(0,0,0,0.3)", borderStyle: "dashed", justifyContent: 'center', alignItems: 'center', margin: 10, position: 'relative' }}>
                            {receiptModal.ReceiptParameters.UploadDocs[0] ? <View style={{ width: "100%", height: 50, justifyContent: 'center' }}><Text style={{ color: "#012f6c", textAlign: 'center' }}>{receiptModal.ReceiptParameters.UploadDocs[0].fileExtension.toUpperCase()}</Text><TouchableOpacity onPress={() => removeDoc(0)} style={{ position: "absolute", top: -10, right: -10, }}>
                                <IconsFont name="close" size={20} color={'#fff'} style={{ backgroundColor: 'red', borderRadius: 5 }} /></TouchableOpacity></View> : <IconsFont name="plus" size={width / 20} color={'#012f6c'} />}
                        </TouchableOpacity>
                        <TouchableOpacity disabled={receiptModal.ReceiptParameters.UploadDocs.length > 0 ? false : true} style={{ width: '25%', borderWidth: 1, borderColor: "rgba(0,0,0,0.3)", borderStyle: "dashed", justifyContent: 'center', alignItems: 'center', margin: 10, position: 'relative' }}>
                            {receiptModal.ReceiptParameters.UploadDocs[1] ? <View style={{ width: "100%", height: 50, justifyContent: 'center' }}><Text style={{ color: "#012f6c", textAlign: 'center' }}>{receiptModal.ReceiptParameters.UploadDocs[1].fileExtension.toUpperCase()}</Text><TouchableOpacity onPress={() => removeDoc(1)} style={{ position: "absolute", top: -10, right: -10, }}>
                                <IconsFont name="close" size={20} color={'#fff'} style={{ backgroundColor: 'red', borderRadius: 5 }} /></TouchableOpacity></View> : <IconsFont name="plus" size={width / 20} color={receiptModal.ReceiptParameters.UploadDocs.length > 0 ? '#012f6c' : 'rgba(0,0,0,0.4)'} />}
                        </TouchableOpacity>
                        <TouchableOpacity disabled={receiptModal.ReceiptParameters.UploadDocs.length > 1 ? false : true} style={{ width: '25%', borderWidth: 1, borderColor: "rgba(0,0,0,0.3)", borderStyle: "dashed", justifyContent: 'center', alignItems: 'center', margin: 10, position: 'relative' }}>
                            {receiptModal.ReceiptParameters.UploadDocs[2] ? <View style={{ width: "100%", height: 50, justifyContent: 'center' }}><Text style={{ color: "#012f6c", textAlign: 'center' }}>{receiptModal.ReceiptParameters.UploadDocs[2].fileExtension.toUpperCase()}</Text><TouchableOpacity onPress={() => removeDoc(2)} style={{ position: "absolute", top: -10, right: -10, }}>
                                <IconsFont name="close" size={20} color={'#fff'} style={{ backgroundColor: 'red', borderRadius: 5 }} /></TouchableOpacity></View> : <IconsFont name="plus" size={width / 20} color={receiptModal.ReceiptParameters.UploadDocs.length > 1 ? '#012f6c' : 'rgba(0,0,0,0.4)'} />}
                        </TouchableOpacity>
                        <TouchableOpacity disabled={receiptModal.ReceiptParameters.UploadDocs.length > 2 ? false : true} style={{ width: '25%', borderWidth: 1, borderColor: "rgba(0,0,0,0.3)", borderStyle: "dashed", justifyContent: 'center', alignItems: 'center', margin: 10, position: 'relative' }}>
                            {receiptModal.ReceiptParameters.UploadDocs[3] ? <View style={{ width: "100%", height: 50, justifyContent: 'center' }}><Text style={{ color: "#012f6c", textAlign: 'center' }}>{receiptModal.ReceiptParameters.UploadDocs[3].fileExtension.toUpperCase()}</Text><TouchableOpacity onPress={() => removeDoc(3)} style={{ position: "absolute", top: -10, right: -10, }}>
                                <IconsFont name="close" size={20} color={'#fff'} style={{ backgroundColor: 'red', borderRadius: 5 }} /></TouchableOpacity></View> : <IconsFont name="plus" size={width / 20} color={receiptModal.ReceiptParameters.UploadDocs.length > 2 ? '#012f6c' : 'rgba(0,0,0,0.4)'} />}
                        </TouchableOpacity>
                        <TouchableOpacity disabled={receiptModal.ReceiptParameters.UploadDocs.length > 3 ? false : true} style={{ width: '25%', borderWidth: 1, borderColor: "rgba(0,0,0,0.3)", borderStyle: "dashed", justifyContent: 'center', alignItems: 'center', margin: 10, position: 'relative' }}>
                            {receiptModal.ReceiptParameters.UploadDocs[4] ? <View style={{ width: "100%", height: 50, justifyContent: 'center' }}><Text style={{ color: "#012f6c", textAlign: 'center' }}>{receiptModal.ReceiptParameters.UploadDocs[4].fileExtension.toUpperCase()}</Text><TouchableOpacity onPress={() => removeDoc(4)} style={{ position: "absolute", top: -10, right: -10, }}>
                                <IconsFont name="close" size={20} color={'#fff'} style={{ backgroundColor: 'red', borderRadius: 5 }} /></TouchableOpacity></View> : <IconsFont name="plus" size={width / 20} color={receiptModal.ReceiptParameters.UploadDocs.length > 3 ? '#012f6c' : 'rgba(0,0,0,0.4)'} />}
                        </TouchableOpacity>
                    </View>
                    <TouchableOpacity style={{ backgroundColor: '#012f6c', padding: 10, marginVertical: 20, borderRadius: 5 }}>
                        <Text style={{ color: 'white', textAlign: 'center', fontSize: width / 18 }}>Submit</Text>
                    </TouchableOpacity>
                </View>

            </KeyboardAwareScrollView>}
        </View>
    )
}

const styles = StyleSheet.create({})