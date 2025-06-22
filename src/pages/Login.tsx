
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useWallet } from "@/contexts/WalletContext";
import { Wallet } from "lucide-react";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const { isConnected, connect } = useWallet();
  const navigate = useNavigate();

  useEffect(() => {
    if (isConnected) {
      navigate("/dashboard");
    }
  }, [isConnected, navigate]);

  return (
    <div className="min-h-screen bg-black flex items-center justify-center relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-red-glow blur-3xl opacity-30"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-red-glow blur-3xl opacity-20"></div>
      </div>
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-md mx-auto text-center">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-white mb-4">FrostMint</h1>
            <p className="text-gray-300 text-lg">
              Connect wallet to start launching meme coins & NFTs
            </p>
          </div>
          
          <Card className="bg-avalanche-gray-dark border-avalanche-red">
            <CardContent className="p-8">
              <div className="mb-6">
                <div className="bg-avalanche-red p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                  <Wallet className="h-8 w-8 text-white" />
                </div>
                <h2 className="text-xl font-semibold text-white mb-2">Connect Your Wallet</h2>
                <p className="text-gray-400 text-sm">
                  Connect your Avalanche wallet to access the FrostMint launchpad
                </p>
              </div>
              
              <Button
                onClick={connect}
                size="lg"
                className="w-full bg-avalanche-red hover:bg-avalanche-red-dark text-white"
              >
                <Wallet className="mr-2 h-5 w-5" />
                Connect Wallet
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Login;
