
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { CheckCircle, Copy, ExternalLink, BarChart3 } from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

interface TokenCreatedModalProps {
  isOpen: boolean;
  onClose: () => void;
  tokenAddress: string;
  tokenName: string;
  tokenTicker: string;
}

const TokenCreatedModal = ({ 
  isOpen, 
  onClose, 
  tokenAddress, 
  tokenName, 
  tokenTicker 
}: TokenCreatedModalProps) => {
  const navigate = useNavigate();

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success("Address copied to clipboard!");
    } catch (error) {
      toast.error("Failed to copy address");
    }
  };

  const openInExplorer = () => {
    window.open(`https://testnet.snowtrace.io/address/${tokenAddress}`, '_blank');
  };

  const goToDashboard = () => {
    onClose();
    navigate('/dashboard');
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent className="bg-avalanche-gray-dark border-avalanche-red max-w-md">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-white text-xl flex items-center space-x-3">
            <div className="bg-green-500 p-2 rounded-full">
              <CheckCircle className="h-6 w-6 text-white" />
            </div>
            <span>Token Created Successfully!</span>
          </AlertDialogTitle>
          <AlertDialogDescription className="text-gray-300 text-base leading-relaxed">
            Your meme coin <span className="text-avalanche-red font-semibold">{tokenName} ({tokenTicker})</span> has been deployed to Avalanche Fuji testnet.
          </AlertDialogDescription>
        </AlertDialogHeader>
        
        <div className="space-y-4 my-4">
          <div className="p-4 bg-black rounded-lg border border-avalanche-gray-medium">
            <p className="text-gray-400 text-sm mb-2">Contract Address:</p>
            <p className="text-white font-mono text-sm break-all">{tokenAddress}</p>
          </div>
          
          <div className="flex space-x-2">
            <Button
              onClick={() => copyToClipboard(tokenAddress)}
              variant="outline"
              size="sm"
              className="flex-1 border-avalanche-gray-medium text-gray-300 hover:bg-avalanche-gray-medium"
            >
              <Copy className="h-4 w-4 mr-2" />
              Copy Address
            </Button>
            
            <Button
              onClick={openInExplorer}
              variant="outline"
              size="sm"
              className="flex-1 border-avalanche-gray-medium text-gray-300 hover:bg-avalanche-gray-medium"
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              View on Explorer
            </Button>
          </div>
        </div>

        <AlertDialogFooter className="flex space-x-2">
          <Button
            onClick={goToDashboard}
            className="flex-1 bg-avalanche-red hover:bg-avalanche-red-dark text-white"
          >
            <BarChart3 className="h-4 w-4 mr-2" />
            View Dashboard
          </Button>
          <AlertDialogAction 
            onClick={onClose}
            className="flex-1 bg-gray-600 hover:bg-gray-700 text-white"
          >
            Stay Here
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default TokenCreatedModal;
