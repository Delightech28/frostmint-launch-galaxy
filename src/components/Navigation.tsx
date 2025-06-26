
import { Button } from "@/components/ui/button";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useWallet } from "@/contexts/WalletContext";
import { Rocket, Compass, Coins, Wallet, ChevronDown, Loader2, LayoutDashboard } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import NotificationDropdown from "@/components/NotificationDropdown";

const Navigation = () => {
  const { isConnected, address, disconnect, connect, isConnecting } = useWallet();
  const location = useLocation();

  const navItems = [
    { icon: Rocket, label: "Launch", path: "/launch" },
    { icon: Compass, label: "Explore", path: "/explore" },
    { icon: Coins, label: "Earn", path: "/earn" },
  ];

  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  const handleConnect = async () => {
    await connect();
  };

  return (
    <nav className="bg-black border-b border-avalanche-red sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="text-2xl font-bold text-white hover:text-avalanche-red transition-colors">
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
            {/* Notifications */}
            {isConnected && <NotificationDropdown />}
            
            {/* Wallet Connection */}
            {isConnected ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="text-white hover:bg-avalanche-gray-dark bg-avalanche-gray-dark flex items-center space-x-2 border border-avalanche-red hover:border-avalanche-red-dark transition-all duration-200"
                  >
                    <Wallet className="h-4 w-4" />
                    <span className="hidden sm:inline font-mono">{formatAddress(address!)}</span>
                    <ChevronDown className="h-3 w-3" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent 
                  align="end" 
                  className="bg-avalanche-gray-dark border-avalanche-gray-medium shadow-xl"
                >
                  <DropdownMenuItem asChild>
                    <Link 
                      to="/dashboard"
                      className="text-white hover:bg-avalanche-gray-medium cursor-pointer flex items-center focus:bg-avalanche-gray-medium"
                    >
                      <LayoutDashboard className="h-4 w-4 mr-2" />
                      Dashboard
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={disconnect}
                    className="text-red-400 hover:bg-avalanche-gray-medium cursor-pointer focus:bg-avalanche-gray-medium"
                  >
                    <Wallet className="h-4 w-4 mr-2" />
                    Disconnect Wallet
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button
                onClick={handleConnect}
                disabled={isConnecting}
                className="bg-avalanche-red hover:bg-avalanche-red-dark text-white flex items-center space-x-2 transition-all duration-200"
              >
                {isConnecting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Connecting...</span>
                  </>
                ) : (
                  <>
                    <Wallet className="h-4 w-4" />
                    <span>Connect Wallet</span>
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
