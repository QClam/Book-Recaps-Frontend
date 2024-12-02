import api from "../Auth/AxiosInterceptors";

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

export const fetchContractDetail = async (contractId) => {
    if (!contractId) {
        return null;
    }

    try {
        const response = await api.get(`api/Contract/getcontractby/${contractId}`);
        const contract = resolveRefs(response.data.data);
        const contractAttachments = contract.contractAttachments?.$values;
        const contractBooks = contract.books?.$values;
        // console.log("Contract Books: ", contractBooks);
        
        return { contract, contractAttachments, contractBooks };
    } catch (error) {
        console.error("Error Fetching", error);
        throw error;
    }
}