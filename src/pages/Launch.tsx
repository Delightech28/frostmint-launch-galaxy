import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useWallet } from "@/contexts/WalletContext";
import { createMemeCoin, getTokenAddressFromReceipt } from "@/utils/contractUtils";
import TokenCreatedModal from "@/components/TokenCreatedModal";

const Launch = () => {
  const { isConnected, address } = useWallet();
  const [isCreating, setIsCreating] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [createdTokenAddress, setCreatedTokenAddress] = useState("");
  
  const [tokenData, setTokenData] = useState({
    name: "",
    ticker: "",
    supply: "",
    description: "",
  });

  const [nftData, setNftData] = useState({
    name: "",
    description: "",
    quantity: "",
    image: null as File | null,
  });

  const handleTickerChange = (value: string) => {
    // Auto-format ticker: 3-6 characters, uppercase, letters only
    const formatted = value.replace(/[^A-Za-z]/g, '').toUpperCase().slice(0, 6);
    setTokenData({...tokenData, ticker: formatted});
  };

  const isValidTicker = (ticker: string) => {
    return ticker.length >= 3 && ticker.length <= 6;
  };

  const handleCreateToken = async () => {
    if (!isConnected || !address) {
      toast.error("Please connect your wallet first");
      return;
    }

    if (!tokenData.name || !tokenData.ticker || !tokenData.supply) {
      toast.error("Please fill in all required fields");
      return;
    }

    if (!isValidTicker(tokenData.ticker)) {
      toast.error("Ticker must be 3-6 characters");
      return;
    }

    try {
      setIsCreating(true);
      toast.info("Creating your meme coin...");
      
      const tx = await createMemeCoin(
        tokenData.name,
        tokenData.ticker,
        tokenData.supply,
        address,
        tokenData.description
      );
      
      toast.info("Transaction submitted. Waiting for confirmation...");
      const receipt = await tx.wait();
      
      const tokenAddress = await getTokenAddressFromReceipt(
        receipt,
        tokenData.name,
        tokenData.ticker,
        address,
        tokenData.supply,
        tokenData.description
      );
      
      if (tokenAddress) {
        setCreatedTokenAddress(tokenAddress);
        setShowSuccessModal(true);
        toast.success("Token created successfully!");
        // Reset form
        setTokenData({ name: "", ticker: "", supply: "", description: "" });
      } else {
        toast.error("Token created but couldn't retrieve address. Check the explorer for your transaction.");
      }
    } catch (error: any) {
      console.error("Error creating token:", error);
      if (error.code === 4001) {
        toast.error("Transaction rejected by user");
      } else if (error.code === -32603) {
        toast.error("Insufficient funds for minting fee (0.01 AVAX required)");
      } else if (error.message && error.message.includes('already exists')) {
        toast.error(error.message);
      } else {
        toast.error("Failed to create token. Please try again.");
      }
    } finally {
      setIsCreating(false);
    }
  };

  const handleLaunchToken = (type: string) => {
    toast.success(`${type} launch initiated! (Demo mode)`);
  };

  return (
    <div className="min-h-screen bg-black">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Launch Your Project</h1>
          <p className="text-gray-300">
            Create meme coins or NFT collections on Avalanche in seconds
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Launch Form */}
          <div>
            <Tabs defaultValue="fun-coin" className="w-full">
              <TabsList className="grid w-full grid-cols-3 bg-avalanche-gray-dark">
                <TabsTrigger value="fun-coin" className="data-[state=active]:bg-avalanche-red">
                  Fun Coin
                </TabsTrigger>
                <TabsTrigger value="trading-coin" className="data-[state=active]:bg-avalanche-red">
                  Trading Coin
                </TabsTrigger>
                <TabsTrigger value="nft" className="data-[state=active]:bg-avalanche-red">
                  NFT Collection
                </TabsTrigger>
              </TabsList>

              <TabsContent value="fun-coin" className="space-y-4 mt-6">
                <Card className="bg-avalanche-gray-dark border-avalanche-gray-medium">
                  <CardHeader>
                    <CardTitle className="text-white">Fun Coin Details</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="fun-name" className="text-gray-300">Token Name *</Label>
                      <Input
                        id="fun-name"
                        placeholder="e.g., DogeMoon"
                        value={tokenData.name}
                        onChange={(e) => setTokenData({...tokenData, name: e.target.value})}
                        className="bg-black border-avalanche-gray-medium text-white"
                        maxLength={20}
                      />
                    </div>
                    <div>
                      <Label htmlFor="fun-ticker" className="text-gray-300">
                        Ticker Symbol * <span className="text-xs text-gray-400">(3-6 letters only)</span>
                      </Label>
                      <Input
                        id="fun-ticker"
                        placeholder="e.g., DMOON"
                        value={tokenData.ticker}
                        onChange={(e) => handleTickerChange(e.target.value)}
                        className={`bg-black border-avalanche-gray-medium text-white ${
                          tokenData.ticker && !isValidTicker(tokenData.ticker) 
                            ? 'border-red-500' 
                            : ''
                        }`}
                        maxLength={6}
                      />
                      {tokenData.ticker && !isValidTicker(tokenData.ticker) && (
                        <p className="text-red-400 text-xs mt-1">Ticker must be 3-6 letters only</p>
                      )}
                    </div>
                    <div>
                      <Label htmlFor="fun-supply" className="text-gray-300">Initial Supply *</Label>
                      <Input
                        id="fun-supply"
                        placeholder="e.g., 1000000"
                        value={tokenData.supply}
                        onChange={(e) => setTokenData({...tokenData, supply: e.target.value})}
                        className="bg-black border-avalanche-gray-medium text-white"
                        type="number"
                      />
                    </div>
                    <div>
                      <Label htmlFor="fun-description" className="text-gray-300">Description</Label>
                      <Textarea
                        id="fun-description"
                        placeholder="Tell the community about your meme coin..."
                        value={tokenData.description}
                        onChange={(e) => setTokenData({...tokenData, description: e.target.value})}
                        className="bg-black border-avalanche-gray-medium text-white"
                      />
                    </div>
                    
                    <div className="bg-avalanche-gray-medium p-4 rounded-lg">
                      <p className="text-gray-300 text-sm mb-2">Minting Fee: <span className="text-avalanche-red font-semibold">0.01 AVAX</span></p>
                      <p className="text-gray-400 text-xs">This fee covers the gas costs for deploying your token contract on Avalanche.</p>
                    </div>
                    
                    <Button 
                      onClick={handleCreateToken}
                      disabled={!isConnected || isCreating || !tokenData.name || !tokenData.ticker || !tokenData.supply || !isValidTicker(tokenData.ticker)}
                      className="w-full bg-avalanche-red hover:bg-avalanche-red-dark text-white disabled:opacity-50"
                    >
                      {isCreating ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Creating Token...
                        </>
                      ) : (
                        "Create Token"
                      )}
                    </Button>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="trading-coin" className="space-y-4 mt-6">
                <Card className="bg-avalanche-gray-dark border-avalanche-gray-medium">
                  <CardHeader>
                    <CardTitle className="text-white">Trading Coin Details</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="trading-name" className="text-gray-300">Token Name</Label>
                      <Input
                        id="trading-name"
                        placeholder="e.g., AvalancheGem"
                        className="bg-black border-avalanche-gray-medium text-white"
                      />
                    </div>
                    <div>
                      <Label htmlFor="trading-ticker" className="text-gray-300">Ticker Symbol</Label>
                      <Input
                        id="trading-ticker"
                        placeholder="e.g., AGEM"
                        className="bg-black border-avalanche-gray-medium text-white"
                      />
                    </div>
                    <div>
                      <Label htmlFor="trading-supply" className="text-gray-300">Total Supply</Label>
                      <Input
                        id="trading-supply"
                        placeholder="e.g., 10000000"
                        className="bg-black border-avalanche-gray-medium text-white"
                      />
                    </div>
                    <div>
                      <Label htmlFor="initial-liquidity" className="text-gray-300">Initial Liquidity (AVAX)</Label>
                      <Input
                        id="initial-liquidity"
                        placeholder="e.g., 5"
                        className="bg-black border-avalanche-gray-medium text-white"
                      />
                    </div>
                    <Button 
                      onClick={() => handleLaunchToken("Trading Coin")}
                      className="w-full bg-avalanche-red hover:bg-avalanche-red-dark text-white"
                    >
                      Launch Trading Coin
                    </Button>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="nft" className="space-y-4 mt-6">
                <Card className="bg-avalanche-gray-dark border-avalanche-gray-medium">
                  <CardHeader>
                    <CardTitle className="text-white">NFT Collection Details</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="nft-name" className="text-gray-300">Collection Name</Label>
                      <Input
                        id="nft-name"
                        placeholder="e.g., Frost Creatures"
                        value={nftData.name}
                        onChange={(e) => setNftData({...nftData, name: e.target.value})}
                        className="bg-black border-avalanche-gray-medium text-white"
                      />
                    </div>
                    <div>
                      <Label htmlFor="nft-quantity" className="text-gray-300">Total Quantity</Label>
                      <Input
                        id="nft-quantity"
                        placeholder="e.g., 1000"
                        value={nftData.quantity}
                        onChange={(e) => setNftData({...nftData, quantity: e.target.value})}
                        className="bg-black border-avalanche-gray-medium text-white"
                      />
                    </div>
                    <div>
                      <Label htmlFor="nft-description" className="text-gray-300">Description</Label>
                      <Textarea
                        id="nft-description"
                        placeholder="Describe your NFT collection..."
                        value={nftData.description}
                        onChange={(e) => setNftData({...nftData, description: e.target.value})}
                        className="bg-black border-avalanche-gray-medium text-white"
                      />
                    </div>
                    <div>
                      <Label htmlFor="nft-image" className="text-gray-300">Upload Image</Label>
                      <Input
                        id="nft-image"
                        type="file"
                        accept="image/*"
                        className="bg-black border-avalanche-gray-medium text-white"
                      />
                    </div>
                    <Button 
                      onClick={() => handleLaunchToken("NFT Collection")}
                      className="w-full bg-avalanche-red hover:bg-avalanche-red-dark text-white"
                    >
                      Launch NFT Collection
                    </Button>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Live Preview */}
          <div>
            <Card className="bg-avalanche-gray-dark border-avalanche-red">
              <CardHeader>
                <CardTitle className="text-white">Live Preview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-black p-6 rounded-lg border border-avalanche-gray-medium">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-avalanche-red rounded-full mx-auto mb-4 flex items-center justify-center">
                      <span className="text-white font-bold text-xl">
                        {tokenData.ticker ? tokenData.ticker.charAt(0) : "?"}
                      </span>
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">
                      {tokenData.name || "Your Token Name"}
                    </h3>
                    <p className="text-gray-400 text-sm mb-4">
                      ${tokenData.ticker || "TICKER"}
                    </p>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <div className="text-gray-400">Supply</div>
                        <div className="text-white font-semibold">
                          {tokenData.supply ? Number(tokenData.supply).toLocaleString() : "1,000,000"}
                        </div>
                      </div>
                      <div>
                        <div className="text-gray-400">Network</div>
                        <div className="text-avalanche-red font-semibold">Avalanche</div>
                      </div>
                    </div>
                    {tokenData.description && (
                      <div className="mt-4 p-3 bg-avalanche-gray-medium rounded text-left">
                        <p className="text-gray-300 text-sm">{tokenData.description}</p>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      
      <TokenCreatedModal
        isOpen={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        tokenAddress={createdTokenAddress}
        tokenName={tokenData.name}
        tokenTicker={tokenData.ticker}
      />
    </div>
  );
};

export default Launch;
