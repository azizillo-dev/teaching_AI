import { API_BASE_URL } from "@/constants";

export const getMediaUrl = (url: string | null | undefined): string => {
  if (!url) return "";
  if (url.startsWith("http://") || url.startsWith("https://") || url.startsWith("blob:")) {
    return url;
  }
  
  // Extract the origin from API_BASE_URL (e.g. "http://127.0.0.1:8000" from "http://127.0.0.1:8000/api/v1")
  const originMatch = API_BASE_URL.match(/^(https?:\/\/[^\/]+)/);
  const origin = originMatch ? originMatch[1] : "";
  
  // Ensure we don't double slash if url starts with /
  if (url.startsWith("/")) {
    return `${origin}${url}`;
  }
  return `${origin}/${url}`;
};
