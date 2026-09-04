
type RefreshAccessToken = () => Promise<string | null>;

let refreshPromise: Promise<string | null> | null = null;

export const authenticatedFetch = async (
  url: string,
  accessToken: string,
  refreshAccessToken: RefreshAccessToken,
  options: RequestInit = {},
): Promise<Response> => {
  // -------------------------
  // First request
  // -------------------------

  const response = await fetch(url, {
    ...options,

    headers: {
      ...options.headers,
      Authorization: `Bearer ${accessToken}`,
    },

    credentials: "include",
  });

  // If the request was successful,
  // return the response immediately.
  if (response.status !== 401) {
    return response;
  }

  // -------------------------
  // Access token expired
  // -------------------------

  if (!refreshPromise) {
    refreshPromise = refreshAccessToken().finally(() => {
      refreshPromise = null;
    });
  }

  const newAccessToken = await refreshPromise;

  // Refresh failed.
  if (!newAccessToken) {
    return response;
  }

  // -------------------------
  // Retry original request
  // -------------------------

  return fetch(url, {
    ...options,

    headers: {
      ...options.headers,
      Authorization: `Bearer ${newAccessToken}`,
    },

    credentials: "include",
  });
};
