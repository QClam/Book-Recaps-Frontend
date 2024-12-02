import axios from "axios";

export const ACCESS_TOKEN = "authToken";

export const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_ENDPOINT,
});

export const axiosInstance2 = axios.create({
  baseURL: import.meta.env.VITE_API_ENDPOINT_2,
});

export const isValidToken = (decoded) => {
  if (!decoded) {
    return false
  }
  // if (!decoded.exp) {
  //   return false
  // }
  // const currentTime = Date.now() / 1000
  //
  // return decoded.exp > currentTime
  return true
}

export const isRoleMatched = (decoded, role) => {
  if (!decoded) {
    return false
  }

  if (Array.isArray(decoded[import.meta.env.VITE_CLAIMS_ROLE])) {
    return decoded[import.meta.env.VITE_CLAIMS_ROLE].includes(role)
  }

  return decoded[import.meta.env.VITE_CLAIMS_ROLE] === role
}

export const setSession = (accessToken) => {
  if (accessToken) {
    localStorage.setItem(ACCESS_TOKEN, accessToken)
    axiosInstance.defaults.headers.common.Authorization = `Bearer ${accessToken}`
    axiosInstance2.defaults.headers.common.Authorization = `Bearer ${accessToken}`
  } else {
    localStorage.removeItem(ACCESS_TOKEN)
    delete axiosInstance.defaults.headers.common.Authorization
    delete axiosInstance2.defaults.headers.common.Authorization
  }
}

export const getSession = () => {
  const accessToken = localStorage.getItem(ACCESS_TOKEN)

  if (isValidToken(accessToken)) {
    axiosInstance.defaults.headers.common.Authorization = `Bearer ${accessToken}`
    axiosInstance2.defaults.headers.common.Authorization = `Bearer ${accessToken}`
    return accessToken
  }

  localStorage.removeItem(ACCESS_TOKEN)
  delete axiosInstance.defaults.headers.common.Authorization
  delete axiosInstance2.defaults.headers.common.Authorization
  return null
}