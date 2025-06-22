
import { Button } from "@/components/ui/button";
import { MessageCircle } from "lucide-react";

const JoinCommunity = () => {
  return (
    <section className="py-20 bg-black relative overflow-hidden">
      {/* Background glow effect */}
      <div className="absolute inset-0">
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-red-glow blur-3xl opacity-40"></div>
      </div>
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center max-w-4xl mx-auto">
          <div className="mb-8 flex justify-center">
            <div className="bg-avalanche-red p-6 rounded-full animate-glow">
              <MessageCircle className="w-16 h-16 text-white" />
            </div>
          </div>
          
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Join Our Community
          </h2>
          
          <p className="text-xl text-gray-300 mb-12 max-w-2xl mx-auto leading-relaxed">
            Connect with creators, share your projects, and get support from the FrostMint community on Discord.
          </p>
          
          <Button 
            size="lg"
            className="bg-avalanche-red hover:bg-avalanche-red-dark text-white px-12 py-6 rounded-xl text-xl font-semibold shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300 border-2 border-avalanche-red hover:border-white"
          >
            <MessageCircle className="mr-3 h-6 w-6" />
            Join Our Discord
          </Button>
        </div>
      </div>
    </section>
  );
};

export default JoinCommunity;
