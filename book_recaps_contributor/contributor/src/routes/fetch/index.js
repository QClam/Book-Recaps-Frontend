import { json } from "react-router-dom";

import { axiosInstance } from "../../utils/axios";
import { handleFetchError } from "../../utils/handleFetchError";

export const getBookInfoByRecap = async (bookId, request) => {
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
