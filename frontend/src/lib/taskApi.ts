import { API_URL } from "./api";
import { authenticatedFetch } from "./authenticatedFetch";

import type { GetTasksResponse, Task, Priority } from "../types/task";

export interface GetTasksParams {
  search?: string;
  completed?: boolean;
  priority?: Priority;
  sortBy?: "createdAt" | "updatedAt" | "title" | "priority";
  order?: "asc" | "desc";
  page?: number;
  limit?: number;
}

// -------------------------
// Get tasks
// -------------------------

export const getTasks = async (
  accessToken: string,
  refreshAccessToken: () => Promise<string | null>,
  params?: GetTasksParams,
): Promise<GetTasksResponse> => {
  const searchParams = new URLSearchParams();

  if (params?.search) {
    searchParams.set("search", params.search);
  }

  if (params?.completed !== undefined) {
    searchParams.set("completed", String(params.completed));
  }

  if (params?.priority) {
    searchParams.set("priority", params.priority);
  }

  if (params?.sortBy) {
    searchParams.set("sortBy", params.sortBy);
  }

  if (params?.order) {
    searchParams.set("order", params.order);
  }

  if (params?.page !== undefined) {
    searchParams.set("page", String(params.page));
  }

  if (params?.limit !== undefined) {
    searchParams.set("limit", String(params.limit));
  }

  const queryString = searchParams.toString();

  const url = queryString
    ? `${API_URL}/tasks?${queryString}`
    : `${API_URL}/tasks`;

  const response = await authenticatedFetch(
    url,
    accessToken,
    refreshAccessToken,
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to fetch tasks");
  }

  return data;
};

// -------------------------
// Create task
// -------------------------

export const createTask = async (
  accessToken: string,
  refreshAccessToken: () => Promise<string | null>,
  title: string,
  description: string,
  priority: Priority,
): Promise<Task> => {
  const response = await authenticatedFetch(
    `${API_URL}/tasks`,
    accessToken,
    refreshAccessToken,
    {
      method: "POST",

      headers: {
        "Content-Type": "application/json",
      },

      body: JSON.stringify({
        title,
        description,
        priority,
      }),
    },
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to create task");
  }

  return data.task;
};

// -------------------------
// Update task
// -------------------------

export const updateTask = async (
  accessToken: string,
  refreshAccessToken: () => Promise<string | null>,
  taskId: number,
  title: string,
  description: string,
  priority: Priority,
  completed: boolean,
): Promise<Task> => {
  const response = await authenticatedFetch(
    `${API_URL}/tasks/${taskId}`,
    accessToken,
    refreshAccessToken,
    {
      method: "PATCH",

      headers: {
        "Content-Type": "application/json",
      },

      body: JSON.stringify({
        title,
        description,
        priority,
        completed,
      }),
    },
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to update task");
  }

  return data.task;
};

// -------------------------
// Delete task
// -------------------------

export const deleteTask = async (
  accessToken: string,
  refreshAccessToken: () => Promise<string | null>,
  taskId: number,
): Promise<void> => {
  const response = await authenticatedFetch(
    `${API_URL}/tasks/${taskId}`,
    accessToken,
    refreshAccessToken,
    {
      method: "DELETE",
    },
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to delete task");
  }
};
