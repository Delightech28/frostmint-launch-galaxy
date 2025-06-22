
import { Card, CardContent } from "@/components/ui/card";
import { Target, Palette, Rocket } from "lucide-react";

const HowItWorks = () => {
  const steps = [
    {
      icon: <Target className="w-8 h-8 text-white" />,
      number: "1",
      title: "Choose Launch Type",
      description: "Pick between Fun Coin, Trading Coin, or NFT Collection based on your project goals."
    },
    {
      icon: <Palette className="w-8 h-8 text-white" />,
      number: "2", 
      title: "Customize Your Token or Collection",
      description: "Set your name, symbol, supply, or upload media. Our smart contracts handle the rest."
    },
    {
      icon: <Rocket className="w-8 h-8 text-white" />,
      number: "3",
      title: "Mint & Share on Avalanche",
      description: "Launch instantly and share with your community or list on decentralized exchanges."
    }
  ];

  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-black mb-6">
            How It Works
          </h2>
          <p className="text-xl text-avalanche-gray-light max-w-3xl mx-auto">
            Launch your Web3 project in three simple steps. No technical knowledge required.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {steps.map((step, index) => (
            <Card 
              key={index} 
              className="bg-black border-2 border-avalanche-red hover:shadow-xl transition-all duration-300 rounded-xl group"
            >
              <CardContent className="p-8 text-center">
                <div className="bg-avalanche-red w-12 h-12 rounded-full flex items-center justify-center text-white text-xl font-bold mb-6 mx-auto">
                  {step.number}
                </div>
                
                <div className="mb-6 flex justify-center">
                  {step.icon}
                </div>
                
                <h3 className="text-xl font-bold text-white mb-4">
                  {step.title}
                </h3>
                
                <p className="text-gray-300 leading-relaxed">
                  {step.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
