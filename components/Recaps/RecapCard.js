import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import React from 'react';
import { useNavigation } from '@react-navigation/native';

import defaultImage from '../../assets/empty-image.png';

const RecapCard = React.memo(({ item }) => {
    const navigation = useNavigation();

    const contributor = item.contributor || 'Không rõ';
    const likesCount = item.likesCount ? item.likesCount.toString() : '0';
    const viewsCount = item.viewsCount ? item.viewsCount.toString() : '0';
    const bookTitle = item.book?.title || 'Không rõ';
    const coverImage = item.book?.coverImage;

    return (
        <TouchableOpacity
            onPress={() => navigation.navigate("RecapItemDetail", { recapId: item.id })}
            style={styles.cardShadow}
        >
            <View style={styles.card}>
                <Image source={coverImage ? { uri: coverImage } : defaultImage} style={styles.image} />
                <View style={styles.textContainer}>
                    <Text style={styles.title}>{item.name}</Text>
                    <Text style={styles.subtitle}>📚 Cuốn: {bookTitle}</Text>
                    <Text style={styles.detail}>❤️ Lượt thích: {likesCount}</Text>
                    <Text style={styles.detail}>👀 Lượt nghe: {viewsCount}</Text>
                    <Text style={styles.detail}>👤 Người đóng góp: {contributor}</Text>
                </View>
            </View>
        </TouchableOpacity>
    );
});

export default RecapCard;

const styles = StyleSheet.create({
    cardShadow: {
        marginBottom: 15,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3, // Hiệu ứng bóng trên Android
        borderRadius: 10,
        backgroundColor: 'transparent',
    },
    card: {
        borderRadius: 10,
        backgroundColor: '#fff',
        overflow: 'hidden',
        height: 415, // Chiều cao cố định
        width: '100%',
    },
    image: {
        width: '100%',
        height: 250, // Chiều cao hình ảnh cố định
        resizeMode: 'cover',
    },
    textContainer: {
        flex: 1,
        padding: 12,
        backgroundColor: '#f8f9fa',
        justifyContent: 'space-between', // Giãn đều các thành phần
    },
    title: {
        fontSize: 16,
        fontWeight: '700',
        color: '#333',
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 14,
        fontWeight: '500',
        color: '#555',
        marginBottom: 5,
    },
    detail: {
        fontSize: 13,
        color: '#666',
        marginBottom: 4,
    },
});