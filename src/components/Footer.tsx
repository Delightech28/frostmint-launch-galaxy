
const Footer = () => {
  const quickLinks = [
    { name: "Home", href: "#" },
    { name: "How It Works", href: "#how-it-works" },
    { name: "FAQ", href: "#faq" },
    { name: "Contact", href: "#" }
  ];

  return (
    <footer className="bg-gradient-to-br from-ice-900 via-ice-800 to-frost-900 text-white py-16">
      <div className="container mx-auto px-4">
        {/* Main footer content */}
        <div className="text-center mb-8">
          <div className="text-4xl font-bold bg-gradient-to-r from-frost-300 to-white bg-clip-text text-transparent mb-4">
            ❄️ FrostMint
          </div>
          <p className="text-ice-300 text-lg mb-6">
            Powering Meme Culture, One Token at a Time.
          </p>
          
          {/* Quick Links */}
          <div className="flex justify-center space-x-8 mb-8">
            {quickLinks.map((link, index) => (
              <a 
                key={index}
                href={link.href}
                className="text-ice-300 hover:text-frost-300 transition-colors duration-300 font-medium"
              >
                {link.name}
              </a>
            ))}
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-ice-700 pt-8 text-center">
          <div className="text-ice-400 text-sm">
            © 2025 FrostMint — Built on Avalanche 🔺
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
