
import { Card, CardContent } from "@/components/ui/card";

const HowItWorks = () => {
  const steps = [
    {
      icon: "🎯",
      title: "Choose Your Launch Type",
      description: "Pick between a Fun Coin, a Trading Coin, or a Basic NFT Drop. Fun Coins are for community vibes. Trading Coins come with liquidity tools."
    },
    {
      icon: "🎨",
      title: "Customize Your Token or NFT",
      description: "Set your name, symbol, supply (for tokens), or upload media (for NFTs). Our contracts do the heavy lifting."
    },
    {
      icon: "🚀",
      title: "Mint & Share",
      description: "Launch instantly on Avalanche. Share with your community or list on a DEX."
    }
  ];

  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-ice-800 mb-6">
            How It Works
          </h2>
          <p className="text-xl text-ice-600 max-w-2xl mx-auto">
            Launch your Web3 project in three simple steps. No technical knowledge required.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {steps.map((step, index) => (
            <Card 
              key={index} 
              className="border-2 border-frost-200 hover:border-frost-400 transition-all duration-300 hover:shadow-xl bg-gradient-to-br from-white to-frost-50 rounded-3xl group"
            >
              <CardContent className="p-8 text-center">
                <div className="text-6xl mb-6 group-hover:scale-110 transition-transform duration-300">
                  {step.icon}
                </div>
                
                <div className="flex items-center justify-center mb-4">
                  <div className="bg-frost-500 text-white w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold mr-3">
                    {index + 1}
                  </div>
                  <h3 className="text-xl font-bold text-ice-800">
                    {step.title}
                  </h3>
                </div>
                
                <p className="text-ice-600 leading-relaxed">
                  {step.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
        
        {/* Connection lines for desktop */}
        <div className="hidden md:flex justify-center items-center mt-12">
          <div className="flex items-center space-x-8">
            <div className="w-24 h-1 bg-gradient-to-r from-frost-300 to-frost-500 rounded-full"></div>
            <div className="w-24 h-1 bg-gradient-to-r from-frost-300 to-frost-500 rounded-full"></div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
