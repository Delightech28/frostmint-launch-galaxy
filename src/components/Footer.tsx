
import { Button } from "@/components/ui/button";

const Footer = () => {
  const socialLinks = [
    { name: "Twitter", icon: "🐦", href: "#" },
    { name: "Discord", icon: "💬", href: "#" },
    { name: "Telegram", icon: "📱", href: "#" },
    { name: "Medium", icon: "📝", href: "#" }
  ];

  const quickLinks = [
    { name: "How It Works", href: "#how-it-works" },
    { name: "Features", href: "#features" },
    { name: "Pricing", href: "#pricing" },
    { name: "FAQ", href: "#faq" }
  ];

  const resources = [
    { name: "Documentation", href: "#" },
    { name: "API Reference", href: "#" },
    { name: "Tutorials", href: "#" },
    { name: "Community", href: "#" }
  ];

  const legal = [
    { name: "Privacy Policy", href: "#" },
    { name: "Terms of Service", href: "#" },
    { name: "Cookie Policy", href: "#" },
    { name: "Disclaimer", href: "#" }
  ];

  return (
    <footer className="bg-gradient-to-br from-ice-900 via-ice-800 to-frost-900 text-white py-16">
      <div className="container mx-auto px-4">
        {/* Main footer content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 mb-12">
          {/* Brand section */}
          <div className="lg:col-span-2">
            <div className="flex items-center mb-6">
              <div className="text-3xl font-bold bg-gradient-to-r from-frost-300 to-white bg-clip-text text-transparent">
                ❄️ FrostMint
              </div>
            </div>
            <p className="text-ice-300 mb-6 leading-relaxed max-w-md">
              The ultimate no-code Web3 launchpad. Create meme coins and NFTs on Avalanche in seconds, without writing a single line of code.
            </p>
            <div className="flex space-x-4">
              {socialLinks.map((social, index) => (
                <Button
                  key={index}
                  variant="outline"
                  size="sm"
                  className="border-ice-600 text-ice-300 hover:bg-frost-700 hover:border-frost-500 hover:text-white transition-all duration-300 rounded-xl"
                >
                  {social.icon}
                </Button>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-bold text-white mb-4">Quick Links</h4>
            <ul className="space-y-2">
              {quickLinks.map((link, index) => (
                <li key={index}>
                  <a 
                    href={link.href}
                    className="text-ice-300 hover:text-frost-300 transition-colors duration-300"
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h4 className="font-bold text-white mb-4">Resources</h4>
            <ul className="space-y-2">
              {resources.map((resource, index) => (
                <li key={index}>
                  <a 
                    href={resource.href}
                    className="text-ice-300 hover:text-frost-300 transition-colors duration-300"
                  >
                    {resource.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="font-bold text-white mb-4">Legal</h4>
            <ul className="space-y-2">
              {legal.map((item, index) => (
                <li key={index}>
                  <a 
                    href={item.href}
                    className="text-ice-300 hover:text-frost-300 transition-colors duration-300"
                  >
                    {item.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Newsletter signup */}
        <div className="border-t border-ice-700 pt-8 mb-8">
          <div className="max-w-md mx-auto lg:mx-0">
            <h4 className="font-bold text-white mb-4">Stay Updated</h4>
            <p className="text-ice-300 mb-4">Get the latest updates on new features and token launches.</p>
            <div className="flex gap-2">
              <input 
                type="email" 
                placeholder="Enter your email"
                className="flex-1 px-4 py-2 bg-ice-800 border border-ice-600 rounded-xl text-white placeholder-ice-400 focus:outline-none focus:border-frost-500 transition-colors"
              />
              <Button className="bg-frost-500 hover:bg-frost-600 text-white rounded-xl px-6">
                Subscribe
              </Button>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-ice-700 pt-8 flex flex-col md:flex-row justify-between items-center">
          <div className="text-ice-400 text-sm mb-4 md:mb-0">
            © 2024 FrostMint. All rights reserved. Built on Avalanche ⛰️
          </div>
          <div className="flex items-center space-x-4 text-ice-400 text-sm">
            <span>Powered by Avalanche</span>
            <div className="w-1 h-1 bg-ice-500 rounded-full"></div>
            <span>Secured by Web3</span>
            <div className="w-1 h-1 bg-ice-500 rounded-full"></div>
            <span>Built with ❤️</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
