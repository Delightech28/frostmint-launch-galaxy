
import { Button } from "@/components/ui/button";
import { useWallet } from "@/contexts/WalletContext";
import { Rocket, Compass, Coins, Bell, Wallet } from "lucide-react";
import { Link, useLocation } from "react-router-dom";

const Navigation = () => {
  const { isConnected, address, disconnect } = useWallet();
  const location = useLocation();

  const navItems = [
    { icon: Rocket, label: "Launch", path: "/launch" },
    { icon: Compass, label: "Explore", path: "/explore" },
    { icon: Coins, label: "Earn", path: "/earn" },
  ];

  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  return (
    <nav className="bg-black border-b border-avalanche-red">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="text-2xl font-bold text-white">
            FrostMint
          </Link>

          {/* Navigation Items */}
          <div className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center space-x-2 px-3 py-2 rounded-md transition-colors ${
                  location.pathname === item.path
                    ? "bg-avalanche-red text-white"
                    : "text-gray-300 hover:text-white hover:bg-avalanche-gray-dark"
                }`}
              >
                <item.icon className="h-4 w-4" />
                <span>{item.label}</span>
              </Link>
            ))}
          </div>

          {/* Right side */}
          <div className="flex items-center space-x-4">
            {isConnected && (
              <Button variant="ghost" size="icon" className="text-white hover:bg-avalanche-gray-dark">
                <Bell className="h-4 w-4" />
              </Button>
            )}
            
            {isConnected ? (
              <div className="flex items-center space-x-2">
                <div className="flex items-center space-x-2 px-3 py-2 bg-avalanche-gray-dark rounded-md">
                  <Wallet className="h-4 w-4 text-white" />
                  <span className="text-white text-sm">{formatAddress(address!)}</span>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={disconnect}
                  className="border-avalanche-red text-avalanche-red hover:bg-avalanche-red hover:text-white"
                >
                  Disconnect
                </Button>
              </div>
            ) : (
              <Link to="/login">
                <Button className="bg-avalanche-red hover:bg-avalanche-red-dark text-white">
                  Connect Wallet
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
