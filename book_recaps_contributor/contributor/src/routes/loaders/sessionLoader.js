import { axiosInstance, getSession, isRoleMatched, isValidToken, setSession } from "../../utils/axios";
import { jwtDecode } from "jwt-decode";

export const sessionLoader = async () => {
  const token = getSession();

  if (!token) {
    setSession(null)
    return null;
  }

  let responseId = null;
  let response;

  try {
    response = await axiosInstance.get("/api/personal/profile");
    responseId = response.data.id || null;
  } catch (e) {
    console.error(e);
  }

  const decoded = jwtDecode(token)
  const userId = decoded[import.meta.env.VITE_CLAIMS_IDENTIFIER]

  if (
    isValidToken(decoded) &&
    isRoleMatched(decoded, "Contributor") &&
    responseId === userId
  ) {
    return {
      email: decoded.email,
      name: decoded[import.meta.env.VITE_CLAIMS_NAME],
      role: "Contributor",
      id: userId,
      profileData: response.data,
    }
  }
  setSession(null)
  return null;
}
