import { FlatList, RefreshControl, StyleSheet, Text, View, TextInput } from 'react-native'
import React, { useEffect, useState } from 'react'
import { getRecaps } from '../utils/api';
import RecapCard from '../components/Recaps/RecapCard';
import api from '../utils/AxiosInterceptors';
const RecapsScreen = ({ navigation }) => {

    const [allRecaps, setAllRecaps] = useState([]);
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    const [searchText, setSearchText] = useState('');
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
            // Lấy tất cả các recap
            const data = await getRecaps();

            // Lấy thêm thông tin người đóng góp
            const enrichedData = await Promise.all(
                data.map(async (recap) => {
                    try {
                        const userResponse = await api.get(
                            `/api/users/get-user-account-byID?userId=${recap.userId}`
                        );
                        return {
                            ...recap,
                            contributor: userResponse.data.data.userName || "Không rõ",
                        };
                    } catch (error) {
                        console.error("Error fetching contributor:", error);
                        return { ...recap, contributor: "Không rõ" };
                    }
                })
            );

            setAllRecaps(enrichedData);
            setItems(enrichedData.slice(0, pageSize));
        } catch (error) {
            console.error("Error fetching data:", error);
            setError("An error occurred while fetching recaps.");
        }
        setLoading(false);
    };

    const handleSearch = (text) => {
        setSearchText(text);
        if (text.trim() === '') {
            setItems(allRecaps.slice(0, pageSize));
        } else {
            const filteredItems = allRecaps.filter((recap) =>
                recap.name.toLowerCase().includes(text.toLowerCase()) ||
                recap.book?.title.toLowerCase().includes(text.toLowerCase()) ||
                recap.contributor.toLowerCase().includes(text.toLowerCase())
            );
            setItems(filteredItems);
        }
    };
    const handleRecapSelect = (recap) => {
        // Điều hướng đến màn hình chi tiết recap hoặc phát recap
        navigation.navigate('RecapItemDetail', { recap }); // Giả sử 'RecapDetailScreen' là màn hình chi tiết recap
    };

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
             {/* Thanh tìm kiếm */}
             <View style={styles.searchContainer}>
                <TextInput
                    style={styles.searchInput}
                    placeholder="Tìm kiếm recap..."
                    value={searchText}
                    onChangeText={handleSearch}
                />
            </View>

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
    searchContainer: {
        padding: 10,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#ddd',
    },
    searchInput: {
        height: 40,
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 8,
        paddingLeft: 10,
        backgroundColor: '#f9f9f9',
    },
    listContainer: {
        padding: 8,
    },
    cardContainer: {
        flex: 1,
        margin: 8,
        
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