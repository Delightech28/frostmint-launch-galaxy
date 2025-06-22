
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const FAQ = () => {
  const faqs = [
    {
      question: "Is FrostMint safe to use?",
      answer: "Absolutely! FrostMint uses battle-tested, audited smart contracts on the Avalanche network. All contracts are open-source and have been reviewed by security experts. Your funds and tokens are protected by the same security standards used by major DeFi protocols."
    },
    {
      question: "Do I need AVAX to get started?",
      answer: "Yes, you'll need a small amount of AVAX (usually $5-20) to cover gas fees for deploying your token contract. This is a one-time cost for contract deployment. After that, trading and most interactions have minimal fees thanks to Avalanche's efficiency."
    },
    {
      question: "How much does it cost to create a token?",
      answer: "Creating a basic Fun Coin costs 0.1 AVAX (~$3-5), while Trading Coins with advanced features cost 0.5 AVAX (~$15-25). $ENA token holders get up to 75% discount on all fees. No hidden costs or monthly subscriptions."
    },
    {
      question: "Can I customize my token after creation?",
      answer: "Fun Coins have limited customization to maintain their viral nature, but Trading Coins offer extensive post-launch customization including tokenomics adjustments, governance settings, and feature upgrades through our upgrade modules."
    },
    {
      question: "How do I earn money from my tokens?",
      answer: "There are multiple ways: keep 100% of initial token sales, earn 0.3% of all trading fees, receive community tips and donations, participate in governance rewards, and stake your tokens for passive income. Successful projects can earn $1K-10K+ monthly."
    },
    {
      question: "What's the difference between Fun Coins and Trading Coins?",
      answer: "Fun Coins are designed for memes and viral content with built-in social features and gamification. Trading Coins are for serious projects with advanced tokenomics, governance tools, and institutional features. Choose based on your project's goals."
    },
    {
      question: "Do I need to know how to code?",
      answer: "Not at all! FrostMint is completely no-code. Our intuitive interface guides you through every step, from token creation to launch. If you can use social media, you can create a token on FrostMint."
    },
    {
      question: "How quickly can I launch my token?",
      answer: "Most tokens can be created and launched in under 60 seconds! The process involves choosing your token type, setting basic parameters, and clicking deploy. The longest part is usually thinking of a creative name and description."
    }
  ];

  return (
    <section className="py-20 bg-gradient-to-br from-ice-50 to-frost-100">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-ice-800 mb-6">
            Frequently Asked Questions
          </h2>
          <p className="text-xl text-ice-600 max-w-2xl mx-auto">
            Got questions? We've got answers. Everything you need to know about launching on FrostMint.
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          <Accordion type="single" collapsible className="space-y-4">
            {faqs.map((faq, index) => (
              <AccordionItem 
                key={index} 
                value={`item-${index}`}
                className="border-2 border-frost-200 rounded-2xl bg-white/80 backdrop-blur-sm hover:border-frost-400 transition-all duration-300"
              >
                <AccordionTrigger className="px-6 py-4 text-left text-ice-800 font-semibold text-lg hover:no-underline hover:text-frost-600 transition-colors">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="px-6 pb-6 text-ice-600 leading-relaxed">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>

        {/* Contact CTA */}
        <div className="text-center mt-16">
          <p className="text-ice-600 mb-6">
            Still have questions? We're here to help!
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              variant="outline"
              className="border-2 border-frost-300 text-frost-700 hover:bg-frost-50 px-6 py-3 rounded-xl font-semibold"
            >
              Join Discord 💬
            </Button>
            <Button 
              variant="outline"
              className="border-2 border-frost-300 text-frost-700 hover:bg-frost-50 px-6 py-3 rounded-xl font-semibold"
            >
              Read Docs 📚
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FAQ;
