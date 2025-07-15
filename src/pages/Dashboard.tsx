
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useWallet } from "@/contexts/WalletContext";
import { Rocket, Coins, TrendingUp, Copy, Plus } from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ethers } from "ethers";

const Dashboard = () => {
  const { address } = useWallet();

  // Fetch user's tokens from database
  const { data: userTokens = [], isLoading } = useQuery({
    queryKey: ['userTokens', address],
    queryFn: async () => {
      if (!address) return [];
      
      const { data, error } = await supabase
        .from('tokens')
        .select('*')
        .eq('creator_wallet', address)
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Error fetching user tokens:', error);
        return [];
      }
      
      return data || [];
    },
    enabled: !!address,
  });

  const stats = [
    { title: "Tokens Launched", value: userTokens.length.toString(), icon: Rocket },
    { title: "Total Earnings", value: "$0.00", icon: Coins },
    { title: "Community Rank", value: userTokens.length > 0 ? "Creator" : "Newcomer", icon: TrendingUp },
  ];

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success("Address copied to clipboard!");
    } catch (error) {
      toast.error("Failed to copy address");
    }
  };

  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  return (
    <div className="min-h-screen bg-black">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Welcome to FrostMint</h1>
          <p className="text-gray-300">
            Your no-code launchpad for meme coins and NFTs on Avalanche
          </p>
          {address && (
            <p className="text-sm text-gray-400 mt-2">
              Connected: <span className="text-avalanche-red font-mono">{formatAddress(address)}</span>
            </p>
          )}
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {stats.map((stat, index) => (
            <Card key={index} className="bg-avalanche-gray-dark border-avalanche-gray-medium">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-300">
                  {stat.title}
                </CardTitle>
                <stat.icon className="h-4 w-4 text-avalanche-red" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">{stat.value}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* User Tokens Section */}
        <Card className="bg-avalanche-gray-dark border-avalanche-gray-medium mb-8">
          <CardHeader>
            <CardTitle className="text-white flex items-center justify-between">
              Your Tokens
              <Link to="/launch">
                <Button size="sm" className="bg-avalanche-red hover:bg-avalanche-red-dark text-white">
                  <Plus className="h-4 w-4 mr-2" />
                  Launch New Token
                </Button>
              </Link>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-12">
                <div className="text-gray-400">Loading your tokens...</div>
              </div>
            ) : userTokens.length === 0 ? (
              <div className="text-center py-12">
                <div className="bg-avalanche-gray-medium rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                  <Rocket className="h-8 w-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">No tokens launched yet</h3>
                <p className="text-gray-400 mb-6">
                  You haven't launched any tokens yet. Let's fix that!
                </p>
                <Link to="/launch">
                  <Button className="bg-avalanche-red hover:bg-avalanche-red-dark text-white">
                    <Plus className="h-4 w-4 mr-2" />
                    Launch Your First Token
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {userTokens.map((token, index) => (
                  <Card key={token.id} className="bg-black border-avalanche-gray-medium">
                    <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <div className="flex items-center space-x-2">
                              {token.image_url && (
                                <img
                                  src={token.image_url}
                                  alt={token.name}
                                  className="w-8 h-8 rounded-full object-cover border border-avalanche-gray-medium"
                                />
                              )}
                              <div>
                                <h4 className="text-white font-semibold">{token.name}</h4>
                                <p className="text-avalanche-red text-sm">${token.ticker}</p>
                              </div>
                            </div>
                          </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyToClipboard(token.contract_address)}
                          className="text-gray-400 hover:text-white"
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                      </div>
                      
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-400">Contract:</span>
                          <span className="text-white font-mono">
                            {token.contract_address.startsWith('pending_') 
                              ? 'Processing...' 
                              : formatAddress(token.contract_address)
                            }
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Supply:</span>
                          <span className="text-white">
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
                        <div className="flex justify-between">
                          <span className="text-gray-400">Created:</span>
                          <span className="text-white">
                            {new Date(token.created_at).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      
                      {token.description && (
                        <div className="mt-3 p-2 bg-avalanche-gray-medium rounded text-xs text-gray-300">
                          {token.description}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
