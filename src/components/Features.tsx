
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const Features = () => {
  const features = [
    {
      title: "Fun Coins",
      subtitle: "Perfect for Memes",
      description: "Create viral meme tokens with built-in social features, community tools, and gamification elements.",
      features: ["Instant Social Integration", "Meme Templates", "Community Rewards", "Viral Mechanics"],
      gradient: "from-purple-400 to-pink-400",
      emoji: "🎉"
    },
    {
      title: "Trading Coins",
      subtitle: "Built for Business",
      description: "Professional-grade tokens with advanced tokenomics, governance features, and institutional-ready infrastructure.",
      features: ["Advanced Tokenomics", "Governance Tools", "Staking Mechanisms", "Liquidity Management"],
      gradient: "from-frost-400 to-blue-500",
      emoji: "💼"
    }
  ];

  const platformFeatures = [
    {
      icon: "🚀",
      title: "No-Code Creation",
      description: "Build complex Web3 projects without writing a single line of code"
    },
    {
      icon: "❄️",
      title: "Avalanche Native",
      description: "Lightning-fast transactions with minimal fees on Avalanche network"
    },
    {
      icon: "💎",
      title: "$ENA Token Utility",
      description: "Stake $ENA for premium features, reduced fees, and exclusive access"
    },
    {
      icon: "🔒",
      title: "Audit-Ready Smart Contracts",
      description: "Battle-tested, secure smart contracts deployed automatically"
    },
    {
      icon: "📊",
      title: "Built-in Analytics",
      description: "Real-time dashboards to track your project's performance"
    },
    {
      icon: "🌐",
      title: "Multi-Chain Ready",
      description: "Future-proof architecture supports cross-chain expansion"
    }
  ];

  return (
    <section className="py-20 bg-gradient-to-br from-frost-50 to-ice-100">
      <div className="container mx-auto px-4">
        {/* Token Types */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-ice-800 mb-6">
            Choose Your Launch Style
          </h2>
          <p className="text-xl text-ice-600 max-w-3xl mx-auto">
            Whether you're creating the next viral meme coin or building a serious DeFi project, 
            FrostMint has the perfect tools for your vision.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-20 max-w-6xl mx-auto">
          {features.map((feature, index) => (
            <Card key={index} className="border-2 border-frost-200 hover:border-frost-400 transition-all duration-300 hover:shadow-2xl bg-white rounded-3xl overflow-hidden group">
              <CardHeader className={`bg-gradient-to-r ${feature.gradient} text-white p-8`}>
                <div className="flex items-center mb-4">
                  <span className="text-4xl mr-4 group-hover:scale-110 transition-transform duration-300">
                    {feature.emoji}
                  </span>
                  <div>
                    <CardTitle className="text-2xl font-bold">{feature.title}</CardTitle>
                    <p className="text-white/90 font-medium">{feature.subtitle}</p>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="p-8">
                <p className="text-ice-600 mb-6 text-lg leading-relaxed">
                  {feature.description}
                </p>
                
                <div className="space-y-3">
                  {feature.features.map((item, idx) => (
                    <div key={idx} className="flex items-center">
                      <div className="w-2 h-2 bg-frost-500 rounded-full mr-3"></div>
                      <span className="text-ice-700 font-medium">{item}</span>
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
                <div className="text-4xl mb-4 group-hover:scale-110 transition-transform duration-300">
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
