import prisma from "../lib/prisma.js";
import { createTaskSchema, updateTaskSchema, getTasksQuerySchema, } from "../types/task.js";
export const createTask = async (req, res) => {
    try {
        if (!req.userId) {
            return res.status(401).json({
                message: "Not authorized",
            });
        }
        const validationResult = createTaskSchema.safeParse(req.body);
        if (!validationResult.success) {
            return res.status(400).json({
                message: "Validation failed",
                errors: validationResult.error.flatten().fieldErrors,
            });
        }
        const { title, description, priority } = validationResult.data;
        const task = await prisma.task.create({
            data: {
                title,
                description,
                priority,
                userId: req.userId,
            },
        });
        return res.status(201).json({
            message: "Task created successfully",
            task,
        });
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({
            message: "Something went wrong",
        });
    }
};
// export const getTasks = async (req: Request, res: Response) => {
//   try {
//     if (!req.userId) {
//       return res.status(401).json({
//         message: "Not authorized",
//       });
//     }
//     const tasks = await prisma.task.findMany({
//       where: {
//         userId: req.userId,
//       },
//       orderBy: {
//         createdAt: "desc",
//       },
//     });
//     return res.status(200).json({
//       tasks,
//     });
//   } catch (error) {
//     console.error(error);
//     return res.status(500).json({
//       message: "Something went wrong",
//     });
//   }
// };
export const getTasks = async (req, res) => {
    try {
        // 1. Make sure the user is authenticated
        if (!req.userId) {
            return res.status(401).json({
                message: "Not authorized",
            });
        }
        // 2. Validate query parameters
        const validationResult = getTasksQuerySchema.safeParse(req.query);
        if (!validationResult.success) {
            return res.status(400).json({
                message: "Invalid query parameters",
                errors: validationResult.error.flatten().fieldErrors,
            });
        }
        const { search, completed, priority, sortBy, order, page, limit } = validationResult.data;
        // 3. Build the WHERE condition
        const where = {
            userId: req.userId,
            ...(search
                ? {
                    OR: [
                        {
                            title: {
                                contains: search,
                                mode: "insensitive",
                            },
                        },
                        {
                            description: {
                                contains: search,
                                mode: "insensitive",
                            },
                        },
                    ],
                }
                : {}),
            ...(completed !== undefined
                ? {
                    completed,
                }
                : {}),
            ...(priority !== undefined
                ? {
                    priority,
                }
                : {}),
        };
        // 4. Calculate pagination
        const skip = (page - 1) * limit;
        // 5. Get tasks and total count
        const [tasks, totalTasks] = await prisma.$transaction([
            prisma.task.findMany({
                where,
                orderBy: {
                    [sortBy]: order,
                },
                skip,
                take: limit,
            }),
            prisma.task.count({
                where,
            }),
        ]);
        // 6. Calculate pagination information
        const totalPages = Math.ceil(totalTasks / limit);
        return res.status(200).json({
            tasks,
            pagination: {
                page,
                limit,
                totalTasks,
                totalPages,
                hasNextPage: page < totalPages,
                hasPreviousPage: page > 1,
            },
        });
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({
            message: "Something went wrong",
        });
    }
};
export const getTask = async (req, res) => {
    try {
        if (!req.userId) {
            return res.status(401).json({
                message: "Not authorized",
            });
        }
        const taskId = Number(req.params.id);
        if (!Number.isInteger(taskId) || taskId <= 0) {
            return res.status(400).json({
                message: "Invalid task ID",
            });
        }
        const task = await prisma.task.findUnique({
            where: {
                id: taskId,
            },
        });
        if (!task) {
            return res.status(404).json({
                message: "Task not found",
            });
        }
        if (task.userId !== req.userId) {
            return res.status(403).json({
                message: "You do not have permission to access this task",
            });
        }
        return res.status(200).json({
            task,
        });
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({
            message: "Something went wrong",
        });
    }
};
export const updateTask = async (req, res) => {
    try {
        if (!req.userId) {
            return res.status(401).json({
                message: "Not authorized",
            });
        }
        const taskId = Number(req.params.id);
        if (!Number.isInteger(taskId) || taskId <= 0) {
            return res.status(400).json({
                message: "Invalid task ID",
            });
        }
        const task = await prisma.task.findUnique({
            where: {
                id: taskId,
            },
        });
        if (!task) {
            return res.status(404).json({
                message: "Task not found",
            });
        }
        if (task.userId !== req.userId) {
            return res.status(403).json({
                message: "You do not have permission to update this task",
            });
        }
        const validationResult = updateTaskSchema.safeParse(req.body);
        if (!validationResult.success) {
            return res.status(400).json({
                message: "Validation failed",
                errors: validationResult.error.flatten().fieldErrors,
            });
        }
        const { title, description, priority, completed } = validationResult.data;
        const updateData = {};
        if (title !== undefined) {
            updateData.title = title;
        }
        if (description !== undefined) {
            updateData.description = description;
        }
        if (priority !== undefined) {
            updateData.priority = priority;
        }
        if (completed !== undefined) {
            updateData.completed = completed;
        }
        const updatedTask = await prisma.task.update({
            where: {
                id: taskId,
            },
            data: updateData,
        });
        return res.status(200).json({
            message: "Task updated successfully",
            task: updatedTask,
        });
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({
            message: "Something went wrong",
        });
    }
};
export const deleteTask = async (req, res) => {
    try {
        // 1. Make sure the user is authenticated
        if (!req.userId) {
            return res.status(401).json({
                message: "Not authorized",
            });
        }
        // 2. Get task ID from URL
        const taskId = Number(req.params.id);
        // 3. Validate task ID
        if (!Number.isInteger(taskId) || taskId <= 0) {
            return res.status(400).json({
                message: "Invalid task ID",
            });
        }
        // 4. Find the task
        const task = await prisma.task.findUnique({
            where: {
                id: taskId,
            },
        });
        // 5. Check if task exists
        if (!task) {
            return res.status(404).json({
                message: "Task not found",
            });
        }
        // 6. Check ownership
        if (task.userId !== req.userId) {
            return res.status(403).json({
                message: "You do not have permission to delete this task",
            });
        }
        // 7. Delete the task
        await prisma.task.delete({
            where: {
                id: taskId,
            },
        });
        // 8. Return response
        return res.status(200).json({
            message: "Task deleted successfully",
        });
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({
            message: "Something went wrong",
        });
    }
};
