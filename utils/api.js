import api from "./AxiosInterceptors";

const resolveRefs = (data) => {
    const refMap = new Map();
    const createRefMap = (obj) => {
        if (typeof obj !== "object" || obj === null) return;
        if (obj.$id) {
            refMap.set(obj.$id, obj);
        }
        for (const key in obj) {
            if (obj.hasOwnProperty(key)) {
                createRefMap(obj[key]);
            }
        }
    };
    const resolveRef = (obj) => {
        if (typeof obj !== "object" || obj === null) return obj;
        if (obj.$ref) {
            return refMap.get(obj.$ref);
        }
        for (const key in obj) {
            if (obj.hasOwnProperty(key)) {
                obj[key] = resolveRef(obj[key]);
            }
        }
        return obj;
    };
    createRefMap(data);
    return resolveRef(data);
  };

  export const getBooks = async () => {
    try {
      const response = await api.get('/api/book/getallbooks');
      const data = resolveRefs(response.data.data.$values);
  
      return data;
    } catch (error) {
      console.error("Error Fetching Books", error);
    }
  }

  export const getRecaps = async () => {
    try {
        const response = await api.get('/api/recap/Getallrecap');
        const data = resolveRefs(response.data.data.$values)

        return data;
    } catch (error) {
      console.error("Error Fetching Recaps", error);       
    }
  }