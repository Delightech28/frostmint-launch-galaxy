
const Footer = () => {
  const quickLinks = [
    { name: "Home", href: "#" },
    { name: "FAQ", href: "#faq" },
    { name: "Contact", href: "#contact" }
  ];

  return (
    <footer className="bg-black text-white py-16 border-t border-avalanche-red">
      <div className="container mx-auto px-4">
        {/* Main footer content - Grid Layout */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          {/* FrostMint Branding */}
          <div className="text-center md:text-left">
            <div className="text-3xl font-bold text-white mb-4">
              FrostMint
            </div>
            <p className="text-gray-300 text-lg">
              Powering Meme Culture, One Token at a Time.
            </p>
          </div>
          
          {/* Quick Links */}
          <div className="text-center">
            <h4 className="text-lg font-semibold text-white mb-4">Quick Links</h4>
            <div className="flex flex-col space-y-2">
              {quickLinks.map((link, index) => (
                <a 
                  key={index}
                  href={link.href}
                  className="text-gray-300 hover:text-avalanche-red transition-colors duration-300 font-medium"
                >
                  {link.name}
                </a>
              ))}
            </div>
          </div>
          
          {/* Avalanche Info */}
          <div className="text-center md:text-right">
            <h4 className="text-lg font-semibold text-white mb-4">Built On</h4>
            <p className="text-gray-300">
              Avalanche Network
            </p>
            <p className="text-avalanche-red font-medium">
              Lightning Fast • Low Fees
            </p>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-avalanche-gray-dark pt-8 text-center">
          <div className="text-gray-400 text-sm">
            © 2025 FrostMint — Built on Avalanche
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
