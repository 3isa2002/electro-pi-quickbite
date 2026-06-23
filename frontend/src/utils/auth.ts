export const setToken = (token: string) => {
  if (typeof window !== "undefined") {
    document.cookie = `token=${token}; path=/; max-age=86400; SameSite=Lax`;
  }
};

export const getToken = (): string | null => {
  if (typeof window !== "undefined") {
    const match = document.cookie.match(new RegExp('(^| )token=([^;]+)'));
    if (match) return match[2];
  }
  return null;
};

export const removeToken = () => {
  if (typeof window !== "undefined") {
    document.cookie = "token=; path=/; max-age=0;";
  }
};
