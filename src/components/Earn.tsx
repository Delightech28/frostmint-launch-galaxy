
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const Earn = () => {
  const earnings = [
    {
      title: "Creators",
      subtitle: "Build & Earn",
      icon: "🎨",
      benefits: [
        "Keep 100% of token sales revenue",
        "Earn from trading fees (0.3% per transaction)",
        "Get community tips and donations",
        "Access premium creation tools with $ENA staking"
      ],
      highlight: "Up to $10K+/month for successful projects"
    },
    {
      title: "Communities",
      subtitle: "Engage & Profit",
      icon: "🤝",
      benefits: [
        "Stake community tokens for passive income",
        "Participate in governance decisions",
        "Earn rewards for social engagement",
        "Get early access to new token launches"
      ],
      highlight: "15-25% APY on community staking"
    },
    {
      title: "$ENA Holders",
      subtitle: "Stake & Multiply",
      icon: "💎",
      benefits: [
        "Reduced platform fees (up to 75% discount)",
        "Premium analytics and insights",
        "Early access to new features",
        "Revenue sharing from platform growth"
      ],
      highlight: "20-40% APY + platform revenue share"
    }
  ];

  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-ice-800 mb-6">
            Earn with FrostMint
          </h2>
          <p className="text-xl text-ice-600 max-w-3xl mx-auto">
            Multiple revenue streams for creators, communities, and token holders. 
            Turn your creativity and participation into real income.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-7xl mx-auto mb-16">
          {earnings.map((earning, index) => (
            <Card key={index} className="border-2 border-frost-200 hover:border-frost-400 transition-all duration-300 hover:shadow-xl bg-gradient-to-br from-white to-frost-50 rounded-3xl group">
              <CardHeader className="text-center p-8">
                <div className="text-5xl mb-4 group-hover:scale-110 transition-transform duration-300">
                  {earning.icon}
                </div>
                <CardTitle className="text-2xl font-bold text-ice-800 mb-2">
                  {earning.title}
                </CardTitle>
                <p className="text-frost-600 font-medium">
                  {earning.subtitle}
                </p>
              </CardHeader>
              
              <CardContent className="p-8 pt-0">
                <div className="bg-frost-100 rounded-2xl p-4 mb-6 text-center">
                  <p className="text-frost-700 font-bold text-lg">
                    {earning.highlight}
                  </p>
                </div>
                
                <div className="space-y-4">
                  {earning.benefits.map((benefit, idx) => (
                    <div key={idx} className="flex items-start">
                      <div className="w-2 h-2 bg-frost-500 rounded-full mr-3 mt-2 flex-shrink-0"></div>
                      <span className="text-ice-700 leading-relaxed">{benefit}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Call to Action */}
        <div className="text-center bg-gradient-to-r from-frost-500 to-frost-600 rounded-3xl p-12 max-w-4xl mx-auto">
          <h3 className="text-3xl font-bold text-white mb-4">
            Ready to Start Earning?
          </h3>
          <p className="text-frost-100 text-lg mb-8 max-w-2xl mx-auto">
            Join thousands of creators and communities already earning with FrostMint. 
            Launch your first project today and start building your Web3 income stream.
          </p>
          <Button 
            size="lg"
            className="bg-white text-frost-600 hover:bg-frost-50 px-8 py-4 rounded-2xl text-lg font-semibold shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300"
          >
            Start Earning Now 🚀
          </Button>
        </div>
      </div>
    </section>
  );
};

export default Earn;
