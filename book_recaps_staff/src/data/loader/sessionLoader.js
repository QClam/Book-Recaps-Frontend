import { axiosInstance, getSession, isRoleMatched, isValidToken, setSession } from "../../utils/axios";
import { jwtDecode } from "jwt-decode";

export const sessionLoader = async () => {
  const token = getSession();
  if (!token) return null;

  let responseId = null;
  let profileData = null;

  try {
    const response = await axiosInstance.get("/api/personal/profile");
    responseId = response.data?.id || null;
    profileData = response.data;
  } catch (e) {
    console.error(e);
  }

  const decoded = jwtDecode(token)
  const userId = decoded[import.meta.env.VITE_CLAIMS_IDENTIFIER]

  if (
    profileData &&
    isValidToken(decoded) &&
    isRoleMatched(decoded, "Staff") &&
    responseId === userId
  ) {
    return {
      email: decoded.email,
      name: profileData.fullName,
      role: "Staff",
      id: userId,
      profileData,
    }
  }
  setSession(null)
  return null;
}
