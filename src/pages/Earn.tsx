
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Coins, Users, TrendingUp, Star, Clock, Gift } from "lucide-react";

const Earn = () => {
  const creatorEarnings = [
    {
      title: "Token Launch Rewards",
      description: "Earn AVAX for successful token launches",
      amount: "0.1 - 0.5 AVAX",
      status: "Available",
      icon: Coins
    },
    {
      title: "Community Tips",
      description: "Receive tips from your token holders",
      amount: "Variable",
      status: "Available",
      icon: Gift
    },
    {
      title: "Trading Volume Bonus",
      description: "Earn based on your token's trading activity",
      amount: "0.1% of volume",
      status: "Coming Soon",
      icon: TrendingUp
    }
  ];

  const enaHolderPerks = [
    {
      title: "Premium Features",
      description: "Advanced analytics and launch tools",
      benefit: "Unlock premium dashboard",
      status: "Coming Soon",
      icon: Star
    },
    {
      title: "Reduced Platform Fees",
      description: "50% discount on all launch fees",
      benefit: "Save on every launch",
      status: "Coming Soon",
      icon: Coins
    },
    {
      title: "Early Access",
      description: "Priority access to new features",
      benefit: "Be first to test new tools",
      status: "Coming Soon",
      icon: Clock
    },
    {
      title: "Revenue Share",
      description: "Share in platform trading fees",
      benefit: "Passive income from platform growth",
      status: "Coming Soon",
      icon: TrendingUp
    }
  ];

  return (
    <div className="min-h-screen bg-black">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Earn with FrostMint</h1>
          <p className="text-gray-300">
            Multiple ways for creators and $ENA holders to earn on the platform
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Creator Earnings */}
          <div>
            <Card className="bg-avalanche-gray-dark border-avalanche-red mb-6">
              <CardHeader>
                <div className="flex items-center space-x-2">
                  <Users className="h-6 w-6 text-avalanche-red" />
                  <CardTitle className="text-white text-xl">For Creators & Communities</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-300 mb-6">
                  Launch tokens and NFTs to build your community while earning rewards for successful projects.
                </p>
                
                <div className="space-y-4">
                  {creatorEarnings.map((earning, index) => (
                    <Card key={index} className="bg-black border-avalanche-gray-medium">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex items-start space-x-3">
                            <div className="bg-avalanche-red p-2 rounded-lg">
                              <earning.icon className="h-4 w-4 text-white" />
                            </div>
                            <div className="flex-1">
                              <h4 className="text-white font-semibold mb-1">{earning.title}</h4>
                              <p className="text-gray-400 text-sm mb-2">{earning.description}</p>
                              <div className="text-avalanche-red font-semibold">{earning.amount}</div>
                            </div>
                          </div>
                          <Badge 
                            variant={earning.status === "Available" ? "default" : "outline"}
                            className={
                              earning.status === "Available" 
                                ? "bg-green-600 text-white"
                                : "border-yellow-500 text-yellow-400"
                            }
                          >
                            {earning.status}
                          </Badge>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                <Button className="w-full mt-6 bg-avalanche-red hover:bg-avalanche-red-dark text-white">
                  Start Creating
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* $ENA Holder Perks */}
          <div>
            <Card className="bg-avalanche-gray-dark border-avalanche-red mb-6">
              <CardHeader>
                <div className="flex items-center space-x-2">
                  <Star className="h-6 w-6 text-avalanche-red" />
                  <CardTitle className="text-white text-xl">For $ENA Holders</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-300 mb-6">
                  Hold $ENA tokens to unlock premium features and earn passive income from platform growth.
                </p>
                
                <div className="space-y-4">
                  {enaHolderPerks.map((perk, index) => (
                    <Card key={index} className="bg-black border-avalanche-gray-medium">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex items-start space-x-3">
                            <div className="bg-avalanche-red p-2 rounded-lg">
                              <perk.icon className="h-4 w-4 text-white" />
                            </div>
                            <div className="flex-1">
                              <h4 className="text-white font-semibold mb-1">{perk.title}</h4>
                              <p className="text-gray-400 text-sm mb-2">{perk.description}</p>
                              <div className="text-avalanche-red font-semibold text-sm">{perk.benefit}</div>
                            </div>
                          </div>
                          <Badge 
                            variant="outline"
                            className="border-yellow-500 text-yellow-400"
                          >
                            {perk.status}
                          </Badge>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                <Button 
                  variant="outline" 
                  className="w-full mt-6 border-avalanche-red text-avalanche-red hover:bg-avalanche-red hover:text-white"
                  disabled
                >
                  Get $ENA (Coming Soon)
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Stats Section */}
        <Card className="bg-avalanche-gray-dark border-avalanche-gray-medium mt-8">
          <CardHeader>
            <CardTitle className="text-white text-center">Platform Statistics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 text-center">
              <div>
                <div className="text-2xl font-bold text-avalanche-red mb-1">$2M+</div>
                <div className="text-gray-400 text-sm">Total Value Launched</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-avalanche-red mb-1">10,000+</div>
                <div className="text-gray-400 text-sm">Tokens Created</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-avalanche-red mb-1">5,000+</div>
                <div className="text-gray-400 text-sm">Active Creators</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-avalanche-red mb-1">$45K+</div>
                <div className="text-gray-400 text-sm">Creator Earnings</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Earn;
