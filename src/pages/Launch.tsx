
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Upload, X } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useWallet } from "@/contexts/WalletContext";
import { deployToken, TokenData } from "@/utils/contractUtils";
import TokenCreatedModal from "@/components/TokenCreatedModal";

const Launch = () => {
  const { isConnected, address } = useWallet();
  const [isCreating, setIsCreating] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [createdTokenAddress, setCreatedTokenAddress] = useState("");
  const [activeTab, setActiveTab] = useState("fun-coin");
  
  const [tokenData, setTokenData] = useState({
    name: "",
    ticker: "",
    supply: "",
    description: "",
    image: null as File | null,
  });

  const [nftData, setNftData] = useState({
    name: "",
    description: "",
    quantity: "",
    image: null as File | null,
  });

  // Add state for created token name and ticker
  const [createdTokenName, setCreatedTokenName] = useState("");
  const [createdTokenTicker, setCreatedTokenTicker] = useState("");

  const handleImageUpload = (file: File | null, type: 'token' | 'nft') => {
    if (type === 'token') {
      setTokenData({...tokenData, image: file});
    } else {
      setNftData({...nftData, image: file});
    }
  };

  const removeImage = (type: 'token' | 'nft') => {
    if (type === 'token') {
      setTokenData({...tokenData, image: null});
    } else {
      setNftData({...nftData, image: null});
    }
  };

  const getTokenType = (tabValue: string) => {
    switch (tabValue) {
      case "fun-coin":
        return "Fun/Meme Coin";
      case "trading-coin":
        return "Trading Coin";
      case "nft":
        return "NFT Collection";
      default:
        return "Fun/Meme Coin";
    }
  };

  const handleTickerChange = (value: string) => {
    // Auto-format ticker: 3-6 characters, uppercase, letters only
    const formatted = value.replace(/[^A-Za-z]/g, '').toUpperCase().slice(0, 6);
    setTokenData({...tokenData, ticker: formatted});
  };

  const isValidTicker = (ticker: string) => {
    return ticker.length >= 3 && ticker.length <= 6;
  };

  const handleCreateToken = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
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

    const supplyNumber = parseInt(tokenData.supply);
    if (isNaN(supplyNumber) || supplyNumber <= 0) {
      toast.error("Please enter a valid supply number");
      return;
    }

    try {
      setIsCreating(true);
      toast.info("Preparing to deploy your token...");
      
      const tokenType = getTokenType(activeTab);
      
      const tokenDataForDeployment: TokenData = {
        name: tokenData.name,
        ticker: tokenData.ticker,
        initialSupply: supplyNumber,
        tokenType: tokenType,
        description: tokenData.description,
        imageUrl: tokenData.image ? URL.createObjectURL(tokenData.image) : undefined
      };
      
      const contractAddress = await deployToken(tokenDataForDeployment, address);
      
      console.log("Token deployed successfully at:", contractAddress);
      
      // Set the created token address, name, and ticker for the modal
      setCreatedTokenName(tokenData.name);
      setCreatedTokenTicker(tokenData.ticker);
      setCreatedTokenAddress(contractAddress);
      setShowSuccessModal(true);
      toast.success("Token created successfully!");
      
      // Reset form
      setTokenData({ name: "", ticker: "", supply: "", description: "", image: null });
      
    } catch (error: any) {
      console.error("Error creating token:", error);
      
      // More specific error handling
      if (error.message.includes('rejected')) {
        toast.error("Transaction was rejected by user");
      } else if (error.message.includes('insufficient funds')) {
        toast.error("Insufficient AVAX for gas fees. Please add more AVAX to your wallet.");
      } else if (error.message.includes('JSON-RPC')) {
        toast.error("Network error. Please check your connection and try again.");
      } else if (error.message.includes('gas')) {
        toast.error("Gas estimation failed. Please ensure you have enough AVAX.");
      } else {
        toast.error(error.message || "Failed to create token. Please try again.");
      }
    } finally {
      setIsCreating(false);
    }
  };

  const handleLaunchToken = (type: string) => {
    toast.success(`${type} launch initiated! (Demo mode)`);
  };

  const ImageUploadSection = ({ 
    file, 
    onFileChange, 
    onRemove, 
    type 
  }: { 
    file: File | null; 
    onFileChange: (file: File | null) => void; 
    onRemove: () => void;
    type: 'token' | 'nft';
  }) => (
    <div>
      <Label className="text-gray-300">Upload Image</Label>
      <div className="mt-2">
        {file ? (
          <div className="relative w-full h-32 bg-avalanche-gray-medium rounded-lg border-2 border-dashed border-avalanche-gray-medium overflow-hidden">
            <img 
              src={URL.createObjectURL(file)} 
              alt="Preview" 
              className="w-full h-full object-cover"
            />
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onRemove();
              }}
              className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-1"
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        ) : (
          <div className="relative w-full h-32 bg-avalanche-gray-medium rounded-lg border-2 border-dashed border-avalanche-gray-medium flex items-center justify-center cursor-pointer hover:border-avalanche-red transition-colors">
            <input
              type="file"
              accept="image/*"
              onChange={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onFileChange(e.target.files?.[0] || null);
              }}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              onClick={(e) => e.stopPropagation()}
            />
            <div className="text-center text-gray-400 pointer-events-none">
              <Upload className="h-8 w-8 mx-auto mb-2" />
              <p className="text-sm">Click to upload image</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );

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
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-3 bg-avalanche-gray-dark">
                <TabsTrigger value="fun-coin" className="data-[state=active]:bg-avalanche-red">
                  Fun/Meme Coin
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
                    <CardTitle className="text-white">Fun/Meme Coin Details</CardTitle>
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
                        onChange={(e) => {
                          const value = e.target.value.replace(/[^0-9]/g, '');
                          setTokenData({...tokenData, supply: value});
                        }}
                        className="bg-black border-avalanche-gray-medium text-white"
                        type="text"
                        inputMode="numeric"
                        pattern="[0-9]*"
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
                    
                    <ImageUploadSection
                      file={tokenData.image}
                      onFileChange={(file) => handleImageUpload(file, 'token')}
                      onRemove={() => removeImage('token')}
                      type="token"
                    />
                    
                    <div className="bg-avalanche-gray-medium p-4 rounded-lg">
                      <p className="text-gray-300 text-sm mb-2">Network: <span className="text-avalanche-red font-semibold">Avalanche Fuji Testnet</span></p>
                      <p className="text-gray-400 text-xs">Make sure you have AVAX in your wallet for gas fees. You can get testnet AVAX from the Avalanche faucet.</p>
                    </div>
                    
                    <Button 
                      type="button"
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
                      <Label htmlFor="trading-name" className="text-gray-300">Token Name *</Label>
                      <Input
                        id="trading-name"
                        placeholder="e.g., AvalancheGem"
                        value={tokenData.name}
                        onChange={(e) => setTokenData({...tokenData, name: e.target.value})}
                        className="bg-black border-avalanche-gray-medium text-white"
                      />
                    </div>
                    <div>
                      <Label htmlFor="trading-ticker" className="text-gray-300">Ticker Symbol *</Label>
                      <Input
                        id="trading-ticker"
                        placeholder="e.g., AGEM"
                        value={tokenData.ticker}
                        onChange={(e) => handleTickerChange(e.target.value)}
                        className="bg-black border-avalanche-gray-medium text-white"
                      />
                    </div>
                    <div>
                      <Label htmlFor="trading-supply" className="text-gray-300">Total Supply *</Label>
                      <Input
                        id="trading-supply"
                        placeholder="e.g., 10000000"
                        value={tokenData.supply}
                        onChange={(e) => setTokenData({...tokenData, supply: e.target.value})}
                        className="bg-black border-avalanche-gray-medium text-white"
                        type="number"
                        min="1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="trading-description" className="text-gray-300">Description</Label>
                      <Textarea
                        id="trading-description"
                        placeholder="Describe your trading coin..."
                        value={tokenData.description}
                        onChange={(e) => setTokenData({...tokenData, description: e.target.value})}
                        className="bg-black border-avalanche-gray-medium text-white"
                      />
                    </div>
                    
                    <ImageUploadSection
                      file={tokenData.image}
                      onFileChange={(file) => handleImageUpload(file, 'token')}
                      onRemove={() => removeImage('token')}
                      type="token"
                    />
                    
                    <Button 
                      type="button"
                      onClick={handleCreateToken}
                      disabled={!isConnected || isCreating || !tokenData.name || !tokenData.ticker || !tokenData.supply}
                      className="w-full bg-avalanche-red hover:bg-avalanche-red-dark text-white"
                    >
                      {isCreating ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Creating Token...
                        </>
                      ) : (
                        "Create Trading Coin"
                      )}
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
                    
                    <ImageUploadSection
                      file={nftData.image}
                      onFileChange={(file) => handleImageUpload(file, 'nft')}
                      onRemove={() => removeImage('nft')}
                      type="nft"
                    />
                    
                    <Button 
                      type="button"
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
                    <div className="w-16 h-16 bg-avalanche-red rounded-full mx-auto mb-4 flex items-center justify-center overflow-hidden">
                      {(activeTab === 'nft' ? nftData.image : tokenData.image) ? (
                        <img 
                          src={URL.createObjectURL(activeTab === 'nft' ? nftData.image! : tokenData.image!)} 
                          alt="Token preview" 
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-white font-bold text-xl">
                          {(activeTab === 'nft' ? nftData.name : tokenData.name) 
                            ? (activeTab === 'nft' ? nftData.name.charAt(0) : tokenData.name.charAt(0)) 
                            : "?"}
                        </span>
                      )}
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">
                      {activeTab === 'nft' 
                        ? (nftData.name || "Your NFT Collection") 
                        : (tokenData.name || "Your Token Name")}
                    </h3>
                    <p className="text-gray-400 text-sm mb-4">
                      {activeTab === 'nft' 
                        ? `${nftData.quantity || "1000"} NFTs`
                        : `$${tokenData.ticker || "TICKER"}`}
                    </p>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <div className="text-gray-400">
                          {activeTab === 'nft' ? 'Quantity' : 'Supply'}
                        </div>
                        <div className="text-white font-semibold">
                          {activeTab === 'nft' 
                            ? (nftData.quantity ? Number(nftData.quantity).toLocaleString() : "1,000")
                            : (tokenData.supply ? Number(tokenData.supply).toLocaleString() : "1,000,000")}
                        </div>
                      </div>
                      <div>
                        <div className="text-gray-400">Network</div>
                        <div className="text-avalanche-red font-semibold">Avalanche</div>
                      </div>
                    </div>
                    {((activeTab === 'nft' && nftData.description) || (activeTab !== 'nft' && tokenData.description)) && (
                      <div className="mt-4 p-3 bg-avalanche-gray-medium rounded text-left">
                        <p className="text-gray-300 text-sm">
                          {activeTab === 'nft' ? nftData.description : tokenData.description}
                        </p>
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
        tokenName={createdTokenName}
        tokenTicker={createdTokenTicker}
      />
    </div>
  );
};

export default Launch;
