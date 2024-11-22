import { Alert, StyleSheet, Text, TouchableOpacity, View, FlatList, RefreshControl, ScrollView } from 'react-native'
import React, { useEffect, useState } from 'react'

import { getBooks } from '../utils/api'
import BookCard from '../components/Books/BookCard';

const HomeScreen = ({ navigation }) => {
    const [allBooks, setAllBooks] = useState([]); // Lưu toàn bộ dữ liệu
    const [items, setItems] = useState([]); // Dữ liệu đang hiển thị
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isLoadingMore, setIsLoadingMore] = useState(false);

    const [categories, setCategories] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState("All");

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
            const data = await getBooks();
            const sortedData = data.sort((a, b) => Number(b.id) - Number(a.id));

            // Lấy danh mục
            const category = sortedData.reduce((cate, book) => {
                const categories = book.categories?.$values?.map(category => category.name).join(', ') || 'Không rõ';
                if (!cate.includes(categories)) {
                    cate.push(categories);
                }
                return cate;
            }, []);

            setCategories(["All", ...category]);
            setAllBooks(sortedData); // Lưu toàn bộ dữ liệu
            setItems(sortedData.slice(0, pageSize)); // Hiển thị trang đầu tiên
        } catch (error) {
            setError("An error occurred while fetching menu items");
        }
        setLoading(false);
    };

    const handleLoadMore = () => {
        if (isLoadingMore || items.length >= allBooks.length) return; // Nếu đang tải hoặc hết dữ liệu thì dừng

        setIsLoadingMore(true);

        const nextPage = items.length + pageSize;
        const newItems = allBooks.slice(0, nextPage); // Lấy thêm dữ liệu từ `allBooks`

        setItems(newItems);
        setIsLoadingMore(false);
    };

    const CategoryFilterButton = ({ category }) => (
        <TouchableOpacity
            style={[
                styles.filterButton,
                selectedCategory === category && styles.filterButtonActive,
            ]}
            onPress={() => setSelectedCategory(category)}
        >
            <Text
                style={[
                    styles.filterButtonText,
                    selectedCategory === category && styles.filterButtonTextActive,
                ]}
            >
                {category}
            </Text>
        </TouchableOpacity>
    );

    const filteredData = items.filter(
        (item) =>
            selectedCategory === "All" ||
            item.categories?.$values?.map((category) => category.name).join(", ") === selectedCategory
    );

    if (error && !loading) {
        return (
            <View style={styles.container}>
                <Text>{error}</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <View style={styles.filterContainer}>
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.filterScroll}
                >
                    {categories.map((category) => (
                        <CategoryFilterButton key={category} category={category} />
                    ))}
                </ScrollView>
            </View>

            <FlatList
                data={filteredData}
                keyExtractor={(item) => item.id.toString()}
                renderItem={({ item }) => (
                    <View style={styles.cardContainer}>
                        <BookCard item={item} />
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
    );
};

export default HomeScreen;

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