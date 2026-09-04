import { Search, RotateCcw, X } from "lucide-react";

import type { Priority } from "../types/task";

export type SortField = "createdAt" | "updatedAt" | "title" | "priority";
export type SortOrder = "asc" | "desc";

interface TaskFiltersProps {
  search: string;
  completed: boolean | undefined;
  priority: Priority | undefined;
  sortBy: SortField;
  order: SortOrder;

  onSearchChange: (value: string) => void;
  onCompletedChange: (value: boolean | undefined) => void;
  onPriorityChange: (value: Priority | undefined) => void;
  onSortChange: (sortBy: SortField, order: SortOrder) => void;

  onSearch: () => void;
  onReset: () => void;
}

const TaskFilters = ({
  search,
  completed,
  priority,
  sortBy,
  order,
  onSearchChange,
  onCompletedChange,
  onPriorityChange,
  onSortChange,
  onSearch,
  onReset,
}: TaskFiltersProps) => {
  const currentSortValue = `${sortBy}_${order}`;

  const isFiltered =
    Boolean(search) ||
    completed !== undefined ||
    priority !== undefined ||
    sortBy !== "createdAt" ||
    order !== "desc";

  const handleSortSelectChange = (value: string) => {
    const [field, sortOrder] = value.split("_") as [SortField, SortOrder];
    onSortChange(field, sortOrder);
  };

  return (
    <div className="mb-6 rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
      <form
        onSubmit={(event) => {
          event.preventDefault();
          onSearch();
        }}
        className="space-y-4"
      >
        {/* Search */}
        <div className="flex gap-3">
          <div className="relative flex-1">
            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />

            <input
              type="text"
              value={search}
              onChange={(event) => onSearchChange(event.target.value)}
              placeholder="Search tasks by title or description..."
              className="w-full rounded-lg border border-gray-300 py-3 pl-10 pr-10 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />

            {search && (
              <button
                type="button"
                onClick={() => {
                  onSearchChange("");
                  if (search) {
                    // Trigger empty search
                    onReset();
                  }
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                aria-label="Clear search"
              >
                <X size={16} />
              </button>
            )}
          </div>

          <button
            type="submit"
            className="flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-3 font-medium text-white hover:bg-blue-700"
          >
            <Search size={18} />
            <span>Search</span>
          </button>

          {isFiltered && (
            <button
              type="button"
              onClick={onReset}
              className="flex items-center gap-2 rounded-lg border border-gray-300 px-4 py-3 font-medium text-gray-700 hover:bg-gray-50"
              title="Reset all filters to default"
            >
              <RotateCcw size={16} />
              <span className="hidden sm:inline">Reset</span>
            </button>
          )}
        </div>

        {/* Filter & Sort Controls */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {/* Status */}
          <div>
            <label
              htmlFor="status-filter"
              className="mb-2 block text-sm font-medium text-gray-700"
            >
              Status
            </label>

            <select
              id="status-filter"
              value={
                completed === undefined
                  ? "all"
                  : completed
                    ? "completed"
                    : "pending"
              }
              onChange={(event) => {
                const value = event.target.value;

                if (value === "all") {
                  onCompletedChange(undefined);
                } else if (value === "completed") {
                  onCompletedChange(true);
                } else {
                  onCompletedChange(false);
                }
              }}
              className="w-full rounded-lg border border-gray-300 px-4 py-2.5 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            >
              <option value="all">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="completed">Completed</option>
            </select>
          </div>

          {/* Priority */}
          <div>
            <label
              htmlFor="priority-filter"
              className="mb-2 block text-sm font-medium text-gray-700"
            >
              Priority
            </label>

            <select
              id="priority-filter"
              value={priority ?? "ALL"}
              onChange={(event) => {
                const value = event.target.value;

                if (value === "ALL") {
                  onPriorityChange(undefined);
                } else {
                  onPriorityChange(value as Priority);
                }
              }}
              className="w-full rounded-lg border border-gray-300 px-4 py-2.5 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            >
              <option value="ALL">All Priorities</option>
              <option value="LOW">Low</option>
              <option value="MEDIUM">Medium</option>
              <option value="HIGH">High</option>
            </select>
          </div>

          {/* Sort By */}
          <div>
            <label
              htmlFor="sort-filter"
              className="mb-2 block text-sm font-medium text-gray-700"
            >
              Sort By
            </label>

            <select
              id="sort-filter"
              value={currentSortValue}
              onChange={(event) => handleSortSelectChange(event.target.value)}
              className="w-full rounded-lg border border-gray-300 px-4 py-2.5 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            >
              <option value="createdAt_desc">Created: Newest First</option>
              <option value="createdAt_asc">Created: Oldest First</option>
              <option value="updatedAt_desc">Updated: Recently Updated</option>
              <option value="title_asc">Title: A to Z</option>
              <option value="title_desc">Title: Z to A</option>
              <option value="priority_desc">Priority: High to Low</option>
              <option value="priority_asc">Priority: Low to High</option>
            </select>
          </div>
        </div>
      </form>
    </div>
  );
};

export default TaskFilters;
