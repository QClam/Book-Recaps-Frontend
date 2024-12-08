import { axiosInstance, getSession, isRoleMatched, isValidToken, setSession } from "../../utils/axios";
import { jwtDecode } from "jwt-decode";

export const sessionLoader = async () => {
  const token = getSession();
  if (!token) return null;

  let responseId = null;
  let profileData = null;
  let pub = null;

  try {
    const response = await axiosInstance.get("/api/personal/profile");
    const publisherRes = await axiosInstance.get("/api/publisher/getbypublisheruser/" + response.data?.id);
    responseId = response.data?.id || null;
    profileData = response.data;
    pub = publisherRes.data;
  } catch (e) {
    console.error(e);
  }

  const decoded = jwtDecode(token)
  const userId = decoded[import.meta.env.VITE_CLAIMS_IDENTIFIER]

  if (
    profileData && pub &&
    isValidToken(decoded) &&
    isRoleMatched(decoded, "Publisher") &&
    responseId === userId
  ) {
    localStorage.setItem("publisher", pub.id);
    return {
      email: decoded.email,
      name: profileData.fullName,
      role: "Publisher",
      id: userId,
      profileData,
      publisherData: pub,
    }
  }
  setSession(null)
  return null;
}
