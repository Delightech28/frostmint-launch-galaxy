
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Upload, X } from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { useWallet } from "@/contexts/WalletContext";
import { deployToken, TokenData } from "@/utils/contractUtils";
import TokenCreatedModal from "@/components/TokenCreatedModal";
import { supabase } from '@/integrations/supabase/client';
import AddLiquidity from "@/components/AddLiquidity";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { ethers } from "ethers";

// Utility function to upload image to Supabase Storage
async function uploadTokenImage(file: File, tokenName: string): Promise<string> {
  const fileExt = file.name.split('.').pop();
  const filePath = `token-images/${tokenName.replace(/\s+/g, '_')}_${Date.now()}.${fileExt}`;
  const { data, error } = await supabase.storage.from('token-images').upload(filePath, file, {
    cacheControl: '3600',
    upsert: false,
  });
  if (error) throw new Error('Image upload failed: ' + error.message);
  // Get public URL
  const { data: publicUrlData } = supabase.storage.from('token-images').getPublicUrl(filePath);
  if (!publicUrlData?.publicUrl) throw new Error('Failed to get public image URL');
  return publicUrlData.publicUrl;
}

const Launch = () => {
  const { isConnected, address } = useWallet();
  const [isCreating, setIsCreating] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [createdTokenAddress, setCreatedTokenAddress] = useState("");
  const [activeTab, setActiveTab] = useState("fun-coin");
  
  const [funCoinData, setFunCoinData] = useState({
    name: "",
    ticker: "",
    supply: "",
    description: "",
    image: null as File | null,
  });
  const [tradingCoinData, setTradingCoinData] = useState({
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

  const [nameAvailable, setNameAvailable] = useState<null | boolean>(null);
  const [tickerAvailable, setTickerAvailable] = useState<null | boolean>(null);
  const [checkingName, setCheckingName] = useState(false);
  const [checkingTicker, setCheckingTicker] = useState(false);

  const [showAddLiquidityModal, setShowAddLiquidityModal] = useState(false);

  const [createdTokenImageUrl, setCreatedTokenImageUrl] = useState("");

  const handleImageUpload = (file: File | null, type: 'token' | 'nft') => {
    if (type === 'token') {
      if (activeTab === 'fun-coin') {
        setFunCoinData({ ...funCoinData, image: file });
      } else if (activeTab === 'trading-coin') {
        setTradingCoinData({ ...tradingCoinData, image: file });
      }
    } else {
      setNftData({ ...nftData, image: file });
    }
  };
  const removeImage = (type: 'token' | 'nft') => {
    if (type === 'token') {
      if (activeTab === 'fun-coin') {
        setFunCoinData({ ...funCoinData, image: null });
      } else if (activeTab === 'trading-coin') {
        setTradingCoinData({ ...tradingCoinData, image: null });
      }
    } else {
      setNftData({ ...nftData, image: null });
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
    if (activeTab === 'fun-coin') {
      setFunCoinData({...funCoinData, ticker: formatted});
    } else if (activeTab === 'trading-coin') {
      setTradingCoinData({...tradingCoinData, ticker: formatted});
    }
  };

  const isValidTicker = (ticker: string) => {
    return ticker.length >= 3 && ticker.length <= 6;
  };

  // Real-time check for token name
  useEffect(() => {
    const funNameTrimmed = funCoinData.name.trim();
    const tradingNameTrimmed = tradingCoinData.name.trim();
    if (!funNameTrimmed && !tradingNameTrimmed) {
      setNameAvailable(null);
      return;
    }
    setCheckingName(true);
    const timeout = setTimeout(async () => {
      const { data, error } = await supabase
        .from('tokens')
        .select('id')
        .eq('name', activeTab === 'fun-coin' ? funNameTrimmed : tradingNameTrimmed);
      setNameAvailable(!(data && data.length > 0));
      setCheckingName(false);
    }, 500);
    return () => clearTimeout(timeout);
  }, [funCoinData.name, tradingCoinData.name, activeTab]);

  // Real-time check for ticker symbol
  useEffect(() => {
    const funTickerTrimmed = funCoinData.ticker.trim();
    const tradingTickerTrimmed = tradingCoinData.ticker.trim();
    if (!funTickerTrimmed && !tradingTickerTrimmed) {
      setTickerAvailable(null);
      return;
    }
    setCheckingTicker(true);
    const timeout = setTimeout(async () => {
      const { data, error } = await supabase
        .from('tokens')
        .select('id')
        .eq('ticker', activeTab === 'fun-coin' ? funTickerTrimmed : tradingTickerTrimmed);
      setTickerAvailable(!(data && data.length > 0));
      setCheckingTicker(false);
    }, 500);
    return () => clearTimeout(timeout);
  }, [funCoinData.ticker, tradingCoinData.ticker, activeTab]);

  const handleCreateToken = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!isConnected || !address) {
      toast.error("Please connect your wallet first");
      return;
    }

    // Always trim name and ticker before using
    const tokenDataRaw = activeTab === 'fun-coin' ? funCoinData : tradingCoinData;
    const tokenData = {
      ...tokenDataRaw,
      name: tokenDataRaw.name.trim(),
      ticker: tokenDataRaw.ticker.trim(),
    };

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

    if (!tokenData.image) {
      toast.error("Token image is required");
      return;
    }

    try {
      setIsCreating(true);
      toast.info("Uploading image...");
      // Upload image to Supabase Storage
      const imageUrl = await uploadTokenImage(tokenData.image, tokenData.name);
      setCreatedTokenImageUrl(imageUrl); // Store the public image URL
      toast.info("Preparing to deploy your token...");

      // Check for duplicate name or ticker
      const { data: existingTokens, error } = await supabase
        .from('tokens')
        .select('id')
        .or(`name.eq.${tokenData.name},ticker.eq.${tokenData.ticker}`);

      if (existingTokens && existingTokens.length > 0) {
        toast.error("A token with this name or ticker already exists.");
        setIsCreating(false);
        return;
      }
      
      const tokenType = getTokenType(activeTab);
      
      // Convert supply to 18 decimals for initialSupply
      const initialSupply = ethers.parseUnits(tokenData.supply, 18).toString();
      const tokenDataForDeployment: TokenData = {
        name: tokenData.name,
        ticker: tokenData.ticker,
        initialSupply: initialSupply,
        tokenType: tokenType,
        description: tokenData.description,
        imageUrl: imageUrl // Use the uploaded image's public URL
      };
      
      const contractAddress = await deployToken(tokenDataForDeployment, address);
      
      console.log("Token deployed successfully at:", contractAddress);
      
      // Set the created token address, name, and ticker for the modal
      setCreatedTokenName(tokenData.name);
      setCreatedTokenTicker(tokenData.ticker);
      setCreatedTokenAddress(contractAddress);
      // If trading coin, show AddLiquidity modal instead of TokenCreatedModal
      if (activeTab === "trading-coin") {
        setShowSuccessModal(false);
        setShowAddLiquidityModal(true);
      } else {
        setShowSuccessModal(true);
      }
      toast.success("Token created successfully!");
      
      // Reset form
      setFunCoinData({ name: "", ticker: "", supply: "", description: "", image: null });
      setTradingCoinData({ name: "", ticker: "", supply: "", description: "", image: null });
      
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
                        value={funCoinData.name}
                        onChange={(e) => setFunCoinData({...funCoinData, name: e.target.value})}
                        className="bg-black border-avalanche-gray-medium text-white"
                        maxLength={20}
                      />
                      {funCoinData.name && (
                        <div className="mt-1 text-xs">
                          {checkingName ? (
                            <span className="text-gray-400">Checking availability...</span>
                          ) : nameAvailable === false ? (
                            <span className="text-red-400">Token name already exists</span>
                          ) : nameAvailable === true ? (
                            <span className="text-green-400">Token name is available</span>
                          ) : null}
                        </div>
                      )}
                    </div>
                    <div>
                      <Label htmlFor="fun-ticker" className="text-gray-300">
                        Ticker Symbol * <span className="text-xs text-gray-400">(3-6 letters only)</span>
                      </Label>
                      <Input
                        id="fun-ticker"
                        placeholder="e.g., DMOON"
                        value={funCoinData.ticker}
                        onChange={(e) => handleTickerChange(e.target.value)}
                        className={`bg-black border-avalanche-gray-medium text-white ${
                          funCoinData.ticker && !isValidTicker(funCoinData.ticker) 
                            ? 'border-red-500' 
                            : ''
                        }`}
                        maxLength={6}
                      />
                      {funCoinData.ticker && (
                        <div className="mt-1 text-xs">
                          {checkingTicker ? (
                            <span className="text-gray-400">Checking availability...</span>
                          ) : tickerAvailable === false ? (
                            <span className="text-red-400">Ticker symbol already exists</span>
                          ) : tickerAvailable === true ? (
                            <span className="text-green-400">Ticker symbol is available</span>
                          ) : null}
                        </div>
                      )}
                      {funCoinData.ticker && !isValidTicker(funCoinData.ticker) && (
                        <p className="text-red-400 text-xs mt-1">Ticker must be 3-6 letters only</p>
                      )}
                    </div>
                    <div>
                      <Label htmlFor="fun-supply" className="text-gray-300">Initial Supply *</Label>
                      <Input
                        id="fun-supply"
                        placeholder="e.g., 1000000"
                        value={funCoinData.supply}
                        onChange={(e) => {
                          const value = e.target.value.replace(/[^0-9]/g, '');
                          setFunCoinData({...funCoinData, supply: value});
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
                        value={funCoinData.description}
                        onChange={(e) => setFunCoinData({...funCoinData, description: e.target.value})}
                        className="bg-black border-avalanche-gray-medium text-white"
                      />
                    </div>
                    
                    <ImageUploadSection
                      file={funCoinData.image}
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
                      disabled={
                        !isConnected ||
                        isCreating ||
                        !funCoinData.name ||
                        !funCoinData.ticker ||
                        !funCoinData.supply ||
                        !isValidTicker(funCoinData.ticker) ||
                        !funCoinData.image ||
                        nameAvailable === false ||
                        tickerAvailable === false
                      }
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
                        value={tradingCoinData.name}
                        onChange={(e) => setTradingCoinData({...tradingCoinData, name: e.target.value})}
                        className="bg-black border-avalanche-gray-medium text-white"
                        maxLength={20}
                      />
                      {tradingCoinData.name && (
                        <div className="mt-1 text-xs">
                          {checkingName ? (
                            <span className="text-gray-400">Checking availability...</span>
                          ) : nameAvailable === false ? (
                            <span className="text-red-400">Token name already exists</span>
                          ) : nameAvailable === true ? (
                            <span className="text-green-400">Token name is available</span>
                          ) : null}
                        </div>
                      )}
                    </div>
                    <div>
                      <Label htmlFor="trading-ticker" className="text-gray-300">
                        Ticker Symbol * <span className="text-xs text-gray-400">(3-6 letters only)</span>
                      </Label>
                      <Input
                        id="trading-ticker"
                        placeholder="e.g., AGEM"
                        value={tradingCoinData.ticker}
                        onChange={(e) => handleTickerChange(e.target.value)}
                        className={`bg-black border-avalanche-gray-medium text-white ${
                          tradingCoinData.ticker && !isValidTicker(tradingCoinData.ticker) 
                            ? 'border-red-500' 
                            : ''
                        }`}
                        maxLength={6}
                      />
                      {tradingCoinData.ticker && (
                        <div className="mt-1 text-xs">
                          {checkingTicker ? (
                            <span className="text-gray-400">Checking availability...</span>
                          ) : tickerAvailable === false ? (
                            <span className="text-red-400">Ticker symbol already exists</span>
                          ) : tickerAvailable === true ? (
                            <span className="text-green-400">Ticker symbol is available</span>
                          ) : null}
                        </div>
                      )}
                      {tradingCoinData.ticker && !isValidTicker(tradingCoinData.ticker) && (
                        <p className="text-red-400 text-xs mt-1">Ticker must be 3-6 letters only</p>
                      )}
                    </div>
                    <div>
                      <Label htmlFor="trading-supply" className="text-gray-300">Initial Supply *</Label>
                      <Input
                        id="trading-supply"
                        placeholder="e.g., 10000000"
                        value={tradingCoinData.supply}
                        onChange={(e) => {
                          const value = e.target.value.replace(/[^0-9]/g, '');
                          setTradingCoinData({...tradingCoinData, supply: value});
                        }}
                        className="bg-black border-avalanche-gray-medium text-white"
                        type="text"
                        inputMode="numeric"
                        pattern="[0-9]*"
                      />
                    </div>
                    <div>
                      <Label htmlFor="trading-description" className="text-gray-300">Description</Label>
                      <Textarea
                        id="trading-description"
                        placeholder="Describe your trading coin..."
                        value={tradingCoinData.description}
                        onChange={(e) => setTradingCoinData({...tradingCoinData, description: e.target.value})}
                        className="bg-black border-avalanche-gray-medium text-white"
                      />
                    </div>
                    
                    <ImageUploadSection
                      file={tradingCoinData.image}
                      onFileChange={(file) => handleImageUpload(file, 'token')}
                      onRemove={() => removeImage('token')}
                      type="token"
                    />
                    
                    <Button 
                      type="button"
                      onClick={handleCreateToken}
                      disabled={
                        !isConnected ||
                        isCreating ||
                        !tradingCoinData.name ||
                        !tradingCoinData.ticker ||
                        !tradingCoinData.supply ||
                        nameAvailable === false ||
                        tickerAvailable === false
                      }
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
                      {(activeTab === 'nft' ? nftData.image : funCoinData.image || tradingCoinData.image) ? (
                        <img 
                          src={URL.createObjectURL(activeTab === 'nft' ? nftData.image! : (activeTab === 'fun-coin' ? funCoinData.image! : tradingCoinData.image!))} 
                          alt="Token preview" 
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-white font-bold text-xl">
                          {(activeTab === 'nft' ? nftData.name : (funCoinData.name || tradingCoinData.name)) 
                            ? (activeTab === 'nft' ? nftData.name.charAt(0) : (funCoinData.name || tradingCoinData.name).charAt(0)) 
                            : "?"}
                        </span>
                      )}
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">
                      {activeTab === 'nft' 
                        ? (nftData.name || "Your NFT Collection") 
                        : (funCoinData.name || tradingCoinData.name || "Your Token Name")}
                    </h3>
                    <p className="text-gray-400 text-sm mb-4">
                      {activeTab === 'nft' 
                        ? `${nftData.quantity || "1000"} NFTs`
                        : `$${funCoinData.ticker || tradingCoinData.ticker || "TICKER"}`}
                    </p>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <div className="text-gray-400">
                          {activeTab === 'nft' ? 'Quantity' : 'Supply'}
                        </div>
                        <div className="text-white font-semibold">
                          {activeTab === 'nft' 
                            ? (nftData.quantity ? Number(nftData.quantity).toLocaleString() : "1,000")
                            : (funCoinData.supply || tradingCoinData.supply ? Number(funCoinData.supply || tradingCoinData.supply).toLocaleString() : "1,000,000")}
                        </div>
                      </div>
                      <div>
                        <div className="text-gray-400">Network</div>
                        <div className="text-avalanche-red font-semibold">Avalanche</div>
                      </div>
                    </div>
                    {((activeTab === 'nft' && nftData.description) || (activeTab !== 'nft' && (funCoinData.description || tradingCoinData.description))) && (
                      <div className="mt-4 p-3 bg-avalanche-gray-medium rounded text-left">
                        <p className="text-gray-300 text-sm">
                          {activeTab === 'nft' ? nftData.description : (funCoinData.description || tradingCoinData.description)}
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

      {/* AddLiquidity Modal for Trading Coin */}
      <Dialog open={showAddLiquidityModal} onOpenChange={setShowAddLiquidityModal}>
        <DialogContent>
          <AddLiquidity
            memeTokenAddress={createdTokenAddress}
            memeTokenSymbol={createdTokenTicker}
            memeTokenDecimals={18}
            memeTokenImageUrl={createdTokenImageUrl}
            onClose={() => setShowAddLiquidityModal(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Launch;
