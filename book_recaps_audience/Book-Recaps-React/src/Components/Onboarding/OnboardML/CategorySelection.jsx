import { useEffect, useState } from 'react';
import { axiosInstance } from "../../../utils/axios";

const getCategories = async (controller) => {
  try {
    const response = await axiosInstance.get("/categories", {
      signal: controller.signal
    });
    return response.data;
  } catch (error) {
    console.error("Error get categories:", error);
    return [];
  }
};

const CategorySelection = ({ onNext, onCategorySelect }) => {
    const [ categories, setCategories ] = useState([]);
    const [ loading, setLoading ] = useState(false);
    const [ selectedCategories, setSelectedCategories ] = useState([]);

    useEffect(() => {
      const controller = new AbortController();

      const fetchCategories = async () => {
        setLoading(true);
        const data = await getCategories(controller)

        setCategories(data);
        setLoading(false);
      }

      fetchCategories();

      return () => {
        controller.abort();
      }
    }, []);

    useEffect(() => {
      if (selectedCategories.length === 3) {
        onCategorySelect(selectedCategories);
        onNext();
      }
    }, [ selectedCategories ]);

    const handleCategoryChange = (category) => {
      setSelectedCategories(prev => {
        if (prev.some(c => c.id === category.id)) {
          return prev.filter(cat => cat.id !== category.id);
        } else if (prev.length < 3) {
          return [ ...prev, category ];
        }
        return prev;
      });
    };

    return (
      <div className="step-content">
        <h2>Select your favorite categories</h2>
        <div className="category-selection">
          {loading && <div className="loading-indicator">Loading...</div>}
          {categories.map(category => (
            <div
              key={category.id}
              className={`category-item ${selectedCategories.some((c) => c.id === category.id) ? 'selected' : ''}`}
              onClick={() => !loading && handleCategoryChange(category)}
            >
              {category.name}
            </div>
          ))}
        </div>
      </div>
    );
  }
;

export default CategorySelection;
