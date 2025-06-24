
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useWallet } from "@/contexts/WalletContext";
import { Rocket, Coins, TrendingUp, Copy, Plus } from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "sonner";

const Dashboard = () => {
  const { address } = useWallet();

  const stats = [
    { title: "Tokens Launched", value: "0", icon: Rocket },
    { title: "Total Earnings", value: "$0.00", icon: Coins },
    { title: "Community Rank", value: "Newcomer", icon: TrendingUp },
  ];

  // Mock user tokens - in real app this would come from contract events or database
  const userTokens = [
    // Example: { name: "DogeMoon", ticker: "DMOON", address: "0x1234...", holders: 42, volume: "$1,234" }
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
            {userTokens.length === 0 ? (
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
                  <Card key={index} className="bg-black border-avalanche-gray-medium">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h4 className="text-white font-semibold">{token.name}</h4>
                          <p className="text-avalanche-red text-sm">${token.ticker}</p>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyToClipboard(token.address)}
                          className="text-gray-400 hover:text-white"
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                      </div>
                      
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-400">Contract:</span>
                          <span className="text-white font-mono">{formatAddress(token.address)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Holders:</span>
                          <span className="text-white">{token.holders}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Volume:</span>
                          <span className="text-white">{token.volume}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card className="bg-avalanche-gray-dark border-avalanche-red">
          <CardHeader>
            <CardTitle className="text-white">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <Link to="/launch">
                <Button className="w-full bg-avalanche-red hover:bg-avalanche-red-dark text-white">
                  <Rocket className="mr-2 h-4 w-4" />
                  Launch Token
                </Button>
              </Link>
              <Link to="/explore">
                <Button variant="outline" className="w-full border-avalanche-red text-avalanche-red hover:bg-avalanche-red hover:text-white">
                  Explore Projects
                </Button>
              </Link>
              <Link to="/earn">
                <Button variant="outline" className="w-full border-gray-600 text-gray-300 hover:bg-gray-600 hover:text-white">
                  Start Earning
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
