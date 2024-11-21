import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../../Explore/ListCategory/ListCategory.scss';
import '@fortawesome/fontawesome-free/css/all.min.css';
const ListCategory = () => {
    const [categories, setCategories] = useState([]);
    const navigate = useNavigate();

    // Function to assign icons based on category names
    const getCategoryIcon = (category) => {
        switch (category) {
            case 'Comics & Graphic Novels':
                return 'fas fa-book-open';  // Use a specific icon for Comics & Graphic Novels
            case 'Fiction':
                return 'fas fa-feather-alt';  // Use an icon for Fiction
            case 'Literary Criticism':
                return 'fas fa-gavel';  // Use an icon for Literary Criticism
            case 'Young Adult Fiction':
                return 'fas fa-user';  // Use an icon for Young Adult Fiction
            case 'Language Arts & Disciplines':
                return 'fas fa-language';  // Use an icon for Language Arts & Disciplines
            case 'History':
                return 'fas fa-landmark';  // Use an icon for History
            default:
                return 'fas fa-book';  // Default icon for any other categories
        }
    };

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                
                const response = await axios.get(``);
                const books = response.data.items;

                // Extract unique categories from the books
                const categoriesSet = new Set();
                books.forEach(book => {
                    if (book.volumeInfo.categories) {
                        book.volumeInfo.categories.forEach(category => categoriesSet.add(category));
                    }
                });

                setCategories(Array.from(categoriesSet));
            } catch (error) {
                console.error('Error fetching categories:', error);
            }
        };

        fetchCategories();
    }, []);

    const handleCategoryClick = (category) => {
        navigate(`/books?category=${encodeURIComponent(category)}`);
    };

    return (
        <div className="categories-container">
            <h2>Categories</h2>
            <p>Explore all categories</p>
            <div className="categories-grid">
                {categories.length === 0 ? (
                    <p>Loading categories...</p>
                ) : (
                    categories.slice(0, 6).map((category, index) => (
                        <div 
                            key={index} 
                            className="category-card"
                            onClick={() => handleCategoryClick(category)}
                        >
                            <i className={getCategoryIcon(category)}></i>
                            <span className="category-name">{category}</span>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default ListCategory;
