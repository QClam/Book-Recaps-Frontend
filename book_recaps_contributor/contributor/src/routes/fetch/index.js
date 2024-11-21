import { json } from "react-router-dom";

import { axiosInstance, axiosInstance2 } from "../../utils/axios";
import { handleFetchError } from "../../utils/handleFetchError";

export const getBookInfoById = async (bookId, request) => {
  try {
    const response = await axiosInstance.get('/api/book/getbookbyid/' + bookId, {
      signal: request.signal
    });
    return response.data.data;
  } catch (error) {
    const err = handleFetchError(error);
    throw json({ error: err.error }, { status: err.status });
  }
}

export const getBookInfoByRecap = async (recapId, request) => {
  try {
    const response = await axiosInstance2.get('/books/by-recap/' + recapId, {
      signal: request.signal
    });
    return response.data;
  } catch (error) {
    const err = handleFetchError(error);
    throw json({ error: err.error }, { status: err.status });
  }
}