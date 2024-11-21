import { ACCESS_TOKEN } from "./axios";
import { jwtDecode } from "jwt-decode";

export const getCurrentUserInfo = () => {
  const accessToken = localStorage.getItem(ACCESS_TOKEN)
  if (!accessToken) return null;

  const decoded = jwtDecode(accessToken)
  const id = decoded[import.meta.env.VITE_CLAIMS_IDENTIFIER]
  if (!id) return null;

  return {
    id,
    role: decoded[import.meta.env.VITE_CLAIMS_ROLE],
    name: decoded[import.meta.env.VITE_CLAIMS_NAME],
    email: decoded[import.meta.env.VITE_CLAIMS_EMAIL],
  }
}