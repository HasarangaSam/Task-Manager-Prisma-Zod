import { useEffect, useState } from "react";
import { Plus } from "lucide-react";

import { useAuth } from "../context/AuthContext";
import { createTask, deleteTask, getTasks, updateTask } from "../lib/taskApi";
import type { Pagination as PaginationType, Priority, Task } from "../types/task";

import Navbar from "../components/Navbar";
import TaskFilters, { type SortField, type SortOrder } from "../components/TaskFilters";
import CreateTaskForm from "../components/CreateTaskForm";
import EditTaskForm from "../components/EditTaskForm";
import TaskCard from "../components/TaskCard";
import Pagination from "../components/Pagination";

const Tasks = () => {
  const { user, accessToken, logout, refreshAccessToken } = useAuth();

  const [tasks, setTasks] = useState<Task[]>([]);
  const [pagination, setPagination] = useState<PaginationType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // -------------------------
  // Search, Filter & Sort state
  // -------------------------
  const [search, setSearch] = useState("");
  const [appliedSearch, setAppliedSearch] = useState("");
  const [completed, setCompleted] = useState<boolean | undefined>(undefined);
  const [priorityFilter, setPriorityFilter] = useState<Priority | undefined>(undefined);
  const [sortBy, setSortBy] = useState<SortField>("createdAt");
  const [order, setOrder] = useState<SortOrder>("desc");
  const [page, setPage] = useState<number>(1);
  const [limit, setLimit] = useState<number>(10);

  // -------------------------
  // Create task state
  // -------------------------
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<Priority>("MEDIUM");
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState("");

  // -------------------------
  // Edit task state
  // -------------------------
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editPriority, setEditPriority] = useState<Priority>("MEDIUM");
  const [editCompleted, setEditCompleted] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [editError, setEditError] = useState("");

  // -------------------------
  // Delete task state
  // -------------------------
  const [deletingTaskId, setDeletingTaskId] = useState<number | null>(null);
  const [deleteError, setDeleteError] = useState("");

  // -------------------------
  // Toggle task status state
  // -------------------------
  const [togglingTaskId, setTogglingTaskId] = useState<number | null>(null);

  // -------------------------
  // Load tasks with pagination, sorting & filters
  // -------------------------
  useEffect(() => {
    if (!accessToken) {
      setLoading(false);
      return;
    }

    let isMounted = true;

    const loadTasks = async () => {
      try {
        setError("");
        setLoading(true);

        const data = await getTasks(accessToken, refreshAccessToken, {
          search: appliedSearch.trim() || undefined,
          completed,
          priority: priorityFilter,
          sortBy,
          order,
          page,
          limit,
        });

        if (isMounted) {
          setTasks(data.tasks);
          setPagination(data.pagination);
        }
      } catch (err) {
        if (isMounted) {
          if (err instanceof Error) {
            setError(err.message);
          } else {
            setError("Failed to load tasks");
          }
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadTasks();

    return () => {
      isMounted = false;
    };
  }, [
    accessToken,
    refreshAccessToken,
    appliedSearch,
    completed,
    priorityFilter,
    sortBy,
    order,
    page,
    limit,
    refreshTrigger,
  ]);

  // -------------------------
  // Filter Handlers
  // -------------------------
  const handleSearch = () => {
    setAppliedSearch(search);
    setPage(1);
    setRefreshTrigger((prev) => prev + 1);
  };

  const handleStatusChange = (newStatus: boolean | undefined) => {
    setCompleted(newStatus);
    setPage(1);
  };

  const handlePriorityChange = (newPriority: Priority | undefined) => {
    setPriorityFilter(newPriority);
    setPage(1);
  };

  const handleSortChange = (newSortBy: SortField, newOrder: SortOrder) => {
    setSortBy(newSortBy);
    setOrder(newOrder);
    setPage(1);
  };

  const handleResetFilters = () => {
    setSearch("");
    setAppliedSearch("");
    setCompleted(undefined);
    setPriorityFilter(undefined);
    setSortBy("createdAt");
    setOrder("desc");
    setPage(1);
    setRefreshTrigger((prev) => prev + 1);
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleLimitChange = (newLimit: number) => {
    setLimit(newLimit);
    setPage(1);
  };

  // -------------------------
  // Create task
  // -------------------------
  const handleCreateTask = async () => {
    if (!accessToken) {
      return;
    }

    setCreateError("");
    setCreating(true);

    try {
      await createTask(
        accessToken,
        refreshAccessToken,
        title,
        description,
        priority,
      );

      setTitle("");
      setDescription("");
      setPriority("MEDIUM");
      setShowCreateForm(false);

      // Reset to page 1 so the newly created item is visible with default newest sort
      if (page !== 1) {
        setPage(1);
      } else {
        setRefreshTrigger((prev) => prev + 1);
      }
    } catch (err) {
      if (err instanceof Error) {
        setCreateError(err.message);
      } else {
        setCreateError("Failed to create task");
      }
    } finally {
      setCreating(false);
    }
  };

  // -------------------------
  // Open edit form
  // -------------------------
  const handleEditClick = (task: Task) => {
    setEditingTask(task);
    setEditTitle(task.title);
    setEditDescription(task.description ?? "");
    setEditPriority(task.priority);
    setEditCompleted(task.completed);
    setEditError("");
  };

  // -------------------------
  // Update task
  // -------------------------
  const handleUpdateTask = async () => {
    if (!accessToken || !editingTask) {
      return;
    }

    setEditError("");
    setUpdating(true);

    try {
      await updateTask(
        accessToken,
        refreshAccessToken,
        editingTask.id,
        editTitle,
        editDescription,
        editPriority,
        editCompleted,
      );

      setEditingTask(null);
      setRefreshTrigger((prev) => prev + 1);
    } catch (err) {
      if (err instanceof Error) {
        setEditError(err.message);
      } else {
        setEditError("Failed to update task");
      }
    } finally {
      setUpdating(false);
    }
  };

  // -------------------------
  // Toggle complete
  // -------------------------
  const handleToggleComplete = async (task: Task) => {
    if (!accessToken) {
      return;
    }

    setTogglingTaskId(task.id);

    try {
      await updateTask(
        accessToken,
        refreshAccessToken,
        task.id,
        task.title,
        task.description ?? "",
        task.priority,
        !task.completed,
      );

      setRefreshTrigger((prev) => prev + 1);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Failed to toggle task status");
      }
    } finally {
      setTogglingTaskId(null);
    }
  };

  // -------------------------
  // Delete task
  // -------------------------
  const handleDeleteTask = async (taskId: number) => {
    if (!accessToken) {
      return;
    }

    const confirmed = window.confirm(
      "Are you sure you want to delete this task?",
    );

    if (!confirmed) {
      return;
    }

    setDeleteError("");
    setDeletingTaskId(taskId);

    try {
      await deleteTask(accessToken, refreshAccessToken, taskId);

      // If we deleted the only item on the current page and we're not on page 1, go back one page
      if (tasks.length === 1 && page > 1) {
        setPage((prev) => prev - 1);
      } else {
        setRefreshTrigger((prev) => prev + 1);
      }
    } catch (err) {
      if (err instanceof Error) {
        setDeleteError(err.message);
      } else {
        setDeleteError("Failed to delete task");
      }
    } finally {
      setDeletingTaskId(null);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Navbar */}
      <Navbar userName={user?.name} onLogout={logout} />

      {/* Main */}
      <main className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">My Tasks</h2>
            <p className="text-gray-500 mt-1">
              Manage your tasks, filter, sort, and stay organized.
            </p>
          </div>

          <button
            onClick={() => {
              setShowCreateForm(true);
              setCreateError("");
            }}
            className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-3 font-medium text-white hover:bg-blue-700 transition-colors"
          >
            <Plus size={18} />
            Add Task
          </button>
        </div>

        {/* Search, Filters & Sorting */}
        <TaskFilters
          search={search}
          completed={completed}
          priority={priorityFilter}
          sortBy={sortBy}
          order={order}
          onSearchChange={setSearch}
          onCompletedChange={handleStatusChange}
          onPriorityChange={handlePriorityChange}
          onSortChange={handleSortChange}
          onSearch={handleSearch}
          onReset={handleResetFilters}
        />

        {/* General error */}
        {error && (
          <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
            {error}
          </div>
        )}

        {/* Delete error */}
        {deleteError && (
          <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
            {deleteError}
          </div>
        )}

        {/* Create form */}
        {showCreateForm && (
          <CreateTaskForm
            title={title}
            description={description}
            priority={priority}
            creating={creating}
            error={createError}
            onTitleChange={setTitle}
            onDescriptionChange={setDescription}
            onPriorityChange={setPriority}
            onSubmit={handleCreateTask}
            onClose={() => setShowCreateForm(false)}
          />
        )}

        {/* Edit form */}
        {editingTask && (
          <EditTaskForm
            title={editTitle}
            description={editDescription}
            priority={editPriority}
            completed={editCompleted}
            updating={updating}
            error={editError}
            onTitleChange={setEditTitle}
            onDescriptionChange={setEditDescription}
            onPriorityChange={setEditPriority}
            onCompletedChange={setEditCompleted}
            onSubmit={handleUpdateTask}
            onClose={() => setEditingTask(null)}
          />
        )}

        {/* Tasks List */}
        {loading ? (
          <div className="text-center py-16 text-gray-500 bg-white rounded-xl border border-gray-200">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-600 border-t-transparent mb-3" />
            <p>Loading tasks...</p>
          </div>
        ) : tasks.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 p-10 text-center">
            <h3 className="text-lg font-semibold text-gray-900">
              No tasks found
            </h3>
            <p className="text-gray-500 mt-2">
              {appliedSearch ||
              completed !== undefined ||
              priorityFilter !== undefined
                ? "No tasks match your filters."
                : "Create your first task to get started."}
            </p>
            {(appliedSearch ||
              completed !== undefined ||
              priorityFilter !== undefined ||
              sortBy !== "createdAt" ||
              order !== "desc") && (
              <button
                type="button"
                onClick={handleResetFilters}
                className="mt-4 inline-flex items-center gap-1.5 rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Reset Filters
              </button>
            )}
          </div>
        ) : (
          <>
            <div className="grid gap-4">
              {tasks.map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  onEdit={handleEditClick}
                  onDelete={handleDeleteTask}
                  onToggleComplete={handleToggleComplete}
                  deleting={deletingTaskId === task.id}
                  toggling={togglingTaskId === task.id}
                />
              ))}
            </div>

            {/* Pagination Controls */}
            {pagination && pagination.totalTasks > 0 && (
              <Pagination
                page={pagination.page}
                totalPages={pagination.totalPages}
                totalTasks={pagination.totalTasks}
                limit={pagination.limit}
                hasNextPage={pagination.hasNextPage}
                hasPreviousPage={pagination.hasPreviousPage}
                onPageChange={handlePageChange}
                onLimitChange={handleLimitChange}
              />
            )}
          </>
        )}
      </main>
    </div>
  );
};

export default Tasks;
