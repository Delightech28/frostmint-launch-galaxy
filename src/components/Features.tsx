
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Snowflake, Coins, Palette, ChartLine, Zap, Users } from "lucide-react";

const Features = () => {
  const launchOptions = [
    {
      title: "Fun Coins",
      subtitle: "For Memes",
      description: "Meme-friendly social tokens perfect for community engagement without trading complexity.",
      features: ["Meme Templates", "Community Tipping", "Shareable Links"],
      icon: <Users className="w-8 h-8 text-white" />,
      bgColor: "bg-avalanche-red"
    },
    {
      title: "Trading Coins", 
      subtitle: "For Business",
      description: "Professional tokens with DEX integration and liquidity tools for serious projects.",
      features: ["Add Liquidity", "Trade on DEXs", "Advanced Analytics"],
      icon: <ChartLine className="w-8 h-8 text-white" />,
      bgColor: "bg-black"
    },
    {
      title: "NFT Collections",
      subtitle: "For Creators", 
      description: "Launch basic NFT collections with custom artwork and community minting features.",
      features: ["Custom Artwork", "Community Minting", "Creator Tools"],
      icon: <Palette className="w-8 h-8 text-white" />,
      bgColor: "bg-avalanche-gray-dark"
    }
  ];

  const platformFeatures = [
    {
      icon: <Snowflake className="w-8 h-8 text-white" />,
      title: "No-Code Minting",
      description: "Build complex Web3 projects without writing a single line of code"
    },
    {
      icon: <Zap className="w-8 h-8 text-white" />,
      title: "AVAX Integration", 
      description: "Lightning-fast transactions with minimal fees on Avalanche"
    },
    {
      icon: <Coins className="w-8 h-8 text-white" />,
      title: "$ENA Token Utility",
      description: "Enhanced features and reduced fees for $ENA token holders"
    },
    {
      icon: <ChartLine className="w-8 h-8 text-white" />,
      title: "Fast Mint Times",
      description: "Deploy your tokens and NFTs in under 60 seconds"
    },
    {
      icon: <Users className="w-8 h-8 text-white" />,
      title: "Community Tools",
      description: "Built-in features for community engagement and growth"
    }
  ];

  return (
    <section className="py-20 bg-black">
      <div className="container mx-auto px-4">
        {/* Launch Options */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Launch Options
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Choose the perfect launch type for your Web3 project goals.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-20 max-w-7xl mx-auto">
          {launchOptions.map((option, index) => (
            <Card key={index} className="bg-white border-2 border-gray-200 hover:border-avalanche-red transition-all duration-300 hover:shadow-2xl rounded-xl overflow-hidden group">
              <CardHeader className={`${option.bgColor} text-white p-6`}>
                <div className="flex items-center mb-4">
                  <div className="mr-4 group-hover:scale-110 transition-transform duration-300">
                    {option.icon}
                  </div>
                  <div>
                    <CardTitle className="text-2xl font-bold">{option.title}</CardTitle>
                    <p className="text-white/90 font-medium">{option.subtitle}</p>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="p-6">
                <p className="text-avalanche-gray-light mb-6 text-lg leading-relaxed">
                  {option.description}
                </p>
                
                <div className="space-y-3">
                  {option.features.map((feature, idx) => (
                    <div key={idx} className="flex items-center">
                      <div className="w-2 h-2 bg-avalanche-red rounded-full mr-3"></div>
                      <span className="text-black font-medium">{feature}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Platform Features */}
        <div className="text-center mb-16">
          <h3 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Platform Features
          </h3>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Everything you need to launch, manage, and scale your Web3 project.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {platformFeatures.map((feature, index) => (
            <Card key={index} className="bg-avalanche-gray-dark border border-avalanche-red hover:shadow-lg transition-all duration-300 rounded-xl group">
              <CardContent className="p-6 text-center">
                <div className="mb-4 group-hover:scale-110 transition-transform duration-300 flex justify-center">
                  {feature.icon}
                </div>
                <h4 className="text-lg font-bold text-white mb-3">
                  {feature.title}
                </h4>
                <p className="text-gray-300 text-sm leading-relaxed">
                  {feature.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
