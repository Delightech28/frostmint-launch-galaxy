
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Chrome } from "lucide-react";

interface MetaMaskDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

const MetaMaskDialog = ({ isOpen, onClose }: MetaMaskDialogProps) => {
  const handleChromeDownload = () => {
    window.open('https://chrome.google.com/webstore/detail/metamask/nkbihfbeogaeaoehlefnkodbefgpgknn', '_blank');
    onClose();
  };

  const handleDirectDownload = () => {
    window.open('https://metamask.io/download/', '_blank');
    onClose();
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent className="bg-avalanche-gray-dark border-avalanche-red max-w-md">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-white text-xl flex items-center space-x-2">
            <div className="bg-avalanche-red p-2 rounded-full">
              <Chrome className="h-5 w-5 text-white" />
            </div>
            <span>MetaMask Required</span>
          </AlertDialogTitle>
          <AlertDialogDescription className="text-gray-300 text-base leading-relaxed">
            MetaMask is not installed. Please install MetaMask to connect your wallet and start launching on Avalanche.
          </AlertDialogDescription>
        </AlertDialogHeader>
        
        <div className="space-y-3 my-4">
          <div 
            onClick={handleChromeDownload}
            className="flex items-center space-x-3 p-4 border border-avalanche-gray-medium rounded-lg hover:bg-avalanche-gray-medium cursor-pointer transition-colors"
          >
            <Chrome className="h-6 w-6 text-white" />
            <div>
              <p className="text-white font-medium">Chrome Extension</p>
              <p className="text-gray-400 text-sm">Install from Chrome Web Store</p>
            </div>
          </div>
          
          <div 
            onClick={handleDirectDownload}
            className="flex items-center space-x-3 p-4 border border-avalanche-gray-medium rounded-lg hover:bg-avalanche-gray-medium cursor-pointer transition-colors"
          >
            <div className="w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center">
              <span className="text-white text-xs font-bold">M</span>
            </div>
            <div>
              <p className="text-white font-medium">MetaMask App</p>
              <p className="text-gray-400 text-sm">Download for mobile or desktop</p>
            </div>
          </div>
        </div>

        <AlertDialogFooter>
          <AlertDialogCancel 
            onClick={onClose}
            className="border-avalanche-gray-medium text-gray-300 hover:bg-avalanche-gray-medium"
          >
            Cancel
          </AlertDialogCancel>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default MetaMaskDialog;
