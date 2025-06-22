
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

const Hero = () => {
  return (
    <section className="min-h-screen flex items-center justify-center bg-gradient-to-br from-frost-50 via-white to-frost-100 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-10 w-72 h-72 bg-frost-200/30 rounded-full blur-3xl animate-float"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-frost-300/20 rounded-full blur-3xl animate-float" style={{animationDelay: '1s'}}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-radial from-frost-100/40 to-transparent rounded-full blur-2xl"></div>
      </div>
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center max-w-5xl mx-auto">
          {/* Badge */}
          <div className="inline-flex items-center px-4 py-2 bg-frost-100 border border-frost-200 rounded-full text-frost-700 text-sm font-medium mb-8 animate-shimmer bg-[length:200%_100%] bg-gradient-to-r from-frost-100 via-white to-frost-100">
            ❄️ Built for creators, meme lovers, and onchain culture
          </div>
          
          {/* Main headline */}
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold bg-gradient-to-r from-frost-700 via-frost-600 to-frost-800 bg-clip-text text-transparent mb-6 leading-tight">
            Create Web3 Magic
            <br />
            <span className="text-frost-500">in Seconds</span>
          </h1>
          
          {/* Subheadline */}
          <p className="text-xl md:text-2xl text-ice-600 mb-12 max-w-3xl mx-auto leading-relaxed">
            FrostMint is the no-code launchpad for Avalanche. Launch your own meme coin or NFT collection — in under 60 seconds. No coding. Just vibes.
          </p>
          
          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
            <Button 
              size="lg" 
              className="bg-gradient-to-r from-frost-500 to-frost-600 hover:from-frost-600 hover:to-frost-700 text-white px-8 py-4 rounded-2xl text-lg font-semibold shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300 border-0"
            >
              Launch Now ❄️
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            
            <Button 
              variant="outline" 
              size="lg"
              className="border-2 border-frost-300 text-frost-700 hover:bg-frost-50 px-8 py-4 rounded-2xl text-lg font-semibold hover:border-frost-400 transition-all duration-300"
            >
              Explore Tokens 🚀
            </Button>
          </div>
          
          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-2xl mx-auto">
            <div className="text-center">
              <div className="text-3xl font-bold text-frost-600 mb-2">10,000+</div>
              <div className="text-ice-500 font-medium">Tokens Minted</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-frost-600 mb-2">5,000+</div>
              <div className="text-ice-500 font-medium">Creators Onboarded</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-frost-600 mb-2">$2M+</div>
              <div className="text-ice-500 font-medium">Onchain Value Launched</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
