import { CheckCircle2, Circle, Edit, Trash2 } from "lucide-react";

import type { Task } from "../types/task";

interface TaskCardProps {
  task: Task;
  onEdit: (task: Task) => void;
  onDelete: (taskId: number) => void;
  onToggleComplete?: (task: Task) => void;
  deleting: boolean;
  toggling?: boolean;
}

const TaskCard = ({
  task,
  onEdit,
  onDelete,
  onToggleComplete,
  deleting,
  toggling,
}: TaskCardProps) => {
  const priorityColor = {
    LOW: "bg-blue-50 text-blue-700 border-blue-200",
    MEDIUM: "bg-amber-50 text-amber-700 border-amber-200",
    HIGH: "bg-red-50 text-red-700 border-red-200",
  }[task.priority];

  return (
    <div
      className={`rounded-xl border bg-white p-5 shadow-sm transition-all duration-150 ${
        task.completed
          ? "border-gray-200 bg-gray-50/50"
          : "border-gray-200 hover:border-gray-300"
      }`}
    >
      {/* Task content */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          {onToggleComplete && (
            <button
              type="button"
              onClick={() => onToggleComplete(task)}
              disabled={toggling}
              className="mt-0.5 text-gray-400 hover:text-green-600 disabled:opacity-50 transition-colors"
              title={
                task.completed
                  ? "Mark as pending"
                  : "Mark as completed"
              }
              aria-label={
                task.completed
                  ? "Mark as pending"
                  : "Mark as completed"
              }
            >
              {task.completed ? (
                <CheckCircle2 size={20} className="text-green-600 fill-green-50" />
              ) : (
                <Circle size={20} />
              )}
            </button>
          )}

          <div>
            <h3
              className={`font-semibold text-gray-900 ${
                task.completed ? "line-through text-gray-500" : ""
              }`}
            >
              {task.title}
            </h3>

            {task.description && (
              <p
                className={`text-sm mt-1 whitespace-pre-line ${
                  task.completed ? "text-gray-400" : "text-gray-600"
                }`}
              >
                {task.description}
              </p>
            )}
          </div>
        </div>

        {/* Priority badge */}
        <span
          className={`text-xs font-medium rounded-full border px-2.5 py-1 ${priorityColor}`}
        >
          {task.priority}
        </span>
      </div>

      {/* Bottom section */}
      <div className="mt-4 flex items-center justify-between border-t border-gray-100 pt-3">
        {/* Status */}
        <button
          type="button"
          onClick={() => onToggleComplete && onToggleComplete(task)}
          disabled={toggling}
          className={`inline-flex items-center gap-1.5 text-xs font-medium rounded-md px-2.5 py-1 transition-colors ${
            task.completed
              ? "bg-green-50 text-green-700 hover:bg-green-100"
              : "bg-amber-50 text-amber-700 hover:bg-amber-100"
          }`}
          title="Click to toggle status"
        >
          <span
            className={`h-1.5 w-1.5 rounded-full ${
              task.completed ? "bg-green-600" : "bg-amber-600"
            }`}
          />
          {task.completed ? "Completed" : "Pending"}
        </button>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => onEdit(task)}
            className="flex items-center gap-1.5 rounded-lg border border-gray-300 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
          >
            <Edit size={15} />
            <span>Edit</span>
          </button>

          <button
            onClick={() => onDelete(task.id)}
            disabled={deleting}
            className="flex items-center gap-1.5 rounded-lg border border-red-200 px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60 transition-colors"
          >
            <Trash2 size={15} />
            <span>{deleting ? "Deleting..." : "Delete"}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default TaskCard;
