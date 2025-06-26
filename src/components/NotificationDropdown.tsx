
import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useNotifications, markNotificationAsRead } from "@/utils/notificationUtils";
import { Badge } from "@/components/ui/badge";

const NotificationDropdown = () => {
  const { notifications, unreadCount } = useNotifications();

  const handleNotificationClick = async (notificationId: string) => {
    await markNotificationAsRead(notificationId);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          size="icon" 
          className="text-white hover:bg-avalanche-gray-dark relative"
        >
          <Bell className="h-4 w-4" />
          {unreadCount > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-xs bg-avalanche-red"
            >
              {unreadCount > 9 ? '9+' : unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent 
        align="end" 
        className="w-80 bg-avalanche-gray-dark border-avalanche-gray-medium max-h-96"
      >
        <div className="p-3 border-b border-avalanche-gray-medium">
          <h3 className="text-white font-semibold">Notifications</h3>
          {notifications.length === 0 && (
            <p className="text-gray-400 text-sm mt-1">No notifications yet</p>
          )}
        </div>
        
        <ScrollArea className="max-h-80 scrollbar-hide">
          {notifications.map((notification) => (
            <DropdownMenuItem
              key={notification.id}
              className="text-white hover:bg-avalanche-gray-medium cursor-pointer p-4 flex flex-col items-start space-y-1"
              onClick={() => handleNotificationClick(notification.id)}
            >
              <div className="flex items-center justify-between w-full">
                <h4 className="font-medium text-sm">{notification.title}</h4>
                <div className="flex items-center space-x-2">
                  {!notification.read && (
                    <div className="w-2 h-2 bg-avalanche-red rounded-full"></div>
                  )}
                  <span className="text-xs text-gray-400">
                    {new Date(notification.created_at).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </span>
                </div>
              </div>
              <p className="text-gray-300 text-xs text-left">{notification.message}</p>
              {notification.token_name && (
                <div className="flex items-center space-x-2 mt-1">
                  <Badge 
                    variant="outline" 
                    className="text-xs border-avalanche-red text-avalanche-red"
                  >
                    {notification.token_ticker}
                  </Badge>
                </div>
              )}
            </DropdownMenuItem>
          ))}
        </ScrollArea>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default NotificationDropdown;
