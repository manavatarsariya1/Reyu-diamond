import { AdminLog, type IAdminLog } from "../models/AdminLog.model.js";
import { SystemLog, type ISystemLog } from "../models/SystemLog.model.js";

class LogService {
    /**
     * Create a new Admin Log entry
     */
    async createAdminLog(data: Partial<IAdminLog>): Promise<IAdminLog> {
        const log = await AdminLog.create(data);
        return log;
    }

    /**
     * Get Admin Logs with pagination and filtering
     */
    async getAdminLogs(
        filter: any = {},
        page: number = 1,
        limit: number = 20
    ): Promise<{ logs: IAdminLog[]; total: number; pages: number }> {
        const skip = (page - 1) * limit;

        const logs = await AdminLog.find(filter)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .populate("adminId", "firstName lastName email role"); // Populating basic user info

        const total = await AdminLog.countDocuments(filter);

        return {
            logs,
            total,
            pages: Math.ceil(total / limit),
        };
    }

    /**
     * Create a new System Log entry
     */
    async createSystemLog(data: Partial<ISystemLog>): Promise<ISystemLog> {
        const log = await SystemLog.create(data);
        return log;
    }

    /**
     * Get System Logs with pagination and filtering
     */
    async getSystemLogs(
        filter: any = {},
        page: number = 1,
        limit: number = 20
    ): Promise<{ logs: ISystemLog[]; total: number; pages: number }> {
        const skip = (page - 1) * limit;

        const logs = await SystemLog.find(filter)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        const total = await SystemLog.countDocuments(filter);

        return {
            logs,
            total,
            pages: Math.ceil(total / limit),
        };
    }
    /**
     * Get System Log Statistics
     */
    async getSystemLogStats(startDate?: Date, endDate?: Date) {
        const filter: any = {};
        if (startDate || endDate) {
            filter.createdAt = {};
            if (startDate) filter.createdAt.$gte = startDate;
            if (endDate) filter.createdAt.$lte = endDate;
        }

        const stats = await SystemLog.aggregate([
            { $match: filter },
            {
                $group: {
                    _id: { severity: "$severity", eventType: "$eventType" },
                    count: { $sum: 1 }
                }
            },
            {
                $group: {
                    _id: "$_id.severity",
                    events: {
                        $push: {
                            eventType: "$_id.eventType",
                            count: "$count"
                        }
                    },
                    total: { $sum: "$count" }
                }
            }
        ]);

        return stats.reduce((acc: any, curr) => {
            acc[curr._id] = {
                total: curr.total,
                events: curr.events.reduce((eAcc: any, e: any) => {
                    eAcc[e.eventType] = e.count;
                    return eAcc;
                }, {})
            };
            return acc;
        }, {});
    }
}

export const logService = new LogService();
