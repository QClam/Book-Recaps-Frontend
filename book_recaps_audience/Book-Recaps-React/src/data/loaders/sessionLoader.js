import { axiosInstance, getSession, isRoleMatched, isValidToken, setSession } from "../../utils/axios";
import { jwtDecode } from "jwt-decode";

export const sessionLoader = async () => {
  const token = getSession();
  if (!token) return null;

  let responseId = null;
  let isOnboarded = false;
  let profileData = null;

  try {
    const response = await axiosInstance.get("/api/personal/profile");
    profileData = response.data;
    responseId = response.data.id || null;
    isOnboarded = response.data.isOnboarded || false;
  } catch (e) {
    console.error(e);
  }

  const decoded = jwtDecode(token)
  const userId = decoded[import.meta.env.VITE_CLAIMS_IDENTIFIER]

  if (
    profileData &&
    isValidToken(decoded) &&
    (isRoleMatched(decoded, "Contributor") || isRoleMatched(decoded, "Customer")) &&
    responseId === userId
  ) {
    return {
      email: decoded.email,
      name: decoded[import.meta.env.VITE_CLAIMS_NAME],
      id: userId,
      isOnboarded,
      profileData,
    }
  }
  setSession(null)
  return null;
}
