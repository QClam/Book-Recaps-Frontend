import React from 'react';
import { FaRocket, FaBalanceScale, FaChartLine, FaFlask, FaAppleAlt, FaLevelUpAlt, FaGlobe, FaHistory, FaComments, FaBuilding, FaProjectDiagram, FaLightbulb, FaPiggyBank, FaBrain, FaCogs, FaHeart, FaMobileAlt, FaSmile, FaChild, FaUsers, FaLeaf, FaBook, FaBriefcase, FaGraduationCap, FaPrayingHands, FaPalette, FaChess } from 'react-icons/fa';
import './Categories.scss'; // Import the CSS file

const categories = [
    { name: 'Entrepreneurship', icon: <FaRocket /> },
    { name: 'Politics', icon: <FaBalanceScale /> },
    { name: 'Marketing & Sales', icon: <FaChartLine /> },
    { name: 'Science', icon: <FaFlask /> },
    { name: 'Health & Nutrition', icon: <FaAppleAlt /> },
    { name: 'Personal Development', icon: <FaLevelUpAlt /> },
    { name: 'Economics', icon: <FaGlobe /> },
    { name: 'History', icon: <FaHistory /> },
    { name: 'Communication Skills', icon: <FaComments /> },
    { name: 'Corporate Culture', icon: <FaBuilding /> },
    { name: 'Management & Leadership', icon: <FaProjectDiagram /> },
    { name: 'Motivation & Inspiration', icon: <FaLightbulb /> },
    { name: 'Money & Investments', icon: <FaPiggyBank /> },
    { name: 'Psychology', icon: <FaBrain /> },
    { name: 'Productivity', icon: <FaCogs /> },
    { name: 'Sex & Relationships', icon: <FaHeart /> },
    { name: 'Technology & the Future', icon: <FaMobileAlt /> },
    { name: 'Mindfulness & Happiness', icon: <FaSmile /> },
    { name: 'Parenting', icon: <FaChild /> },
    { name: 'Society & Culture', icon: <FaUsers /> },
    { name: 'Nature & the Environment', icon: <FaLeaf /> },
    { name: 'Biography & Memoir', icon: <FaBook /> },
    { name: 'Career & Success', icon: <FaBriefcase /> },
    { name: 'Education', icon: <FaGraduationCap /> },
    { name: 'Religion & Spirituality', icon: <FaPrayingHands /> },
    { name: 'Creativity', icon: <FaPalette /> },
    { name: 'Philosophy', icon: <FaChess /> },
];

const Categories = () => {
    const rows = [
        categories.slice(0, 6),
        categories.slice(6, 11),
        categories.slice(11, 16),
        categories.slice(16, 21),
        categories.slice(21, 27),
    ];

    return (
        <div className="categories-container">
            <h1>Categories</h1>
            {rows.map((row, rowIndex) => (
                <div key={rowIndex} className="category-row">
                    {row.map((category, index) => (
                        <div key={index} className="category-item">
                            <div className="category-icon">{category.icon}</div>
                            <span className="category-name">{category.name}</span>
                        </div>
                    ))}
                </div>
            ))}
        </div>
    );
};

export default Categories;
