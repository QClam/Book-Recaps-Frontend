import axios from "axios";

const ACCESS_TOKEN = "access_token";

export const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_ENDPOINT,
});

export const isValidToken = (decoded) => {
  if (!decoded) {
    return false
  }

  // if (!decoded.exp) {
  //   return false
  // }
  //
  // const currentTime = Date.now() / 1000
  //
  // return decoded.exp > currentTime
  return true
}

export const isRoleMatched = (decoded, role) => {
  if (!decoded) {
    return false
  }

  return decoded[import.meta.env.VITE_CLAIMS_ROLE] === role
}

export const setSession = (accessToken) => {
  if (accessToken) {
    localStorage.setItem(ACCESS_TOKEN, accessToken)
    axiosInstance.defaults.headers.common.Authorization = `Bearer ${accessToken}`
  } else {
    localStorage.removeItem(ACCESS_TOKEN)
    delete axiosInstance.defaults.headers.common.Authorization
  }
}

export const getSession = () => {
  const accessToken = localStorage.getItem(ACCESS_TOKEN)

  if (isValidToken(accessToken)) {
    axiosInstance.defaults.headers.common.Authorization = `Bearer ${accessToken}`
    return accessToken
  }

  return null
}