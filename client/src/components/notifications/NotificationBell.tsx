import React, { useEffect } from "react";
import { Bell, Loader2, Info, AlertTriangle, CheckCircle, XCircle } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import type { RootState, AppDispatch } from "@/app/store";
import {
    fetchNotificationsStart,
    markReadRequest,
    markAllReadRequest,
    addNotification,
} from "@/features/notification/notificationSlice";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { socketService } from "@/utils/socket";
import { formatDistanceToNow } from "date-fns";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import type { Notification as NotificationType } from "@/types/notification";
import { Link } from "react-router-dom";
import { onMessageListener } from "@/utils/firebase";

const NotificationBell: React.FC = () => {
    const dispatch = useDispatch<AppDispatch>();
    const { notifications, unreadCount, loading } = useSelector((state: RootState) => state.notification);
    const { user } = useSelector((state: RootState) => state.auth);

    useEffect(() => {
        if (user) {
            dispatch(fetchNotificationsStart({ page: 1, limit: 10 }));

            // Socket listener for real-time notifications
            socketService.onNewNotification((notification: NotificationType) => {
                dispatch(addNotification(notification));
                toast(notification.title, {
                    description: notification.body,
                    icon: getNotificationIcon(notification.type),
                });
            });

            // FCM Foreground listener
            onMessageListener()
                .then((payload: any) => {
                    console.log("FCM Payload:", payload);
                    // Socket already handles the real-time update for data, 
                    // but we can show another toast or refresh if needed.
                    if (payload.notification) {
                        toast(payload.notification.title, {
                            description: payload.notification.body,
                            icon: <Bell className="w-4 h-4" />,
                        });
                    }
                })
                .catch((err) => console.log("failed: ", err));

            return () => {
                socketService.offNewNotification();
            };
        }
    }, [dispatch, user]);

    const getNotificationIcon = (type: string) => {
        switch (type) {
            case "NEW_BID":
                return <Info className="w-4 h-4 text-blue-500" />;
            case "BID_SUCCESS":
            case "PAYMENT_INITIATED":
            case "ESCROW_RELEASED":
            case "DEAL_CREATED":
            case "KYC_APPROVED":
                return <CheckCircle className="w-4 h-4 text-emerald-500" />;
            case "INVENTORY_MATCH":
                return <Info className="w-4 h-4 text-blue-500" />;
            case "DISPUTE_RAISED":
            case "DEAL_CANCELLED":
            case "KYC_REJECTED":
                return <AlertTriangle className="w-4 h-4 text-amber-500" />;
            case "SYSTEM_LOG":
                return <XCircle className="w-4 h-4 text-red-500" />;
            default:
                return <Bell className="w-4 h-4 text-gray-500" />;
        }
    };

    const handleMarkAllAsRead = () => {
        dispatch(markAllReadRequest());
    };

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="relative">
                    <Bell className="h-5 w-5" />
                    {unreadCount > 0 && (
                        <Badge
                            variant="destructive"
                            className="absolute -top-1 -right-1 px-1.5 py-0.5 text-[10px] min-w-[18px] h-[18px] flex items-center justify-center rounded-full"
                        >
                            {unreadCount > 9 ? "9+" : unreadCount}
                        </Badge>
                    )}
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-80 p-0" align="end">
                <DropdownMenuLabel className="p-0 font-normal">
                    <div className="flex items-center justify-between p-4 border-b">
                        <h3 className="font-semibold text-sm">Notifications</h3>
                        {unreadCount > 0 && (
                            <Button
                                variant="ghost"
                                size="sm"
                                className="h-auto p-0 text-xs text-blue-600 hover:text-blue-800 font-medium"
                                onClick={handleMarkAllAsRead}
                            >
                                Mark all as read
                            </Button>
                        )}
                    </div>
                </DropdownMenuLabel>
                <ScrollArea className="h-[400px]">
                    {loading && notifications.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-10 space-y-2">
                            <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
                            <p className="text-xs text-gray-500">Loading notifications...</p>
                        </div>
                    ) : notifications.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-20 px-4 space-y-4">
                            <div className="p-3 bg-gray-50 rounded-full">
                                <Bell className="h-10 w-10 text-gray-300" />
                            </div>
                            <div className="text-center">
                                <p className="text-sm font-semibold text-gray-900">No notifications yet</p>
                                <p className="text-xs text-gray-500 mt-1 max-w-[200px] mx-auto">
                                    We'll notify you when you receive new bids or deals.
                                </p>
                            </div>
                        </div>
                    ) : (
                        <div className="flex flex-col">
                            {notifications.map((notif) => (
                                <DropdownMenuItem
                                    key={notif._id}
                                    className={cn(
                                        "flex flex-col items-start p-4 cursor-pointer border-b last:border-0 focus:bg-gray-50",
                                        !notif.isRead && "bg-blue-50/50"
                                    )}
                                    onSelect={(e) => {
                                        e.preventDefault();
                                        if (!notif.isRead) dispatch(markReadRequest(notif._id));
                                    }}
                                >
                                    <div className="flex items-start gap-3 w-full">
                                        <div className="mt-1 flex-shrink-0">{getNotificationIcon(notif.type)}</div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-semibold text-gray-900 truncate pr-4">{notif.title}</p>
                                            <p className="text-xs text-gray-600 line-clamp-2 mt-0.5 leading-relaxed">{notif.body}</p>
                                            <p className="text-[10px] text-gray-400 mt-1 font-medium">
                                                {formatDistanceToNow(new Date(notif.createdAt), { addSuffix: true })}
                                            </p>
                                        </div>
                                        {!notif.isRead && (
                                            <div
                                                className="h-2 w-2 rounded-full bg-blue-600 flex-shrink-0 mt-2"
                                                title="Unread"
                                            />
                                        )}
                                    </div>
                                </DropdownMenuItem>
                            ))}
                        </div>
                    )}
                </ScrollArea>
                <div className="p-2 border-t text-center">
                    <Link to="/notifications" className="block w-full">
                        <Button variant="ghost" size="sm" className="w-full text-xs text-gray-500 hover:text-gray-900">
                            View all notifications
                        </Button>
                    </Link>
                </div>
            </DropdownMenuContent>
        </DropdownMenu>
    );
};

export default NotificationBell;
