import { X } from "lucide-react";

import type { Priority } from "../types/task";

interface CreateTaskFormProps {
  title: string;
  description: string;
  priority: Priority;

  creating: boolean;
  error: string;

  onTitleChange: (value: string) => void;
  onDescriptionChange: (value: string) => void;
  onPriorityChange: (value: Priority) => void;

  onSubmit: () => void;
  onClose: () => void;
}

const CreateTaskForm = ({
  title,
  description,
  priority,
  creating,
  error,
  onTitleChange,
  onDescriptionChange,
  onPriorityChange,
  onSubmit,
  onClose,
}: CreateTaskFormProps) => {
  return (
    <div className="mb-6 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <h3 className="text-lg font-semibold text-gray-900">Create Task</h3>

        <button
          type="button"
          onClick={onClose}
          className="rounded-lg p-2 text-gray-500 hover:bg-gray-100"
        >
          <X size={20} />
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="mb-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          {error}
        </div>
      )}

      <div className="space-y-5">
        {/* Title */}
        <div>
          <label
            htmlFor="task-title"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Title
          </label>

          <input
            id="task-title"
            type="text"
            value={title}
            onChange={(event) => onTitleChange(event.target.value)}
            placeholder="Enter task title"
            className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          />
        </div>

        {/* Description */}
        <div>
          <label
            htmlFor="task-description"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Description
          </label>

          <textarea
            id="task-description"
            value={description}
            onChange={(event) => onDescriptionChange(event.target.value)}
            placeholder="Enter task description"
            rows={4}
            className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none resize-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          />
        </div>

        {/* Priority */}
        <div>
          <label
            htmlFor="task-priority"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Priority
          </label>

          <select
            id="task-priority"
            value={priority}
            onChange={(event) =>
              onPriorityChange(event.target.value as Priority)
            }
            className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          >
            <option value="LOW">Low</option>
            <option value="MEDIUM">Medium</option>
            <option value="HIGH">High</option>
          </select>
        </div>

        {/* Submit */}
        <button
          type="button"
          onClick={onSubmit}
          disabled={creating}
          className="w-full rounded-lg bg-blue-600 px-4 py-3 font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {creating ? "Creating..." : "Create Task"}
        </button>
      </div>
    </div>
  );
};

export default CreateTaskForm;
