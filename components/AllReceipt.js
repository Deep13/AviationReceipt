import React, { useState, useRef, useEffect } from 'react'
import { getDomain, getUser } from './functions/helper';
import { View, Text, TouchableOpacity, ScrollView, Modal, Dimensions, TextInput, StatusBar, Image, StyleSheet, Alert } from 'react-native';
import Loader from './Loader';
import AsyncStorage from '@react-native-async-storage/async-storage';
import auth from '@react-native-firebase/auth';
const { width, height } = Dimensions.get('window');
import IconsFont from 'react-native-vector-icons/FontAwesome';
import IconsFontIonicons from 'react-native-vector-icons/Ionicons';
import DateTimePickerModal from "react-native-modal-datetime-picker";
export default function AllReceipt({ navigation }) {
    const vendor = getUser();
    const [onLogOut, setonLogOut] = useState(false);
    const [loading, setloading] = useState(false);
    const [receiptList, setreceiptList] = useState([]);
    const [isDatePickerVisible, setDatePickerVisibility] = useState(false);
    const [dateInput, setDateInput] = useState(new Date());
    const [selectedDate, setselectedDate] = useState(new Date());
    const [minDate, setminDate] = useState(null);
    const [isDatePickerVisible2, setDatePickerVisibility2] = useState(false);
    const [dateInput2, setDateInput2] = useState(new Date());
    const [selectedDate2, setselectedDate2] = useState(new Date());

    const onLogOutPressed = () => {
        AsyncStorage.removeItem('username');
        AsyncStorage.removeItem('password');
        // auth().signOut();
        navigation.reset({
            index: 0,
            routes: [{ name: 'SignInContainer' }],
        });
    };
    const hideDatePicker = () => {
        setDatePickerVisibility(false);
    };

    const handleConfirm = (date) => {
        // console.warn("A date has been picked: ", formatDate(new Date(date).toLocaleDateString()));
        // getOrders(formatDate(new Date(date)))
        hideDatePicker();
        setDateInput(new Date(date));
        setselectedDate(new Date(date));
        getReceipts(formatDate(new Date(date)), formatDate(dateInput2))

    };

    const hideDatePicker2 = () => {
        setDatePickerVisibility2(false);
    };

    const handleConfirm2 = (date) => {
        // console.warn("A date has been picked: ", formatDate(new Date(date).toLocaleDateString()));
        // getOrders(formatDate(new Date(date)))
        hideDatePicker2();
        setDateInput2(new Date(date));
        setselectedDate2(new Date(date));

        getReceipts(formatDate(dateInput), formatDate(new Date(date)))

    };

    const formatDate = (inputDate) => {

        let day = inputDate.getDate();

        let month = inputDate.getMonth() + 1;

        let year = inputDate.getFullYear();
        if (day < 10) {
            day = '0' + day;
        }

        if (month < 10) {
            month = `0${month}`;
        }

        let formatted = `${month}/${day}/${year}`;
        return formatted;
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

    const refresh = () => {
        setDateInput(new Date());
        setselectedDate(new Date());
        setDateInput2(new Date());
        setselectedDate2(new Date());
        getReceipts(formatDate(new Date()), formatDate(new Date()));
    }
    const getReceipts = (from, to) => {
        setloading(true);
        console.log("second date")
        var domain = getDomain();
        // var domain = 'https://demo.vellas.net:94/arrowdemoapi_dev/api/Values';
        const url = `${domain}/GetApInvoice?username=${vendor.user}&dtfrom=${from}&dtTo=${to}`;
        console.log(url);
        fetch(url)
            .then(res => res.json())
            .then(data => {
                setloading(false);
                if (data && data.length > 0) {
                    // data[0].COMPLETED = 1;
                    setreceiptList([...data])
                }
                else {
                    setreceiptList([])
                }

            })
            .catch(e => {
                console.log(e, 'Function error');
                setloading(false);
            })
    }


    const showDatePicker = () => {
        // console.log(parameter)
        setDatePickerVisibility(true);
    };
    const showDatePicker2 = () => {
        // console.log(parameter)
        setDatePickerVisibility2(true);
    };
    useEffect(() => {
        setloading(true);
        getReceipts(formatDate(new Date()), formatDate(new Date()))




        var currentDate = new Date();

        // Subtract 14 days (2 weeks)
        var twoWeeksAgo = new Date(currentDate.getTime() - (180 * 24 * 60 * 60 * 1000));

        // Extract the year, month, and day
        var year = twoWeeksAgo.getFullYear();
        var month = twoWeeksAgo.getMonth() + 1; // Month is zero-based
        var day = twoWeeksAgo.getDate();

        // Format the date as desired (e.g., YYYY-MM-DD)
        var formattedDate = year + '-' + (month < 10 ? '0' : '') + month + '-' + (day < 10 ? '0' : '') + day;
        console.log("formattedDate", formattedDate);
        setminDate(new Date(formattedDate));
    }, [])

    return (
        <View style={{ flex: 1, backgroundColor: '#FFF', }}>
            <StatusBar barStyle="dark-content" backgroundColor="#FFF" />
            <Loader visible={loading} />
            <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: 20 }}>
                <TouchableOpacity style={{ marginLeft: 10 }} onPress={() => {
                    navigation.replace("Receipts")
                }}>
                    <IconsFont name="chevron-left" size={width / 15} color={'#012f6c'} />
                </TouchableOpacity>
                <View style={{ flexDirection: "row", alignItems: "center" }}>

                    <Text style={{ color: 'black', fontSize: width / 18, }}>All Receipts</Text>
                    <TouchableOpacity onPress={() => {
                        refresh()
                    }} style={{ padding: 10, borderRadius: 8, flexDirection: 'row', alignItems: 'center' }}>
                        <IconsFontIonicons name="reload" size={width / 15} color={'#012f6c'} />
                    </TouchableOpacity>

                </View>
            </View>
            <View style={{ paddingHorizontal: 10, flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
                <View style={{ flex: 1 }}>
                    <Text>From:</Text>
                    <TouchableOpacity onPress={showDatePicker} style={{ borderWidth: 1, padding: 10, borderColor: 'rgba(0,0,0,0.4)', borderRadius: 5, backgroundColor: '#01315C', paddingHorizontal: 20, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginRight: 10 }}>
                        <Text style={{ fontSize: width / 24, color: 'white', marginRight: 10 }}>{formatDate2(selectedDate)}</Text>
                        <IconsFont size={20} name="calendar" color='#FFF' />
                    </TouchableOpacity>
                </View>
                <View style={{ flex: 1 }}>
                    <Text>To:</Text>
                    <TouchableOpacity onPress={showDatePicker2} style={{ borderWidth: 1, padding: 10, borderColor: 'rgba(0,0,0,0.4)', borderRadius: 5, backgroundColor: '#01315C', paddingHorizontal: 20, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
                        <Text style={{ fontSize: width / 24, color: 'white', marginRight: 10 }}>{formatDate2(selectedDate2)}</Text>
                        <IconsFont size={20} name="calendar" color='#FFF' />
                    </TouchableOpacity>
                </View>
            </View>
            <ScrollView contentContainerStyle={{ paddingBottom: 20 }}>
                {receiptList.map((val, index) => {
                    return <TouchableOpacity onPress={() => navigation.navigate("ViewReceipt", {
                        receipt: val
                    })} key={index} style={{ backgroundColor: "#3f77c8", marginTop: 10, padding: 10, borderRadius: 8, marginHorizontal: 20 }}>
                        <Text style={{ color: "white", fontSize: width / 24 }}>Receipt No.: {val.INV_NO}</Text>
                        <Text style={{ color: "white", fontSize: width / 24 }}>{formatDate2(new Date(val.REC_DATE))}</Text>
                        <Text style={{ color: "white", fontSize: width / 24 }}>Amount: {val.TOTAL_AMOUNT}</Text>
                        <Text style={{ color: "white", fontSize: width / 24 }}>{val.COMPLETED_DESC}</Text>
                    </TouchableOpacity>
                })}
            </ScrollView>
            <DateTimePickerModal
                date={dateInput}
                isVisible={isDatePickerVisible}
                mode="date"
                onConfirm={handleConfirm}
                onCancel={hideDatePicker}
                minimumDate={minDate}
                maximumDate={new Date()}
            />
            <DateTimePickerModal
                date={dateInput2}
                isVisible={isDatePickerVisible2}
                mode="date"
                onConfirm={handleConfirm2}
                onCancel={hideDatePicker2}
                minimumDate={dateInput}
                maximumDate={new Date()}
            />
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