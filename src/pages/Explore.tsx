
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, TrendingUp, Filter, Loader2 } from "lucide-react";
import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const Explore = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");

  // Fetch tokens from database
  const { data: tokens, isLoading, error } = useQuery({
    queryKey: ['tokens'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tokens')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Error fetching tokens:', error);
        throw error;
      }
      
      return data || [];
    }
  });

  const filters = [
    { id: "all", label: "All" },
    { id: "fun", label: "Fun Coins" },
    { id: "trading", label: "Trading Coins" },
    { id: "nft", label: "NFTs" },
    { id: "trending", label: "Trending" }
  ];

  // Improved token type detection
  const getTokenType = (name: string, ticker: string, description?: string) => {
    const nameUpper = name.toLowerCase();
    const tickerUpper = ticker.toLowerCase();
    const descUpper = description?.toLowerCase() || '';
    
    // NFT detection
    if (nameUpper.includes('nft') || tickerUpper.includes('nft') || descUpper.includes('nft')) {
      return 'NFT';
    }
    
    // Fun/Meme coin detection (more comprehensive)
    const funKeywords = [
      'meme', 'doge', 'shib', 'pepe', 'moon', 'rocket', 'diamond', 'hands',
      'ape', 'banana', 'hodl', 'lambo', 'fun', 'joke', 'lol', 'haha',
      'cute', 'funny', 'silly', 'crazy', 'wild', 'mad', 'insane',
      'cat', 'dog', 'frog', 'bear', 'bull', 'bear', 'panda', 'monkey',
      'baby', 'mini', 'micro', 'safe', 'mega', 'ultra', 'super',
      'floki', 'elon', 'doge', 'shiba', 'akita', 'kishu'
    ];
    
    const hasFunKeyword = funKeywords.some(keyword => 
      nameUpper.includes(keyword) || 
      tickerUpper.includes(keyword) || 
      descUpper.includes(keyword)
    );
    
    if (hasFunKeyword) {
      return 'Fun Coin';
    }
    
    // Default to trading coin
    return 'Trading Coin';
  };

  // Generate stable mock data for each token
  const generateMockData = (tokenId: string) => {
    // Use token ID as seed for consistent data
    const seed = tokenId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const random1 = Math.sin(seed) * 10000;
    const random2 = Math.sin(seed * 2) * 10000;
    const random3 = Math.sin(seed * 3) * 10000;
    
    const price = Math.abs(random1 - Math.floor(random1)) * 0.1;
    const change = (random2 - Math.floor(random2)) * 70 - 35; // -35 to +35
    const volume = Math.abs(random3 - Math.floor(random3)) * 500;
    
    return {
      price: `$${price.toFixed(4)}`,
      change: change >= 0 ? `+${change.toFixed(1)}%` : `${change.toFixed(1)}%`,
      volume: `$${volume.toFixed(1)}K`
    };
  };

  const filteredTokens = useMemo(() => {
    if (!tokens) return [];
    
    return tokens.filter(token => {
      const matchesSearch = token.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           token.ticker.toLowerCase().includes(searchTerm.toLowerCase());
      
      if (activeFilter === "all") return matchesSearch;
      
      const tokenType = getTokenType(token.name, token.ticker, token.description);
      if (activeFilter === "fun") return matchesSearch && tokenType === "Fun Coin";
      if (activeFilter === "trading") return matchesSearch && tokenType === "Trading Coin";
      if (activeFilter === "nft") return matchesSearch && tokenType === "NFT";
      if (activeFilter === "trending") {
        const mockData = generateMockData(token.id);
        return matchesSearch && parseFloat(mockData.change) > 10;
      }
      
      return matchesSearch;
    });
  }, [tokens, searchTerm, activeFilter]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="flex items-center space-x-2 text-white">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Loading tokens...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-400 mb-4">Error loading tokens</p>
          <Button 
            onClick={() => window.location.reload()} 
            className="bg-avalanche-red hover:bg-avalanche-red-dark"
          >
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Explore Projects</h1>
          <p className="text-gray-300">
            Discover trending meme coins and NFT collections on Avalanche
          </p>
        </div>

        {/* Search and Filters */}
        <div className="mb-8 space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search projects..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-avalanche-gray-dark border-avalanche-gray-medium text-white"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            {filters.map((filter) => (
              <Button
                key={filter.id}
                variant={activeFilter === filter.id ? "default" : "outline"}
                size="sm"
                onClick={() => setActiveFilter(filter.id)}
                className={
                  activeFilter === filter.id
                    ? "bg-avalanche-red hover:bg-avalanche-red-dark text-white"
                    : "border-avalanche-gray-medium text-gray-300 hover:bg-avalanche-gray-dark"
                }
              >
                {filter.id === "trending" && <TrendingUp className="mr-1 h-3 w-3" />}
                {filter.label}
              </Button>
            ))}
          </div>
        </div>

        {/* Projects Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTokens.map((token) => {
            const tokenType = getTokenType(token.name, token.ticker, token.description);
            const mockData = generateMockData(token.id);
            
            return (
              <Card key={token.id} className="bg-avalanche-gray-dark border-avalanche-gray-medium hover:border-avalanche-red transition-colors cursor-pointer">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="text-2xl">
                        {tokenType === 'NFT' ? '🖼️' : tokenType === 'Fun Coin' ? '🎉' : '💰'}
                      </div>
                      <div>
                        <CardTitle className="text-white text-lg">{token.name}</CardTitle>
                        <p className="text-gray-400 text-sm">{token.ticker}</p>
                      </div>
                    </div>
                    <Badge 
                      variant="outline" 
                      className={
                        tokenType === "Fun Coin" 
                          ? "border-blue-500 text-blue-400" 
                          : tokenType === "Trading Coin"
                          ? "border-green-500 text-green-400"
                          : "border-purple-500 text-purple-400"
                      }
                    >
                      {tokenType}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <div className="text-gray-400">Price</div>
                      <div className="text-white font-semibold">{mockData.price}</div>
                    </div>
                    <div>
                      <div className="text-gray-400">24h Change</div>
                      <div className={`font-semibold ${
                        mockData.change.startsWith('+') ? 'text-green-400' : 'text-red-400'
                      }`}>
                        {mockData.change}
                      </div>
                    </div>
                    <div className="col-span-2">
                      <div className="text-gray-400">Volume</div>
                      <div className="text-white font-semibold">{mockData.volume}</div>
                    </div>
                    <div className="col-span-2">
                      <div className="text-gray-400">Creator</div>
                      <div className="text-white font-semibold text-xs">
                        {`${token.creator_wallet.slice(0, 6)}...${token.creator_wallet.slice(-4)}`}
                      </div>
                    </div>
                  </div>
                  <Button 
                    className="w-full mt-4 bg-avalanche-red hover:bg-avalanche-red-dark text-white"
                    size="sm"
                  >
                    View Details
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {filteredTokens.length === 0 && !isLoading && (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <Filter className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No projects found matching your criteria</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Explore;
