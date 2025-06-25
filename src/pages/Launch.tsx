
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
import { CheckCircle2, XCircle, Upload, Image as ImageIcon } from "lucide-react";
import { useWallet } from "@/contexts/WalletContext";
import { createMemeCoin } from "@/utils/contractUtils";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { notifyTokenCreated, simulateTokenPurchase } from "@/utils/notificationUtils";

const LaunchToken = () => {
  const { isConnected, address } = useWallet();
  const [tokenName, setTokenName] = useState("");
  const [ticker, setTicker] = useState("");
  const [initialSupply, setInitialSupply] = useState("");
  const [description, setDescription] = useState("");
  const [memeImage, setMemeImage] = useState<File | null>(null);
  const [memeImagePreview, setMemeImagePreview] = useState<string>("");
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState("");
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const queryClient = useQueryClient();

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setMemeImage(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setMemeImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

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
        // Use the new notification system with user address
        notifyTokenCreated(tokenName.trim(), ticker.trim(), address);
        
        // Simulate future token purchases for demo
        simulateTokenPurchase(tokenName.trim(), address);
        
        // Show success modal
        setShowSuccessModal(true);
        
        // Reset form
        setTokenName("");
        setTicker("");
        setInitialSupply("");
        setDescription("");
        setMemeImage(null);
        setMemeImagePreview("");
        
        // Refresh tokens query
        queryClient.invalidateQueries({ queryKey: ['userTokens'] });
        queryClient.invalidateQueries({ queryKey: ['tokens'] });
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

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Form Section */}
          <div className="space-y-6">
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

              <div>
                <Label htmlFor="memeImage" className="text-white">
                  Meme Image (Optional)
                </Label>
                <div className="mt-2">
                  <Input
                    type="file"
                    id="memeImage"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="bg-avalanche-gray-dark border-avalanche-gray-medium text-white file:bg-avalanche-red file:text-white file:border-0 file:rounded file:px-3 file:py-1"
                  />
                  {!memeImagePreview && (
                    <div className="mt-2 border-2 border-dashed border-avalanche-gray-medium rounded-lg p-4 text-center">
                      <Upload className="mx-auto h-8 w-8 text-gray-400 mb-2" />
                      <p className="text-gray-400 text-sm">Upload your meme image</p>
                    </div>
                  )}
                </div>
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
          </div>

          {/* Preview Section */}
          <div className="space-y-6">
            <div className="bg-avalanche-gray-dark border border-avalanche-gray-medium rounded-lg p-6">
              <h3 className="text-white text-lg font-semibold mb-4 flex items-center">
                <ImageIcon className="mr-2 h-5 w-5" />
                Meme Coin Preview
              </h3>
              
              <div className="space-y-4">
                {memeImagePreview && (
                  <div className="aspect-square rounded-lg overflow-hidden bg-avalanche-gray-medium">
                    <img 
                      src={memeImagePreview} 
                      alt="Meme preview" 
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Name:</span>
                    <span className="text-white font-semibold">
                      {tokenName || "Your Token Name"}
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Symbol:</span>
                    <span className="text-white font-semibold">
                      {ticker || "SYMBOL"}
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Supply:</span>
                    <span className="text-white font-semibold">
                      {initialSupply ? Number(initialSupply).toLocaleString() : "0"}
                    </span>
                  </div>
                  
                  {description && (
                    <div className="mt-3 p-3 bg-black rounded border border-avalanche-gray-medium">
                      <span className="text-gray-400 text-sm block mb-1">Description:</span>
                      <span className="text-white text-sm">{description}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

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
