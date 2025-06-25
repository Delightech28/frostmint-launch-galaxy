
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
  user_id?: string;
}

const NotificationDropdown = () => {
  const { address, isConnected } = useWallet();
  const queryClient = useQueryClient();
  const [isOpen, setIsOpen] = useState(false);
  const [localNotifications, setLocalNotifications] = useState<Notification[]>([]);

  // Listen for new notifications from localStorage (for cross-tab communication)
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'new-notification' && e.newValue) {
        const notification = JSON.parse(e.newValue);
        if (notification.user_id === address) {
          setLocalNotifications(prev => [notification, ...prev]);
          // Remove from localStorage after processing
          localStorage.removeItem('new-notification');
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [address]);

  // Check for notifications in localStorage on mount
  useEffect(() => {
    if (address) {
      const stored = localStorage.getItem(`notifications-${address}`);
      if (stored) {
        setLocalNotifications(JSON.parse(stored));
      }
    }
  }, [address]);

  // Save notifications to localStorage when they change
  useEffect(() => {
    if (address && localNotifications.length > 0) {
      localStorage.setItem(`notifications-${address}`, JSON.stringify(localNotifications));
    }
  }, [localNotifications, address]);

  // Real-time notifications (simulated with localStorage for now)
  useEffect(() => {
    if (!address) return;

    // Listen for token creation events
    const tokenCreatedListener = (event: CustomEvent) => {
      const { tokenName, ticker, userAddress } = event.detail;
      if (userAddress === address) {
        const notification: Notification = {
          id: Date.now().toString(),
          title: 'Token Created Successfully! 🎉',
          message: `Your meme coin "${tokenName}" (${ticker}) has been successfully created on the blockchain.`,
          type: 'token_created',
          read: false,
          created_at: new Date().toISOString(),
          user_id: address
        };
        
        setLocalNotifications(prev => [notification, ...prev]);
      }
    };

    // Listen for token bought events (simulated)
    const tokenBoughtListener = (event: CustomEvent) => {
      const { tokenName, amount, creatorAddress } = event.detail;
      if (creatorAddress === address) {
        const notification: Notification = {
          id: Date.now().toString(),
          title: 'Someone Bought Your Token! 💰',
          message: `A user just purchased ${amount} tokens of your "${tokenName}" coin.`,
          type: 'token_bought',
          read: false,
          created_at: new Date().toISOString(),
          user_id: address
        };
        
        setLocalNotifications(prev => [notification, ...prev]);
      }
    };

    window.addEventListener('tokenCreated', tokenCreatedListener as EventListener);
    window.addEventListener('tokenBought', tokenBoughtListener as EventListener);

    return () => {
      window.removeEventListener('tokenCreated', tokenCreatedListener as EventListener);
      window.removeEventListener('tokenBought', tokenBoughtListener as EventListener);
    };
  }, [address]);

  const notifications = localNotifications;
  const unreadCount = notifications.filter(n => !n.read).length;

  const markAllAsRead = () => {
    setLocalNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const markAsRead = (id: string) => {
    setLocalNotifications(prev => prev.map(n => 
      n.id === id ? { ...n, read: true } : n
    ));
  };

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
          className="relative text-white hover:bg-avalanche-gray-dark hover:text-white"
        >
          <Bell className="h-4 w-4" />
          {unreadCount > 0 && (
            <Badge 
              className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-avalanche-red text-xs p-0 flex items-center justify-center border-0"
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
                onClick={markAllAsRead}
                className="text-avalanche-red hover:bg-avalanche-gray-medium hover:text-avalanche-red h-auto p-1"
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
                onClick={() => markAsRead(notification.id)}
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
                className="w-full text-avalanche-red hover:bg-avalanche-gray-medium hover:text-avalanche-red"
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
