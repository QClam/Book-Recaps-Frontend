import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import React from 'react';
import { useNavigation } from '@react-navigation/native';
import { Entypo } from '@expo/vector-icons';

import defaultImage from '../../assets/empty-image.png'

const BookCard = React.memo(({ item }) => {
    const navigation = useNavigation();

    const authors = item.authors?.$values?.map(author => author.name).join(', ') || 'Không rõ';
    const categories = item.categories?.$values?.map(category => category.name).join(', ') || 'Không rõ';

    return (
        <TouchableOpacity onPress={() => navigation.navigate("RecapDetail", { bookId: item.id })}>
            <View style={styles.card}>
                <Image source={item.coverImage ? {uri: item.coverImage} : defaultImage} style={styles.image}/>
                <View style={styles.textContainer}>
                    <View style={styles.titleContainer}>
                        <Text style={styles.title}>{item.title}</Text>
                       
                    </View>
                    <Text style={styles.position}>Tác giả: {authors}</Text>
                    <Text style={styles.position}>Thể loại: {categories}</Text>
                    <Text style={styles.position}>Năm xuất bản: {item.publicationYear}</Text>
                </View>
            </View>
        </TouchableOpacity>
    );
});

export default BookCard;

const styles = StyleSheet.create({
    card: {
        width: '100%',
        // borderWidth: 1,
        // borderColor: '#ccc',
        // borderRadius: 5,
        padding: 10,
        backgroundColor: '#fff',
        marginVertical: 5,
        height: 440
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
