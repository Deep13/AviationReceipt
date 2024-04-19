import {
    StyleSheet, Text, View, StatusBar,
    TouchableOpacity,
    ScrollView,
    Dimensions
} from 'react-native'
import IconsFont from 'react-native-vector-icons/FontAwesome';
import Loader from './Loader';

import React, { useState } from 'react'
const { width, height } = Dimensions.get('window');
export default function ViewReceipt({ route, navigation }) {
    const [loading, setloading] = useState(false);
    const { receipt } = route.params;
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
    return (
        <View style={{ flex: 1, backgroundColor: '#FFF', paddingHorizontal: 20 }}>
            <StatusBar barStyle="dark-content" backgroundColor="#FFF" />
            <Loader visible={loading} />
            <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: 20 }}>
                <TouchableOpacity onPress={() => {
                    navigation.replace("AllReceipt")
                }}>
                    <IconsFont name="chevron-left" size={width / 15} color={'#012f6c'} />
                </TouchableOpacity>
                <View style={{ flexDirection: "row", alignItems: "center" }}>

                    <Text style={{ color: 'black', fontSize: width / 18, }}>{receipt.INV_NO}</Text>

                </View>
            </View>
            <ScrollView contentContainerStyle={{ paddingBottom: 20 }}>
                <View style={styles.container}>

                    <Text style={styles.label}>Invoice Document:</Text>
                    <Text style={styles.desc}>{receipt.INVOICE_DOC}</Text>

                    <Text style={styles.label}>Received Date:</Text>
                    <Text style={styles.desc}>{receipt.REC_DATE ? formatDate2(new Date(receipt.REC_DATE)) : "null"}</Text>

                    <Text style={styles.label}>Payment Mode Description:</Text>
                    <Text style={styles.desc}>{receipt.PAY_MODE_DESC}</Text>

                    <Text style={styles.label}>Receipt Amount:</Text>
                    <Text style={styles.desc}>{receipt.NON_TAXABLE_AMT}</Text>
                    <Text style={styles.label}>Receipt Currency:</Text>
                    <Text style={styles.desc}>{receipt.CURRENCY_CODE}</Text>

                    <Text style={styles.label}>Receipt Rate:</Text>
                    <Text style={styles.desc}>{receipt.EXCH_RATE}</Text>

                    <Text style={styles.label}>Claim Amount:</Text>
                    <Text style={styles.desc}>{receipt.EXCH_COST}</Text>

                    <Text style={styles.label}>Remark:</Text>
                    <Text style={styles.desc}>{receipt.REMARK}</Text>

                    {/* <Text style={styles.label}>Created By:</Text>
                    <Text style={styles.desc}>{receipt.CREATED_BY}</Text> */}

                    <Text style={styles.label}>Created Date:</Text>
                    <Text style={styles.desc}>{receipt.CREATED_DATE ? formatDate2(new Date(receipt.CREATED_DATE.split("T")[0])) : "null"}</Text>

                    {/* <Text style={styles.label}>Updated By:</Text>
                    <Text style={styles.desc}>{receipt.UPDATE_BY}</Text> */}

                    <Text style={styles.label}>Completed Description:</Text>
                    <Text style={styles.desc}>{receipt.COMPLETED_DESC}</Text>

                    <Text style={styles.label}>Payment Status:</Text>
                    <Text style={styles.desc}>{receipt.PAYMENT_STATUS}</Text>


                </View>
            </ScrollView>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        padding: 10,
        borderColor: '#ccc',
        borderRadius: 5,
        marginBottom: 10
    },
    label: {
        fontWeight: 'bold',
        marginBottom: 5,
        fontSize: width / 20,
        color: 'black'
    },
    desc: {
        fontSize: width / 25,
        color: 'black',
        marginBottom: 20
    }
});