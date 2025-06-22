
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, Coins } from "lucide-react";

const Earn = () => {
  const earnings = [
    {
      title: "For Creators & Communities",
      icon: <Users className="w-12 h-12 text-white" />,
      benefits: [
        "Engage users with trading fees and liquidity rewards",
        "Build social and financial capital on Avalanche", 
        "Community-driven token economics"
      ]
    },
    {
      title: "For $ENA Token Holders",
      icon: <Coins className="w-12 h-12 text-white" />,
      benefits: [
        "Enhanced features and reduced platform fees",
        "Priority access to new launches",
        "Revenue sharing from platform growth"
      ]
    }
  ];

  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-black mb-6">
            Earn with FrostMint
          </h2>
          <p className="text-xl text-avalanche-gray-light max-w-3xl mx-auto">
            Whether you're a creator or community builder, FrostMint helps you grow and earn onchain.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-5xl mx-auto mb-16">
          {earnings.map((earning, index) => (
            <Card key={index} className="bg-black border-2 border-avalanche-red hover:shadow-xl transition-all duration-300 rounded-xl group">
              <CardHeader className="text-center p-8">
                <div className="mb-4 group-hover:scale-110 transition-transform duration-300 flex justify-center">
                  {earning.icon}
                </div>
                <CardTitle className="text-2xl font-bold text-white">
                  {earning.title}
                </CardTitle>
              </CardHeader>
              
              <CardContent className="p-8 pt-0">
                <div className="space-y-4">
                  {earning.benefits.map((benefit, idx) => (
                    <div key={idx} className="flex items-start">
                      <div className="w-2 h-2 bg-avalanche-red rounded-full mr-3 mt-2 flex-shrink-0"></div>
                      <span className="text-gray-300 leading-relaxed">{benefit}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Call to Action */}
        <div className="text-center bg-avalanche-red rounded-xl p-12 max-w-4xl mx-auto animate-glow">
          <h3 className="text-3xl font-bold text-white mb-4">
            Ready to Start Earning?
          </h3>
          <p className="text-white/90 text-lg mb-8 max-w-2xl mx-auto">
            Join thousands of creators and communities already earning with FrostMint. 
            Launch your first project today.
          </p>
          <Button 
            size="lg"
            className="bg-white text-avalanche-red hover:bg-gray-100 px-8 py-4 rounded-xl text-lg font-semibold shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300"
          >
            Start Earning Now
          </Button>
        </div>
      </div>
    </section>
  );
};

export default Earn;
