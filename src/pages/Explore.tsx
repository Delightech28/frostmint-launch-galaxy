
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, TrendingUp, Filter, Copy, Clock, Coins } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { ethers } from "ethers";
import { useNavigate } from "react-router-dom";
// Subgraph endpoint for Trader Joe Fuji
const TRADER_JOE_SUBGRAPH = "https://api.thegraph.com/subgraphs/name/traderjoe-xyz/exchange-v2-fuji";

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

const FACTORY_ADDRESS = '0x9Ad6C38BE94206cA50bb0d90783181662f0Cfa10'; // Trader Joe Fuji
const FACTORY_ABI = [
  'function getPair(address tokenA, address tokenB) external view returns (address pair)'
];
const PAIR_ABI = [
  'function getReserves() external view returns (uint112 reserve0, uint112 reserve1, uint32 blockTimestampLast)',
  'function token0() external view returns (address)',
  'function token1() external view returns (address)'
];
const WAVAX = '0xd00ae08403b9bbb9124bb305c09058e32c39a48c';

async function fetchTokenPrice(tokenAddress: string) {
  const provider = new ethers.JsonRpcProvider('https://api.avax-test.network/ext/bc/C/rpc');
  const factory = new ethers.Contract(FACTORY_ADDRESS, FACTORY_ABI, provider);
  const pairAddress = await factory.getPair(tokenAddress, WAVAX);
  if (pairAddress === ethers.ZeroAddress) {
    return null; // No pool exists
  }
  const pair = new ethers.Contract(pairAddress, PAIR_ABI, provider);
  const [reserve0, reserve1] = await pair.getReserves();
  const token0 = await pair.token0();
  const token1 = await pair.token1();
  let reserveToken, reserveWAVAX;
  if (token0.toLowerCase() === tokenAddress.toLowerCase()) {
    reserveToken = reserve0;
    reserveWAVAX = reserve1;
  } else {
    reserveToken = reserve1;
    reserveWAVAX = reserve0;
  }
  if (reserveToken == 0n) return null;
  const price = Number(ethers.formatUnits(reserveWAVAX, 18)) / Number(ethers.formatUnits(reserveToken, 18));
  return price;
}

// Fetch real 24h volume for a token from Trader Joe subgraph
async function fetchToken24hVolume(tokenAddress: string): Promise<string> {
  const query = {
    query: `{
      tokenDayDatas(where: { token: \"${tokenAddress.toLowerCase()}\" }, orderBy: date, orderDirection: desc, first: 1) {
        volumeToken
        date
      }
    }`
  };
  try {
    const res = await fetch(TRADER_JOE_SUBGRAPH, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(query)
    });
    const data = await res.json();
    const volume = data.data?.tokenDayDatas?.[0]?.volumeToken;
    if (!volume) return "0";
    // Format as human readable (18 decimals)
    return ethers.formatUnits(volume, 18);
  } catch {
    return "-";
  }
}

const Explore = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");
  const [tokens, setTokens] = useState<Token[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const [tradingPrices, setTradingPrices] = useState<{ [address: string]: { price: number | null, dex: string | null } }>({});
  const priceFetchRef = useRef<{ [address: string]: boolean }>({});
  const [volumes, setVolumes] = useState<{ [address: string]: string }>({});
  const [volumesLoading, setVolumesLoading] = useState<{ [address: string]: boolean }>({});
  const navigate = useNavigate();

  const filters = [
    { id: "all", label: "All", icon: null },
    { id: "newest", label: "Newest", icon: Clock },
    { id: "fun", label: "Fun Coins", icon: Coins },
    { id: "trading", label: "Trading Coins", icon: TrendingUp },
    { id: "nft", label: "NFTs", icon: null },
    { id: "trending", label: "Trending", icon: TrendingUp }
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

        // Convert initial_supply from string to number to match Token interface
        const tokensWithNumber = (data || []).map(token => ({
          ...token,
          initial_supply: parseInt(token.initial_supply)
        }));
        setTokens(tokensWithNumber);
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
          const newToken = {
            ...payload.new,
            initial_supply: parseInt(payload.new.initial_supply)
          } as Token;
          setTokens(prev => [newToken, ...prev]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  useEffect(() => {
    // Only fetch for trading coins
    const tradingTokens = tokens.filter(token => getTokenType(token.token_type) === "Trading Coin");
    tradingTokens.forEach(token => {
      if (!token.contract_address || priceFetchRef.current[token.contract_address]) return;
      priceFetchRef.current[token.contract_address] = true;
      fetchTokenPrice(token.contract_address)
        .then(price => {
          setTradingPrices(prices => ({ ...prices, [token.contract_address]: { price, dex: 'Trader Joe' } }));
        })
        .catch(() => {
          setTradingPrices(prices => ({ ...prices, [token.contract_address]: { price: null, dex: null } }));
        });
    });
  }, [tokens]);

  // Fetch real 24h volume for trading tokens
  useEffect(() => {
    const tradingTokens = tokens.filter(token => getTokenType(token.token_type) === "Trading Coin");
    tradingTokens.forEach(token => {
      if (!token.contract_address || volumes[token.contract_address] || volumesLoading[token.contract_address]) return;
      setVolumesLoading(v => ({ ...v, [token.contract_address]: true }));
      fetchToken24hVolume(token.contract_address)
        .then(vol => setVolumes(v => ({ ...v, [token.contract_address]: vol })))
        .finally(() => setVolumesLoading(v => ({ ...v, [token.contract_address]: false })));
    });
  }, [tokens]);

  const getTokenType = (tokenType: string | null) => {
    if (!tokenType) return 'Fun Coin';
    
    const type = tokenType.toLowerCase();
    if (type.includes('fun') || type.includes('meme')) {
      return 'Fun Coin';
    }
    if (type.includes('trading')) {
      return 'Trading Coin';
    }
    if (type.includes('nft')) {
      return 'NFT';
    }
    return 'Fun Coin'; // Default
  };

  const filteredTokens = tokens.filter(token => {
    const matchesSearch = token.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         token.ticker.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (activeFilter === "all") return matchesSearch;
    if (activeFilter === "newest") {
      // Show tokens created in the last 7 days
      const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      return matchesSearch && new Date(token.created_at) > sevenDaysAgo;
    }
    
    const tokenType = getTokenType(token.token_type);
    
    if (activeFilter === "fun") return matchesSearch && tokenType === "Fun Coin";
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
    // Format as AVAX (18 decimals)
    const formatted = parseFloat(ethers.formatUnits(BigInt(volume), 18));
    if (formatted >= 1000) {
      return `${(formatted / 1000).toFixed(1)}K AVAX`;
    }
    return `${formatted.toFixed(4)} AVAX`;
  };

  const shortenAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied!",
      description: `${label} copied to clipboard`,
    });
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
            Discover Fun Coins, Trading Coins, and NFT collections on Avalanche
          </p>
        </div>

        {/* Search and Filters */}
        <div className="mb-8 space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search by token name or ticker..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-avalanche-gray-dark border-avalanche-gray-medium text-white placeholder-gray-400"
            />
          </div>

          <div className="flex flex-wrap gap-3">
            {filters.map((filter) => {
              const Icon = filter.icon;
              return (
                <Button
                  key={filter.id}
                  variant={activeFilter === filter.id ? "default" : "outline"}
                  size="sm"
                  onClick={() => setActiveFilter(filter.id)}
                  className={
                    activeFilter === filter.id
                      ? "bg-avalanche-red hover:bg-avalanche-red-dark text-white border-avalanche-red"
                      : "bg-avalanche-gray-dark border-avalanche-gray-medium text-gray-300 hover:bg-avalanche-gray-medium hover:text-white hover:border-avalanche-red transition-all duration-200"
                  }
                >
                  {Icon && <Icon className="mr-2 h-3 w-3" />}
                  {filter.label}
                </Button>
              );
            })}
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
              <Card key={token.id} className="bg-avalanche-gray-dark border-avalanche-gray-medium hover:border-avalanche-red transition-all duration-300 cursor-pointer group">
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between mb-3">
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
                        <CardTitle className="text-white text-lg">
                          {token.name}
                        </CardTitle>
                        <p className="text-avalanche-red font-mono text-sm font-semibold">
                          ${token.ticker}
                        </p>
                      </div>
                    </div>
                    <Badge 
                      variant="outline" 
                      className={
                        tokenType === "Fun Coin" 
                          ? "border-blue-500 text-blue-400 bg-blue-500/10" 
                          : tokenType === "Trading Coin"
                          ? "border-green-500 text-green-400 bg-green-500/10"
                          : "border-purple-500 text-purple-400 bg-purple-500/10"
                      }
                    >
                      {tokenType}
                    </Badge>
                  </div>

                  {/* Creator wallet */}
                  <div className="flex items-center justify-between text-sm mb-2">
                    <span className="text-gray-400">Creator:</span>
                    <button
                      onClick={() => copyToClipboard(token.creator_wallet, "Creator address")}
                      className="text-gray-300 hover:text-avalanche-red transition-colors flex items-center space-x-1"
                    >
                      <span className="font-mono">{shortenAddress(token.creator_wallet)}</span>
                      <Copy className="h-3 w-3" />
                    </button>
                  </div>

                  {/* Contract address */}
                  <div className="flex items-center justify-between text-sm mb-3">
                    <span className="text-gray-400">Contract:</span>
                    <button
                      onClick={() => copyToClipboard(token.contract_address, "Contract address")}
                      className="text-gray-300 hover:text-avalanche-red transition-colors flex items-center space-x-1"
                    >
                      <span className="font-mono">{shortenAddress(token.contract_address)}</span>
                      <Copy className="h-3 w-3" />
                    </button>
                  </div>
                </CardHeader>

                <CardContent className="pt-0">
                  {/* Token specific information */}
                  {tokenType === "Fun Coin" && (
                    <div className="space-y-3">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">Total Supply:</span>
                        <span className="text-white font-semibold">
                          {(() => {
                            try {
                              const supply = parseFloat(ethers.formatUnits(BigInt(token.initial_supply), 18));
                              if (supply >= 1_000_000) {
                                return `${(supply / 1_000_000).toFixed(2)}M`;
                              } else if (supply >= 1_000) {
                                return `${(supply / 1_000).toFixed(2)}K`;
                              }
                              return supply.toLocaleString(undefined, { maximumFractionDigits: 2 });
                            } catch {
                              return token.initial_supply;
                            }
                          })()}
                        </span>
                      </div>
                    </div>
                  )}

                  {tokenType === "Trading Coin" && (
                    <div className="grid grid-cols-2 gap-3 text-sm mb-4">
                      <div>
                        <div className="text-gray-400">Price</div>
                        <div className="text-white font-semibold">
                          {tradingPrices[token.contract_address] === undefined
                            ? <span className="text-gray-400">Loading...</span>
                            : tradingPrices[token.contract_address]?.price === null
                              ? <span className="text-gray-400">—</span>
                              : <span>
                                  ${tradingPrices[token.contract_address]!.price!.toFixed(6)}
                                  <span className="ml-1 text-xs text-avalanche-red">{tradingPrices[token.contract_address]!.dex}</span>
                                </span>
                          }
                        </div>
                      </div>
                      <div>
                        <div className="text-gray-400">24h Change</div>
                        <div className={`font-semibold ${
                          mockChange.startsWith('+') ? 'text-green-400' : 'text-red-400'
                        }`}>
                          {mockChange}
                        </div>
                      </div>
                      <div>
                        <div className="text-gray-400">Volume (24h)</div>
                        <div className="text-white font-semibold">
                          {volumesLoading[token.contract_address]
                            ? <span className="text-gray-400">Loading...</span>
                            : volumes[token.contract_address] === undefined || volumes[token.contract_address] === "-" || isNaN(Number(volumes[token.contract_address]))
                              ? <span className="text-gray-400">—</span>
                              : <span>{Number(volumes[token.contract_address]).toLocaleString(undefined, { maximumFractionDigits: 4 })} {token.ticker}</span>
                          }
                        </div>
                      </div>
                      <div>
                        <div className="text-gray-400">Supply</div>
                        <div className="text-white font-semibold">
                          {(() => {
                            const supply = parseFloat(ethers.formatUnits(BigInt(token.initial_supply), 18));
                            if (supply >= 1_000_000) {
                              return `${(supply / 1_000_000).toFixed(2)}M`;
                            } else if (supply >= 1_000) {
                              return `${(supply / 1_000).toFixed(2)}K`;
                            }
                            return supply.toLocaleString(undefined, { maximumFractionDigits: 2 });
                          })()}
                        </div>
                      </div>
                    </div>
                  )}

                  {tokenType === "NFT" && (
                    <div className="space-y-3">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">Collection Size:</span>
                        <span className="text-white font-semibold">
                          {token.initial_supply.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  )}

                  {token.description && (
                    <div className="mt-3 p-3 bg-avalanche-gray-medium rounded-lg text-xs text-gray-300">
                      {token.description.length > 100 
                        ? `${token.description.substring(0, 100)}...` 
                        : token.description}
                    </div>
                  )}

                  <Button 
                    className="w-full mt-4 bg-avalanche-red hover:bg-avalanche-red-dark text-white transition-all duration-200 font-semibold"
                    size="sm"
                    onClick={() => {
                      if (tokenType === "Trading Coin") {
                        navigate(`/swap?token=${token.contract_address}`);
                      }
                    }}
                    disabled={tokenType !== "Trading Coin"}
                  >
                    {tokenType === "Trading Coin" ? "Trade" : "View Details"}
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
              <p className="text-lg">No projects found matching your criteria</p>
              <p className="text-sm mt-2">Try adjusting your search or filter settings</p>
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
