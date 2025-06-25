
import { toast } from "sonner";

export interface NotificationData {
  title: string;
  message: string;
  type: 'token_created' | 'token_bought' | 'success' | 'error' | 'info';
}

export const createNotification = (data: NotificationData) => {
  // For now, we'll use toast notifications
  // Later, this can be extended to save to a notifications table
  
  const { title, message, type } = data;
  
  switch (type) {
    case 'token_created':
      toast.success(title, {
        description: message,
        duration: 5000,
      });
      break;
    case 'token_bought':
      toast.success(title, {
        description: message,
        duration: 5000,
      });
      break;
    case 'success':
      toast.success(title, {
        description: message,
        duration: 4000,
      });
      break;
    case 'error':
      toast.error(title, {
        description: message,
        duration: 6000,
      });
      break;
    case 'info':
      toast.info(title, {
        description: message,
        duration: 4000,
      });
      break;
    default:
      toast(title, {
        description: message,
        duration: 4000,
      });
  }
};

export const notifyTokenCreated = (tokenName: string, ticker: string, userAddress?: string) => {
  createNotification({
    title: 'Token Created Successfully! 🎉',
    message: `Your meme coin "${tokenName}" (${ticker}) has been successfully created on the blockchain.`,
    type: 'token_created'
  });

  // Trigger custom event for real-time notifications
  if (userAddress) {
    const event = new CustomEvent('tokenCreated', {
      detail: { tokenName, ticker, userAddress }
    });
    window.dispatchEvent(event);
  }
};

export const notifyTokenBought = (tokenName: string, amount: string, creatorAddress?: string) => {
  createNotification({
    title: 'Someone Bought Your Token! 💰',
    message: `A user just purchased ${amount} tokens of your "${tokenName}" coin.`,
    type: 'token_bought'
  });

  // Trigger custom event for real-time notifications
  if (creatorAddress) {
    const event = new CustomEvent('tokenBought', {
      detail: { tokenName, amount, creatorAddress }
    });
    window.dispatchEvent(event);
  }
};

// Simulate token purchase for demo purposes
export const simulateTokenPurchase = (tokenName: string, creatorAddress: string) => {
  const amounts = ['100', '500', '1000', '2500', '5000'];
  const randomAmount = amounts[Math.floor(Math.random() * amounts.length)];
  
  setTimeout(() => {
    notifyTokenBought(tokenName, randomAmount, creatorAddress);
  }, Math.random() * 30000 + 5000); // Random delay between 5-35 seconds
};
