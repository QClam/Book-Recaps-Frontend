export function handleFetchError(error) {
  if (error.response) {
    // The request was made and the server responded with a status code
    // that falls out of the range of 2xx
    console.log(error.response.data);
    console.log(error.response.status);
    console.log(error.response.headers);

    if (error.response.data.message) {
      return { error: error.response.data.message };
    }
    throw error;
  } else if (error.request) {
    // The request was made but no response was received
    console.log(error.request);
    return { error: "Không nhận được phản hồi từ máy chủ" };
  } else {
    // Something happened in setting up the request that triggered an Error
    console.log('Error', error.message);
    console.log(error.config);
  }
  return { error: "Đã xảy ra lỗi" };
}