
import { Button } from "@/components/ui/button";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useWallet } from "@/contexts/WalletContext";
import { Rocket, Compass, Coins, Bell, Wallet, AlertTriangle, ChevronDown } from "lucide-react";
import { Link, useLocation } from "react-router-dom";

const Navigation = () => {
  const { isConnected, address, disconnect, isCorrectNetwork, switchToAvalanche } = useWallet();
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
            {/* Network Warning */}
            {isConnected && !isCorrectNetwork && (
              <Button
                variant="outline"
                size="sm"
                onClick={switchToAvalanche}
                className="border-yellow-500 text-yellow-500 hover:bg-yellow-500 hover:text-black flex items-center space-x-1"
              >
                <AlertTriangle className="h-3 w-3" />
                <span className="hidden sm:inline">Switch to Fuji</span>
              </Button>
            )}

            {/* Notifications */}
            {isConnected && (
              <Button variant="ghost" size="icon" className="text-white hover:bg-avalanche-gray-dark">
                <Bell className="h-4 w-4" />
              </Button>
            )}
            
            {/* Wallet Connection */}
            {isConnected ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    className="border-avalanche-red text-white hover:bg-avalanche-gray-dark flex items-center space-x-2"
                  >
                    <Wallet className="h-4 w-4" />
                    <span className="hidden sm:inline">{formatAddress(address!)}</span>
                    <ChevronDown className="h-3 w-3" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="bg-avalanche-gray-dark border-avalanche-gray-medium">
                  <DropdownMenuItem 
                    onClick={disconnect}
                    className="text-red-400 hover:bg-avalanche-gray-medium cursor-pointer"
                  >
                    Disconnect Wallet
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Link to="/login">
                <Button className="bg-avalanche-red hover:bg-avalanche-red-dark text-white flex items-center space-x-2">
                  <Wallet className="h-4 w-4" />
                  <span>Connect Wallet</span>
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
