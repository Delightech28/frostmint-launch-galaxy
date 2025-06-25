
import { useState, useEffect } from "react";
import { Bell, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { useWallet } from "@/contexts/WalletContext";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'token_created' | 'token_bought';
  read: boolean;
  created_at: string;
}

const NotificationDropdown = () => {
  const { address, isConnected } = useWallet();
  const queryClient = useQueryClient();
  const [isOpen, setIsOpen] = useState(false);

  // Mock notifications for now (since we haven't created the notifications table yet)
  const mockNotifications: Notification[] = [
    {
      id: '1',
      title: 'Token Created Successfully! 🎉',
      message: 'Your meme coin "DogeMoon" has been successfully created on the blockchain.',
      type: 'token_created',
      read: false,
      created_at: new Date().toISOString()
    },
    {
      id: '2',
      title: 'Someone Bought Your Token! 💰',
      message: 'A user just purchased 1000 tokens of your "MemeKing" coin.',
      type: 'token_bought',
      read: false,
      created_at: new Date(Date.now() - 3600000).toISOString()
    }
  ];

  const notifications = mockNotifications; // Replace with real query later
  const unreadCount = notifications.filter(n => !n.read).length;

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'token_created':
        return '🎉';
      case 'token_bought':
        return '💰';
      default:
        return '📢';
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  if (!isConnected) return null;

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          size="icon" 
          className="relative text-white hover:bg-avalanche-gray-dark"
        >
          <Bell className="h-4 w-4" />
          {unreadCount > 0 && (
            <Badge 
              className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-avalanche-red text-xs p-0 flex items-center justify-center"
            >
              {unreadCount > 9 ? '9+' : unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent 
        align="end" 
        className="w-80 bg-avalanche-gray-dark border-avalanche-gray-medium max-h-96 overflow-y-auto"
      >
        <div className="p-3 border-b border-avalanche-gray-medium">
          <div className="flex items-center justify-between">
            <h3 className="text-white font-semibold">Notifications</h3>
            {unreadCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                className="text-avalanche-red hover:bg-avalanche-gray-medium h-auto p-1"
              >
                <Check className="h-3 w-3 mr-1" />
                Mark all read
              </Button>
            )}
          </div>
        </div>
        
        {notifications.length === 0 ? (
          <div className="p-4 text-center text-gray-400">
            <Bell className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>No notifications yet</p>
          </div>
        ) : (
          <div className="max-h-80 overflow-y-auto">
            {notifications.map((notification) => (
              <DropdownMenuItem
                key={notification.id}
                className="p-3 border-b border-avalanche-gray-medium last:border-b-0 cursor-pointer hover:bg-avalanche-gray-medium focus:bg-avalanche-gray-medium"
              >
                <div className="flex items-start space-x-3 w-full">
                  <div className="text-lg flex-shrink-0">
                    {getNotificationIcon(notification.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-white font-medium text-sm truncate">
                        {notification.title}
                      </p>
                      {!notification.read && (
                        <div className="w-2 h-2 bg-avalanche-red rounded-full flex-shrink-0 ml-2" />
                      )}
                    </div>
                    <p className="text-gray-300 text-xs leading-relaxed">
                      {notification.message}
                    </p>
                    <p className="text-gray-500 text-xs mt-1">
                      {formatTimeAgo(notification.created_at)}
                    </p>
                  </div>
                </div>
              </DropdownMenuItem>
            ))}
          </div>
        )}
        
        {notifications.length > 0 && (
          <>
            <DropdownMenuSeparator className="bg-avalanche-gray-medium" />
            <div className="p-2">
              <Button
                variant="ghost"
                size="sm"
                className="w-full text-avalanche-red hover:bg-avalanche-gray-medium"
              >
                View All Notifications
              </Button>
            </div>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default NotificationDropdown;
