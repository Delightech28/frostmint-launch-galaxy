import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Snowflake, Coins, Palette, ChartLine } from "lucide-react";

const Features = () => {
  const launchStyles = [
    {
      title: "Fun Coins",
      subtitle: "For Memes",
      description: "Launch viral tokens that bring your meme to life. No trading required.",
      features: ["Meme Templates", "Community Tipping", "Shareable Links"],
      gradient: "from-purple-400 to-pink-400",
      emoji: "🎉"
    },
    {
      title: "Trading Coins",
      subtitle: "For Business",
      description: "Create fully tradable tokens and instantly add liquidity via DEX integrations.",
      features: ["AVAX + Token LP Support", "Price Charts & Volume", "Token Ownership Tools"],
      gradient: "from-frost-400 to-blue-500",
      emoji: "💼"
    },
    {
      title: "NFT Collections",
      subtitle: "For Creators",
      description: "Mint basic NFT drops with your image, name, and quantity.",
      features: ["Community Minting", "NFT Explorer Pages", "Creator-First Focus"],
      gradient: "from-green-400 to-teal-500",
      emoji: "🎨"
    }
  ];

  const platformFeatures = [
    {
      icon: <Snowflake className="w-8 h-8" />,
      title: "No-Code Token & NFT Creation",
      description: "Build complex Web3 projects without writing a single line of code"
    },
    {
      icon: <Coins className="w-8 h-8" />,
      title: "Dual Modes: Fun or Tradable",
      description: "Choose the perfect token type for your project goals"
    },
    {
      icon: <ChartLine className="w-8 h-8" />,
      title: "Add Liquidity for Trading Coins",
      description: "Instant DEX integration for serious trading projects"
    },
    {
      icon: <Palette className="w-8 h-8" />,
      title: "$ENA Integration for Premium Tools",
      description: "Coming Soon: Enhanced features for $ENA holders"
    },
    {
      icon: <Snowflake className="w-8 h-8" />,
      title: "Avalanche Subnet Ready",
      description: "Lightning-fast transactions with minimal fees"
    },
    {
      icon: <Coins className="w-8 h-8" />,
      title: "Gasless Minting Support",
      description: "Future: Remove barriers with sponsored transactions"
    }
  ];

  return (
    <section className="py-20 bg-gradient-to-br from-frost-50 to-ice-100">
      <div className="container mx-auto px-4">
        {/* Launch Styles */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-ice-800 mb-6">
            Launch Styles
          </h2>
          <p className="text-xl text-ice-600 max-w-3xl mx-auto">
            Whether you're creating the next viral meme coin or building a serious project, 
            FrostMint has the perfect tools for your vision.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-20 max-w-7xl mx-auto">
          {launchStyles.map((style, index) => (
            <Card key={index} className="border-2 border-frost-200 hover:border-frost-400 transition-all duration-300 hover:shadow-2xl bg-white rounded-3xl overflow-hidden group">
              <CardHeader className={`bg-gradient-to-r ${style.gradient} text-white p-6`}>
                <div className="flex items-center mb-4">
                  <span className="text-4xl mr-4 group-hover:scale-110 transition-transform duration-300">
                    {style.emoji}
                  </span>
                  <div>
                    <CardTitle className="text-2xl font-bold">{style.title}</CardTitle>
                    <p className="text-white/90 font-medium">{style.subtitle}</p>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="p-6">
                <p className="text-ice-600 mb-6 text-lg leading-relaxed">
                  {style.description}
                </p>
                
                <div className="space-y-3">
                  {style.features.map((feature, idx) => (
                    <div key={idx} className="flex items-center">
                      <div className="w-2 h-2 bg-frost-500 rounded-full mr-3"></div>
                      <span className="text-ice-700 font-medium">✅ {feature}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Platform Features */}
        <div className="text-center mb-16">
          <h3 className="text-3xl md:text-4xl font-bold text-ice-800 mb-6">
            Platform Features
          </h3>
          <p className="text-xl text-ice-600 max-w-2xl mx-auto">
            Everything you need to launch, manage, and scale your Web3 project.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {platformFeatures.map((feature, index) => (
            <Card key={index} className="border border-frost-200 hover:border-frost-400 transition-all duration-300 hover:shadow-lg bg-white/80 backdrop-blur-sm rounded-2xl group">
              <CardContent className="p-6 text-center">
                <div className="text-frost-500 mb-4 group-hover:scale-110 transition-transform duration-300 flex justify-center">
                  {feature.icon}
                </div>
                <h4 className="text-lg font-bold text-ice-800 mb-3">
                  {feature.title}
                </h4>
                <p className="text-ice-600 text-sm leading-relaxed">
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
