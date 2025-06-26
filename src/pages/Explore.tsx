
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, TrendingUp, Filter } from "lucide-react";
import { useState } from "react";

const Explore = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");

  const mockProjects = [
    {
      id: 1,
      name: "DogeMoon",
      ticker: "DMOON",
      type: "Fun Coin",
      price: "$0.0012",
      change: "+24.5%",
      volume: "$45.2K",
      image: "🐕"
    },
    {
      id: 2,
      name: "AvalancheGem",
      ticker: "AGEM",
      type: "Trading Coin",
      price: "$0.0845",
      change: "-5.2%",
      volume: "$122.8K",
      image: "💎"
    },
    {
      id: 3,
      name: "Frost Creatures",
      ticker: "NFT",
      type: "NFT",
      price: "0.1 AVAX",
      change: "+12.1%",
      volume: "89 sold",
      image: "❄️"
    },
    {
      id: 4,
      name: "MemeKing",
      ticker: "MKING",
      type: "Fun Coin",
      price: "$0.0003",
      change: "+156.7%",
      volume: "$78.9K",
      image: "👑"
    }
  ];

  const filters = [
    { id: "all", label: "All" },
    { id: "fun", label: "Fun Coins" },
    { id: "trading", label: "Trading Coins" },
    { id: "nft", label: "NFTs" },
    { id: "trending", label: "Trending" }
  ];

  const filteredProjects = mockProjects.filter(project => {
    const matchesSearch = project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         project.ticker.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (activeFilter === "all") return matchesSearch;
    if (activeFilter === "fun") return matchesSearch && project.type === "Fun Coin";
    if (activeFilter === "trading") return matchesSearch && project.type === "Trading Coin";
    if (activeFilter === "nft") return matchesSearch && project.type === "NFT";
    if (activeFilter === "trending") return matchesSearch && parseFloat(project.change) > 10;
    
    return matchesSearch;
  });

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
          {filteredProjects.map((project) => (
            <Card key={project.id} className="bg-avalanche-gray-dark border-avalanche-gray-medium hover:border-avalanche-red transition-colors cursor-pointer">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="text-2xl">{project.image}</div>
                    <div>
                      <CardTitle className="text-white text-lg">{project.name}</CardTitle>
                      <p className="text-gray-400 text-sm">{project.ticker}</p>
                    </div>
                  </div>
                  <Badge 
                    variant="outline" 
                    className={
                      project.type === "Fun Coin" 
                        ? "border-blue-500 text-blue-400" 
                        : project.type === "Trading Coin"
                        ? "border-green-500 text-green-400"
                        : "border-purple-500 text-purple-400"
                    }
                  >
                    {project.type}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <div className="text-gray-400">Price</div>
                    <div className="text-white font-semibold">{project.price}</div>
                  </div>
                  <div>
                    <div className="text-gray-400">24h Change</div>
                    <div className={`font-semibold ${
                      project.change.startsWith('+') ? 'text-green-400' : 'text-red-400'
                    }`}>
                      {project.change}
                    </div>
                  </div>
                  <div className="col-span-2">
                    <div className="text-gray-400">Volume</div>
                    <div className="text-white font-semibold">{project.volume}</div>
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
          ))}
        </div>

        {filteredProjects.length === 0 && (
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
