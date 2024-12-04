import { Alert, StyleSheet, Text, TextInput, TouchableOpacity, View, FlatList, RefreshControl, ScrollView } from 'react-native'
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
    const [searchQuery, setSearchQuery] = useState(""); // State cho tìm kiếm

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

    // Lọc dữ liệu theo danh mục và tìm kiếm
    const filteredData = items.filter(
        (item) =>
            (selectedCategory === "All" ||
                item.categories?.$values?.map((category) => category.name).join(", ") === selectedCategory) &&
            item.title.toLowerCase().includes(searchQuery.toLowerCase())
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
            {/* Ô tìm kiếm */}
            <View style={styles.searchContainer}>
                <TextInput
                    style={styles.searchInput}
                    placeholder="Tìm kiếm sách..."
                    value={searchQuery}
                    onChangeText={(text) => setSearchQuery(text)}
                />
            </View>

            {/* Bộ lọc danh mục */}
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

            {/* Danh sách sách */}
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
        backgroundColor: "#f0f0f5", // Đổi màu nền nhẹ nhàng
    },
    searchContainer: {
        padding: 5,
        backgroundColor: "#ffffff",
        borderBottomWidth: 1,
        borderBottomColor: "#e0e0e0", // Đổi màu viền nhẹ cho đẹp mắt
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 4, // Thêm bóng đổ cho thanh tìm kiếm
    },
    searchInput: {
        backgroundColor: "#f4f4f4",
        borderRadius: 25,
        paddingHorizontal: 20,
        paddingVertical: 10,
        fontSize: 16,
        color: "#333", // Màu chữ tối cho dễ đọc
        
    },
    filterContainer: {
        backgroundColor: "#ffffff",
        paddingVertical: 14,
        borderBottomWidth: 1,
        borderBottomColor: "#e1e1e1",
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingHorizontal: 16,
    },
    filterScroll: {
        flexDirection: "row",
        paddingVertical: 8,
    },
    filterButton: {
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 30,
        backgroundColor: "#e0e0e0",
        marginRight: 10,
        borderWidth: 1,
        borderColor: "#d0d0d0",
        transition: "all 0.3s ease", // Hiệu ứng khi hover
    },
    filterButtonActive: {
        backgroundColor: "#007AFF",
        borderColor: "#007AFF", // Thay đổi màu khi được chọn
    },
    filterButtonText: {
        fontSize: 16,
        color: "#777",
        fontWeight: "600",
    },
    filterButtonTextActive: {
        color: "#fff",
    },
    listContainer: {
        paddingHorizontal: 12, // Khoảng cách từ hai bên
    },
    cardContainer: {
        flex: 1,
        margin: 10, // Tăng khoảng cách giữa các thẻ
        borderRadius: 10, // Góc bo tròn
        overflow: "hidden", // Ẩn phần ngoài thẻ
        backgroundColor: "#ffffff",
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 5, // Thêm bóng đổ cho card
    },
});
