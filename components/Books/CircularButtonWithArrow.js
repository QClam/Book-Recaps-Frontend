import React from 'react';
import { TouchableOpacity, StyleSheet, Text, View } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const CircularButtonWithArrow = ({ onPress, direction }) => {
    return (
        <TouchableOpacity onPress={onPress} style={styles.buttonContainer}>
            {/* Vòng tròn */}
            <View style={styles.circle}>
                {/* Mũi tên */}
                <Icon
                    name={direction === 'backward' ? 'rotate-left' : 'rotate-right'}
                    size={22}
                    color="#FFFFFF"
                    style={styles.arrowIcon}
                />
                {/* Số 15 */}
                <Text style={styles.numberText}>15</Text>
            </View>
        </TouchableOpacity>
    );
};

export default CircularButtonWithArrow;

const styles = StyleSheet.create({
    buttonContainer: {
        marginHorizontal: 7, // Khoảng cách giữa các nút
        marginBottom: 5
    },
    circle: {
        width: 60,
        height: 60,
        borderRadius: 30,
        //backgroundColor: '#665C3C', // Màu tương tự trong hình
        justifyContent: 'center',
        alignItems: 'center',
        position: 'relative', // Để căn chỉnh mũi tên và số
        
    },
    arrowIcon: {
        position: 'absolute',
        top: 15, // Đặt mũi tên ở phía trên vòng tròn
        fontSize: 45,
       
    },
    numberText: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#FFFFFF', // Màu chữ trắng
        position: 'absolute',
        bottom: 12, // Đặt số 15 ở phía dưới vòng tròn
    },
});
