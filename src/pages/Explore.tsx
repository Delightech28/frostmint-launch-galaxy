
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, TrendingUp, Filter } from "lucide-react";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

interface Token {
  id: string;
  name: string;
  ticker: string;
  token_type: string | null;
  initial_supply: number;
  description?: string;
  image_url?: string;
  creator_wallet: string;
  created_at: string;
  contract_address: string;
}

const Explore = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");
  const [tokens, setTokens] = useState<Token[]>([]);
  const [loading, setLoading] = useState(true);

  const filters = [
    { id: "all", label: "All" },
    { id: "fun", label: "Fun/Meme Coins" },
    { id: "trading", label: "Trading Coins" },
    { id: "nft", label: "NFTs" },
    { id: "trending", label: "Trending" }
  ];

  // Fetch tokens from database
  useEffect(() => {
    const fetchTokens = async () => {
      try {
        const { data, error } = await supabase
          .from('tokens')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) {
          console.error('Error fetching tokens:', error);
          return;
        }

        setTokens(data || []);
      } catch (error) {
        console.error('Error fetching tokens:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTokens();

    // Set up real-time subscription
    const channel = supabase
      .channel('tokens')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'tokens',
        },
        (payload) => {
          const newToken = payload.new as Token;
          setTokens(prev => [newToken, ...prev]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const getTokenType = (tokenType: string | null) => {
    if (!tokenType) return 'Fun/Meme Coin';
    
    const type = tokenType.toLowerCase();
    if (type.includes('fun') || type.includes('meme')) {
      return 'Fun/Meme Coin';
    }
    if (type.includes('trading')) {
      return 'Trading Coin';
    }
    if (type.includes('nft')) {
      return 'NFT';
    }
    return 'Fun/Meme Coin'; // Default
  };

  const filteredTokens = tokens.filter(token => {
    const matchesSearch = token.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         token.ticker.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (activeFilter === "all") return matchesSearch;
    
    const tokenType = getTokenType(token.token_type);
    
    if (activeFilter === "fun") return matchesSearch && tokenType === "Fun/Meme Coin";
    if (activeFilter === "trading") return matchesSearch && tokenType === "Trading Coin";
    if (activeFilter === "nft") return matchesSearch && tokenType === "NFT";
    if (activeFilter === "trending") {
      // For demo purposes, consider tokens created in the last 24 hours as trending
      const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);
      return matchesSearch && new Date(token.created_at) > yesterday;
    }
    
    return matchesSearch;
  });

  // Generate stable mock data based on token ID
  const generateMockPrice = (tokenId: string) => {
    const hash = tokenId.split('').reduce((a, b) => a + b.charCodeAt(0), 0);
    const price = ((hash % 1000) + 1) / 100000; // 0.00001 to 0.01
    return `$${price.toFixed(6)}`;
  };

  const generateMockChange = (tokenId: string) => {
    const hash = tokenId.split('').reduce((a, b) => a + b.charCodeAt(0), 0);
    const change = ((hash % 200) - 100) / 10; // -10% to +10%
    return `${change >= 0 ? '+' : ''}${change.toFixed(1)}%`;
  };

  const generateMockVolume = (supply: number) => {
    const volume = Math.floor(supply * 0.001); // Mock volume as 0.1% of supply
    return `$${(volume / 1000).toFixed(1)}K`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white">Loading tokens...</div>
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

        {/* Tokens Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTokens.map((token) => {
            const tokenType = getTokenType(token.token_type);
            const mockPrice = generateMockPrice(token.id);
            const mockChange = generateMockChange(token.id);
            const mockVolume = generateMockVolume(token.initial_supply);

            return (
              <Card key={token.id} className="bg-avalanche-gray-dark border-avalanche-gray-medium hover:border-avalanche-red transition-colors cursor-pointer">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 rounded-full overflow-hidden bg-avalanche-red flex items-center justify-center">
                        {token.image_url ? (
                          <img 
                            src={token.image_url} 
                            alt={token.name} 
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span className="text-white font-bold text-lg">
                            {token.name.charAt(0)}
                          </span>
                        )}
                      </div>
                      <div>
                        <CardTitle className="text-white text-lg">{token.name}</CardTitle>
                        <p className="text-gray-400 text-sm">{token.ticker}</p>
                      </div>
                    </div>
                    <Badge 
                      variant="outline" 
                      className={
                        tokenType === "Fun/Meme Coin" 
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
                      <div className="text-white font-semibold">{mockPrice}</div>
                    </div>
                    <div>
                      <div className="text-gray-400">24h Change</div>
                      <div className={`font-semibold ${
                        mockChange.startsWith('+') ? 'text-green-400' : 'text-red-400'
                      }`}>
                        {mockChange}
                      </div>
                    </div>
                    <div className="col-span-2">
                      <div className="text-gray-400">Volume</div>
                      <div className="text-white font-semibold">{mockVolume}</div>
                    </div>
                  </div>
                  {token.description && (
                    <div className="mt-3 p-2 bg-avalanche-gray-medium rounded text-xs text-gray-300">
                      {token.description.length > 80 
                        ? `${token.description.substring(0, 80)}...` 
                        : token.description}
                    </div>
                  )}
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

        {filteredTokens.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <Filter className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No projects found matching your criteria</p>
            </div>
          </div>
        )}
      </div>
      
      <style dangerouslySetInnerHTML={{
        __html: `
          .scrollbar-hide {
            -ms-overflow-style: none;
            scrollbar-width: none;
          }
          .scrollbar-hide::-webkit-scrollbar {
            display: none;
          }
          
          /* Custom scrollbar styling */
          ::-webkit-scrollbar {
            width: 6px;
            height: 6px;
          }
          ::-webkit-scrollbar-track {
            background: #1a1a1a;
          }
          ::-webkit-scrollbar-thumb {
            background: #e53e3e;
            border-radius: 3px;
          }
          ::-webkit-scrollbar-thumb:hover {
            background: #c53030;
          }
        `
      }} />
    </div>
  );
};

export default Explore;
