
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";

const FAQ = () => {
  const faqs = [
    {
      question: "Is FrostMint safe to use?",
      answer: "Absolutely! FrostMint uses battle-tested, audited smart contracts on the Avalanche network. All contracts are open-source and have been reviewed by security experts."
    },
    {
      question: "Do I need AVAX to get started?",
      answer: "Yes, you'll need a small amount of AVAX (usually $5-20) to cover gas fees for deploying your token contract. This is a one-time cost for contract deployment."
    },
    {
      question: "How much does it cost to create a token?",
      answer: "Creating a Fun Coin costs minimal fees, while Trading Coins with advanced features have slightly higher deployment costs. $ENA token holders get significant discounts on all fees."
    },
    {
      question: "Can I customize my token after creation?",
      answer: "Fun Coins have limited customization to maintain their viral nature, but Trading Coins offer extensive post-launch customization including tokenomics adjustments and governance settings."
    },
    {
      question: "How do I earn money from my tokens?",
      answer: "Multiple ways: trading fees from your token, community tips and donations, governance rewards, and staking rewards. Successful projects can generate substantial ongoing revenue."
    },
    {
      question: "What's the difference between Fun Coins and Trading Coins?",
      answer: "Fun Coins are designed for memes and viral content with built-in social features. Trading Coins are for serious projects with advanced tokenomics, governance tools, and DEX integration."
    },
    {
      question: "Do I need to know how to code?",
      answer: "Not at all! FrostMint is completely no-code. Our intuitive interface guides you through every step, from token creation to launch."
    },
    {
      question: "How quickly can I launch my token?",
      answer: "Most tokens can be created and launched in under 60 seconds! The process involves choosing your token type, setting basic parameters, and clicking deploy."
    }
  ];

  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-black mb-6">
            Frequently Asked Questions
          </h2>
          <p className="text-xl text-avalanche-gray-light max-w-2xl mx-auto">
            Got questions? We've got answers. Everything you need to know about launching on FrostMint.
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          <Accordion type="single" collapsible className="space-y-4">
            {faqs.map((faq, index) => (
              <AccordionItem 
                key={index} 
                value={`item-${index}`}
                className="border-2 border-gray-200 rounded-xl bg-white hover:border-avalanche-red transition-all duration-300"
              >
                <AccordionTrigger className="px-6 py-4 text-left text-black font-semibold text-lg hover:no-underline hover:text-avalanche-red transition-colors">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="px-6 pb-6 text-avalanche-gray-light leading-relaxed">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>

        {/* Contact CTA */}
        <div className="text-center mt-16">
          <p className="text-avalanche-gray-light mb-6">
            Still have questions? We're here to help!
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              variant="outline"
              className="border-2 border-avalanche-red text-avalanche-red hover:bg-avalanche-red hover:text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300"
            >
              Join Discord
            </Button>
            <Button 
              variant="outline"
              className="border-2 border-black text-black hover:bg-black hover:text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300"
            >
              Contact Support
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FAQ;
