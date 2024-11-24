import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import React from 'react';
import { useNavigation } from '@react-navigation/native';

import defaultImage from '../../assets/empty-image.png';

const RecapCard = React.memo(({ item }) => {
    const navigation = useNavigation();

    const contributor = item.contributor || 'Không rõ';
    const likesCount = item.likesCount ? item.likesCount.toString() : '0';
    const bookTitle = item.book?.title || 'Không rõ';
    const coverImage = item.book?.coverImage;

    return (
        <TouchableOpacity onPress={() => navigation.navigate("RecapItemDetail", { recapId: item.id })}>
            <View style={styles.card}>
                <Image source={coverImage ? {uri: coverImage} : defaultImage} style={styles.image}/>
                <View style={styles.textContainer}>
                    <View style={styles.titleContainer}>
                        <Text style={styles.title}>{item.name}</Text>
                    </View>
                    <Text style={styles.position}>Cuốn: {bookTitle}</Text>
                    <Text style={styles.position}>Lượt thích: {likesCount}</Text>
                    <Text style={styles.position}>Người đóng góp: {contributor}</Text>
                </View>
            </View>
        </TouchableOpacity>
    );
});

export default RecapCard;

const styles = StyleSheet.create({
    card: {
        width: '100%',
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 5,
        padding: 10,
        backgroundColor: '#fff',
        marginVertical: 5,
        height: 400
    },
    image: {
        width: '100%',
        height: 200,
        marginBottom: 10,
    },
    textContainer: {
        flexDirection: 'column',
    },
    titleContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    title: {
        fontWeight: 'bold',
        fontSize: 18,
        flex: 1,
    },
    position: {
        fontSize: 16,
        color: '#666',
        marginTop: 5,
    },
});
