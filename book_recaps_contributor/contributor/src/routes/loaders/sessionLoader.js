import { axiosInstance, getSession, isRoleMatched, isValidToken, setSession } from "../../utils/axios";
import { jwtDecode } from "jwt-decode";

export const sessionLoader = async () => {
  const token = getSession();

  if (!token) {
    setSession(null)
    return null;
  }

  let responseId = null;

  try {
    const response = await axiosInstance.get("/api/personal/profile");
    responseId = response.data.id || null;
  } catch (e) {
    console.error(e);
  }

  const decoded = jwtDecode(token)

  if (
    isValidToken(decoded) &&
    isRoleMatched(decoded, "Contributor") &&
    responseId === decoded[import.meta.env.VITE_CLAIMS_IDENTIFIER]
  ) {
    return {
      email: decoded.email,
      name: decoded[import.meta.env.VITE_CLAIMS_NAME],
      role: "Contributor",
      id: decoded[import.meta.env.VITE_CLAIMS_IDENTIFIER]
    }
  }
  setSession(null)
  return null;
}
