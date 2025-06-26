import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { CheckCircle2, XCircle } from "lucide-react";
import { useWallet } from "@/contexts/WalletContext";
import { createMemeCoin } from "@/utils/contractUtils";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { notifyTokenCreated } from "@/utils/notificationUtils";

const LaunchToken = () => {
  const { isConnected, address } = useWallet();
  const [tokenName, setTokenName] = useState("");
  const [ticker, setTicker] = useState("");
  const [initialSupply, setInitialSupply] = useState("");
  const [description, setDescription] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState("");
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const queryClient = useQueryClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isConnected || !address) {
      toast.error("Please connect your wallet first");
      return;
    }

    if (!tokenName.trim() || !ticker.trim() || !initialSupply.trim()) {
      toast.error("Please fill in all required fields");
      return;
    }

    setIsCreating(true);
    setError("");

    try {
      console.log('Starting token creation process...');
      
      const tx = await createMemeCoin(
        tokenName.trim(),
        ticker.trim(),
        initialSupply.trim(),
        address,
        description.trim() || undefined
      );

      console.log('Transaction sent:', tx.hash);
      toast.success("Transaction submitted! Waiting for confirmation...");

      const receipt = await tx.wait();
      console.log('Transaction confirmed:', receipt);

      if (receipt.status === 1) {
        // Use the new notification system
        notifyTokenCreated(tokenName.trim(), ticker.trim());
        
        // Show success modal
        setShowSuccessModal(true);
        
        // Reset form
        setTokenName("");
        setTicker("");
        setInitialSupply("");
        setDescription("");
        
        // Refresh tokens query
        queryClient.invalidateQueries({ queryKey: ['userTokens'] });
      } else {
        throw new Error('Transaction failed');
      }
    } catch (error: any) {
      console.error('Token creation error:', error);
      let errorMessage = "Failed to create token. Please try again.";
      
      if (error.message?.includes('User denied transaction signature')) {
        errorMessage = "Transaction was cancelled by user.";
      } else if (error.message?.includes('insufficient funds')) {
        errorMessage = "Insufficient AVAX balance for transaction.";
      } else if (error.message?.includes('already exists')) {
        errorMessage = error.message;
      }
      
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="min-h-screen bg-black">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Launch Your Meme Coin</h1>
          <p className="text-gray-300">
            Create and deploy your own meme coin on the Avalanche network.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <Label htmlFor="tokenName" className="text-white">
              Token Name
            </Label>
            <Input
              type="text"
              id="tokenName"
              placeholder="DogeMoon"
              value={tokenName}
              onChange={(e) => setTokenName(e.target.value)}
              className="bg-avalanche-gray-dark border-avalanche-gray-medium text-white"
            />
          </div>
          <div>
            <Label htmlFor="ticker" className="text-white">
              Ticker Symbol
            </Label>
            <Input
              type="text"
              id="ticker"
              placeholder="DMOON"
              value={ticker}
              onChange={(e) => setTicker(e.target.value)}
              className="bg-avalanche-gray-dark border-avalanche-gray-medium text-white"
            />
          </div>
          <div>
            <Label htmlFor="initialSupply" className="text-white">
              Initial Supply
            </Label>
            <Input
              type="number"
              id="initialSupply"
              placeholder="1000000"
              value={initialSupply}
              onChange={(e) => setInitialSupply(e.target.value)}
              className="bg-avalanche-gray-dark border-avalanche-gray-medium text-white"
            />
          </div>
          <div>
            <Label htmlFor="description" className="text-white">
              Description (Optional)
            </Label>
            <Textarea
              id="description"
              placeholder="The next big meme coin!"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="bg-avalanche-gray-dark border-avalanche-gray-medium text-white resize-none"
            />
          </div>

          {error && (
            <div className="text-red-500 flex items-center space-x-2">
              <XCircle className="h-4 w-4" />
              <span>{error}</span>
            </div>
          )}

          <Button
            type="submit"
            disabled={isCreating}
            className="bg-avalanche-red hover:bg-avalanche-red-dark text-white w-full"
          >
            {isCreating ? "Creating..." : "Launch Token"}
          </Button>
        </form>

        {/* Success Modal */}
        <Dialog open={showSuccessModal} onOpenChange={() => setShowSuccessModal(false)}>
          <DialogContent className="bg-avalanche-gray-dark border-avalanche-gray-medium text-white">
            <DialogHeader>
              <DialogTitle className="text-lg flex items-center space-x-2">
                <CheckCircle2 className="text-green-500 h-5 w-5" />
                <span>Token Created Successfully!</span>
              </DialogTitle>
              <DialogDescription>
                Your meme coin has been successfully created and deployed on the Avalanche network.
              </DialogDescription>
            </DialogHeader>
            <Button onClick={() => setShowSuccessModal(false)} className="bg-avalanche-red hover:bg-avalanche-red-dark text-white w-full">
              Close
            </Button>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default LaunchToken;
