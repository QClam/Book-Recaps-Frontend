import { FlatList, RefreshControl, StyleSheet, Text, View } from 'react-native'
import React, { useEffect, useState } from 'react'
import { getRecaps } from '../utils/api';
import RecapCard from '../components/Recaps/RecapCard';

const RecapsScreen = ({ navigation }) => {

    const [allRecaps, setAllRecaps] = useState([]);
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isLoadingMore, setIsLoadingMore] = useState(false);

    const pageSize = 10; // Số lượng sách mỗi lần hiển thị

    useEffect(() => {
        fetchData();

        const unsubscribe = navigation.addListener("focus", () => {
            fetchData();
        });

        return unsubscribe;
    }, [navigation]);

    const fetchData = async () => {
        setLoading(true);

        try {
            const data = await getRecaps();
            console.log(data.name);
            
            setAllRecaps(data);
            setItems(data.slice(0, pageSize));
        } catch (error) {
            setError("An error occurred while fetching menu items");
        }
        setLoading(false);
    }

    const handleLoadMore = () => {
        if (isLoadingMore || items.length >= allRecaps.length) return; // Nếu đang tải hoặc hết dữ liệu thì dừng

        setIsLoadingMore(true);

        const nextPage = items.length + pageSize;
        const newItems = allRecaps.slice(0, nextPage); // Lấy thêm dữ liệu từ `allRecaps`

        setItems(newItems);
        setIsLoadingMore(false);
    };

    if (error && !loading) {
        return (
            <View style={styles.container}>
                <Text>{error}</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <FlatList
                data={items}
                keyExtractor={(item) => item.id.toString()}
                renderItem={({ item }) => (
                    <View style={styles.cardContainer}>
                        <RecapCard item={item} />
                    </View>
                )}                
                ListEmptyComponent={
                    <Text style={{ textAlign: "center" }}>
                        No books found!
                    </Text>
                }
                contentContainerStyle={styles.listContainer}
                refreshControl={
                    <RefreshControl refreshing={loading} onRefresh={fetchData} />
                }
                onEndReached={handleLoadMore}
                onEndReachedThreshold={0.5}
                numColumns={2} // Hiển thị 2 cột
            />
        </View>
    )
}

export default RecapsScreen

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#f5f5f5",
    },
    filterContainer: {
        backgroundColor: "#fff",
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: "#e1e1e1",
    },
    filterScroll: {
        paddingHorizontal: 16,
    },
    filterButton: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        backgroundColor: "#f0f0f0",
        marginRight: 8,
    },
    filterButtonActive: {
        backgroundColor: "#007AFF",
    },
    filterButtonText: {
        fontSize: 14,
        color: "#666",
        fontWeight: "500",
    },
    filterButtonTextActive: {
        color: "#fff",
    },
    listContainer: {
        padding: 8, // Cách lề của danh sách
    },
    cardContainer: {
        flex: 1,
        margin: 8, // Khoảng cách giữa các card
    },
})