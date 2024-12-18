export function handleFetchError(error) {
  if (error.response) {
    // The request was made and the server responded with a status code
    // that falls out of the range of 2xx
    console.log(error.response.data);
    console.log(error.response.status);
    console.log(error.response.headers);

    if (error.response.status === 401) {
      return { error: "Phiên đăng nhập đã hết hạn", status: 401 };
    }
    if (error.response.status === 413) {
      return { error: "Dung lượng file quá lớn", status: 413 };
    }
    if (error.response.data?.message) {
      return { error: error.response.data.message, status: error.response.status, data: error.response.data.data };
    }
    if (error.response.data?.error) {
      return { error: error.response.data.error, status: error.response.status };
    }
    return { error: "Đã xảy ra lỗi", status: error.response.status || 500 };
  } else if (error.request) {
    // The request was made but no response was received
    console.log(error);

    return { error: "Không nhận được phản hồi từ máy chủ", status: 401 };
  } else {
    // Something happened in setting up the request that triggered an Error
    console.log('Error', error.message);
    console.log(error.config);
  }
  return { error: "Đã xảy ra lỗi", status: 500 };
}
