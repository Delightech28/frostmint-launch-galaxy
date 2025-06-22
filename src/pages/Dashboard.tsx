
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useWallet } from "@/contexts/WalletContext";
import { Rocket, Coins, TrendingUp } from "lucide-react";
import { Link } from "react-router-dom";

const Dashboard = () => {
  const { address } = useWallet();

  const stats = [
    { title: "Tokens Launched", value: "0", icon: Rocket },
    { title: "Total Earnings", value: "$0.00", icon: Coins },
    { title: "Community Rank", value: "Newcomer", icon: TrendingUp },
  ];

  return (
    <div className="min-h-screen bg-black">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Welcome to FrostMint</h1>
          <p className="text-gray-300">
            Your no-code launchpad for meme coins and NFTs on Avalanche
          </p>
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
