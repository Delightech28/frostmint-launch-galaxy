
import { Button } from "@/components/ui/button";
import { Rocket, Compass } from "lucide-react";
import { Link } from "react-router-dom";

const Hero = () => {
  return (
    <div className="relative min-h-screen bg-black flex items-center justify-center overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-red-glow blur-3xl opacity-30"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-red-glow blur-3xl opacity-20"></div>
      </div>
      
      <div className="container mx-auto px-4 text-center relative z-10">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
            Create Web3 Magic in <span className="text-avalanche-red">Seconds</span>
          </h1>
          
          <p className="text-xl md:text-2xl text-gray-300 mb-12 max-w-3xl mx-auto leading-relaxed">
            Launch your meme coin or NFT on Avalanche without code. Fast. Easy. Onchain.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
            <Link to="/launch">
              <Button 
                size="lg" 
                className="bg-avalanche-red hover:bg-avalanche-red-dark text-white px-8 py-4 text-lg font-semibold flex items-center space-x-3 min-w-[180px]"
              >
                <Rocket className="h-5 w-5 text-white" />
                <span className="text-white">Launch Now</span>
              </Button>
            </Link>
            
            <Link to="/explore">
              <Button 
                variant="outline" 
                size="lg" 
                className="border-2 border-white text-white hover:bg-white hover:text-black px-8 py-4 text-lg font-semibold flex items-center space-x-3 min-w-[180px] bg-transparent"
              >
                <Compass className="h-5 w-5" />
                <span>Explore Tokens</span>
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hero;
