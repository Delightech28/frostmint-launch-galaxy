import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { ChevronDown } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useLocation } from "react-router-dom";
import { useWallet } from "@/contexts/WalletContext";
import { ethers } from "ethers";
import { Info } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

const AVAX_TOKEN = { symbol: "AVAX", address: "AVAX", name: "Avalanche", icon: "/avax.png" };

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

const ERC20_ABI = [
  "function balanceOf(address owner) view returns (uint256)",
  "function decimals() view returns (uint8)"
];

const FACTORY_ADDRESS = '0x9Ad6C38BE94206cA50bb0d90783181662f0Cfa10'; // Trader Joe Fuji
const FACTORY_ABI = [
  'function getPair(address tokenA, address tokenB) external view returns (address pair)'
];
const PAIR_ABI = [
  'function getReserves() external view returns (uint112 reserve0, uint112 reserve1, uint32 blockTimestampLast)',
  'function token0() external view returns (address)',
  'function token1() external view returns (address)'
];
const WAVAX = '0xd00ae08403b9bbb9124bb305c09058e32c39a48c';

export default function Swap() {
  const { address, isConnected, connect } = useWallet();
  const [tokens, setTokens] = useState([AVAX_TOKEN]);
  const [fromToken, setFromToken] = useState(AVAX_TOKEN);
  const [toToken, setToToken] = useState(AVAX_TOKEN);
  const [fromAmount, setFromAmount] = useState("");
  const [toAmount, setToAmount] = useState("");
  const [slippage, setSlippage] = useState("0.5");
  const [showFromDropdown, setShowFromDropdown] = useState(false);
  const [showToDropdown, setShowToDropdown] = useState(false);
  const [fromBalance, setFromBalance] = useState("0.00");
  const [toBalance, setToBalance] = useState("0.00");
  const [loadingBalances, setLoadingBalances] = useState(false);
  const [price, setPrice] = useState('-');
  const [minReceived, setMinReceived] = useState('-');
  const [priceImpact, setPriceImpact] = useState('-');
  const [lpFee, setLpFee] = useState('-');
  const [noPool, setNoPool] = useState(false);
  const [reserves, setReserves] = useState<{reserveIn: bigint, reserveOut: bigint, decimalsIn: number, decimalsOut: number} | null>(null);
  const [insufficientBalance, setInsufficientBalance] = useState(false);

  const query = useQuery();

  const slippageOptions = ["0.1", "0.5", "1", "3"];

  // Fetch tokens from Supabase
  useEffect(() => {
    async function fetchTokens() {
      const { data, error } = await supabase
        .from('tokens')
        .select('*')
        .order('created_at', { ascending: false });
      if (data) {
        const tokenList = [AVAX_TOKEN, ...data.map(token => ({
          symbol: token.ticker,
          address: token.contract_address,
          name: token.name,
          icon: token.image_url
        }))];
        setTokens(tokenList);
        // Pre-select token if ?token=ADDRESS is present
        const preselect = query.get("token");
        if (preselect) {
          const found = tokenList.find(t => t.address.toLowerCase() === preselect.toLowerCase());
          if (found) setToToken(found);
        }
      }
    }
    fetchTokens();
    // eslint-disable-next-line
  }, []);

  // Fetch balances for selected tokens
  useEffect(() => {
    async function fetchBalances() {
      if (!address || !isConnected) {
        setFromBalance("0.00");
        setToBalance("0.00");
        return;
      }
      setLoadingBalances(true);
      try {
        const provider = new ethers.BrowserProvider(window.ethereum);
        // From token balance
        if (fromToken.address === "AVAX") {
          const bal = await provider.getBalance(address);
          setFromBalance(ethers.formatUnits(bal, 18));
        } else {
          const erc20 = new ethers.Contract(fromToken.address, ERC20_ABI, provider);
          const bal = await erc20.balanceOf(address);
          const decimals = await erc20.decimals();
          setFromBalance(ethers.formatUnits(bal, decimals));
        }
        // To token balance
        if (toToken.address === "AVAX") {
          const bal = await provider.getBalance(address);
          setToBalance(ethers.formatUnits(bal, 18));
        } else {
          const erc20 = new ethers.Contract(toToken.address, ERC20_ABI, provider);
          const bal = await erc20.balanceOf(address);
          const decimals = await erc20.decimals();
          setToBalance(ethers.formatUnits(bal, decimals));
        }
      } catch (e) {
        setFromBalance("0.00");
        setToBalance("0.00");
      } finally {
        setLoadingBalances(false);
      }
    }
    fetchBalances();
    // eslint-disable-next-line
  }, [address, isConnected, fromToken, toToken]);

  // Fetch price and reserves for the selected pair
  useEffect(() => {
    async function fetchPriceAndReserves() {
      setNoPool(false);
      setReserves(null);
      setPrice('-');
      setMinReceived('-');
      setPriceImpact('-');
      setLpFee('-');
      if (!fromToken || !toToken || fromToken.address === toToken.address) return;
      try {
        const provider = new ethers.JsonRpcProvider('https://api.avax-test.network/ext/bc/C/rpc');
        let tokenA = fromToken.address === 'AVAX' ? WAVAX : fromToken.address;
        let tokenB = toToken.address === 'AVAX' ? WAVAX : toToken.address;
        const factory = new ethers.Contract(FACTORY_ADDRESS, FACTORY_ABI, provider);
        const pairAddress = await factory.getPair(tokenA, tokenB);
        if (pairAddress === ethers.ZeroAddress) {
          setNoPool(true);
          return;
        }
        const pair = new ethers.Contract(pairAddress, PAIR_ABI, provider);
        const [reserve0, reserve1] = await pair.getReserves();
        const token0 = await pair.token0();
        const token1 = await pair.token1();
        // Figure out which reserve is in/out
        let reserveIn, reserveOut, decimalsIn, decimalsOut;
        if (token0.toLowerCase() === tokenA.toLowerCase()) {
          reserveIn = reserve0;
          reserveOut = reserve1;
        } else {
          reserveIn = reserve1;
          reserveOut = reserve0;
        }
        // Get decimals for both tokens
        let decimalsA = 18, decimalsB = 18;
        if (fromToken.address !== 'AVAX') {
          const erc20 = new ethers.Contract(fromToken.address, ERC20_ABI, provider);
          decimalsA = await erc20.decimals();
        }
        if (toToken.address !== 'AVAX') {
          const erc20 = new ethers.Contract(toToken.address, ERC20_ABI, provider);
          decimalsB = await erc20.decimals();
        }
        setReserves({ reserveIn, reserveOut, decimalsIn: decimalsA, decimalsOut: decimalsB });
        // Calculate price (out per in)
        if (reserveIn > 0n && reserveOut > 0n) {
          const priceValue = Number(ethers.formatUnits(reserveOut, decimalsB)) / Number(ethers.formatUnits(reserveIn, decimalsA));
          setPrice(priceValue.toPrecision(8));
        }
      } catch (e) {
        setNoPool(true);
      }
    }
    fetchPriceAndReserves();
    // eslint-disable-next-line
  }, [fromToken, toToken]);

  // Calculate min received, price impact, LP fee when fromAmount or reserves change
  useEffect(() => {
    if (!fromAmount || !reserves) {
      setMinReceived('-');
      setPriceImpact('-');
      setLpFee('-');
      return;
    }
    try {
      // UniswapV2 formula: amountOut = (amountIn * 997) * reserveOut / (reserveIn * 1000 + amountIn * 997)
      const amountIn = ethers.parseUnits(fromAmount, reserves.decimalsIn);
      const amountInWithFee = amountIn * 997n / 1000n;
      const numerator = amountInWithFee * reserves.reserveOut;
      const denominator = reserves.reserveIn * 1000n + amountInWithFee;
      const amountOut = denominator === 0n ? 0n : numerator / denominator;
      setMinReceived(ethers.formatUnits(amountOut, reserves.decimalsOut));
      setLpFee(((Number(fromAmount) * 0.003)).toPrecision(6));
      // Price impact: (expected - actual) / expected
      const expectedOut = Number(fromAmount) * Number(price);
      const actualOut = Number(ethers.formatUnits(amountOut, reserves.decimalsOut));
      if (expectedOut > 0) {
        const impact = ((expectedOut - actualOut) / expectedOut) * 100;
        setPriceImpact(impact.toFixed(2) + '%');
      } else {
        setPriceImpact('-');
      }
    } catch {
      setMinReceived('-');
      setPriceImpact('-');
      setLpFee('-');
    }
  }, [fromAmount, reserves, price]);

  // Check for insufficient balance
  useEffect(() => {
    if (!fromAmount || !fromBalance) {
      setInsufficientBalance(false);
      return;
    }
    const fromAmountNum = Number(fromAmount);
    const fromBalanceNum = Number(fromBalance);
    setInsufficientBalance(fromAmountNum > fromBalanceNum);
  }, [fromAmount, fromBalance]);

  // Max button handlers
  const handleMaxFrom = () => {
    setFromAmount(fromBalance);
  };
  const handleMaxTo = () => {
    setToAmount(toBalance);
  };

  return (
    <TooltipProvider>
      <div className="swap-page min-h-screen bg-black flex items-center justify-center py-12">
        <Card className="w-full max-w-md bg-avalanche-gray-dark border-avalanche-gray-medium">
          <CardHeader>
            <CardTitle className="text-white text-2xl">Swap</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* From Token */}
            <div>
              <Label className="text-gray-300">From</Label>
              <div className="flex items-center gap-2 mt-1 relative">
                <Button variant="outline" className="flex items-center gap-2 bg-black border-avalanche-gray-medium text-white" onClick={() => setShowFromDropdown(v => !v)}>
                  {fromToken.icon && <img src={fromToken.icon} alt={fromToken.symbol} className="w-5 h-5 rounded-full" />}
                  {fromToken.symbol}
                  <ChevronDown className="w-4 h-4 ml-1" />
                </Button>
                {showFromDropdown && (
                  <div className="absolute z-10 top-12 left-0 w-40 bg-black border border-avalanche-gray-medium rounded shadow-lg max-h-60 overflow-y-auto">
                    {tokens.filter(t => t.address !== toToken.address).map(token => (
                      <div key={token.address} className="flex items-center gap-2 px-3 py-2 hover:bg-avalanche-gray-medium cursor-pointer text-white" onClick={() => { setFromToken(token); setShowFromDropdown(false); }}>
                        {token.icon && <img src={token.icon} alt={token.symbol} className="w-5 h-5 rounded-full" />}
                        <span>{token.symbol}</span>
                      </div>
                    ))}
                  </div>
                )}
                <Input
                  type="number"
                  min="0"
                  step="any"
                  value={fromAmount}
                  onChange={e => setFromAmount(e.target.value)}
                  placeholder="0.0"
                  className="bg-black border-avalanche-gray-medium text-white flex-1"
                />
                <Button variant="ghost" className="text-xs text-avalanche-red ml-2" onClick={handleMaxFrom} disabled={loadingBalances || !isConnected}>Max</Button>
              </div>
              <div className="text-xs text-gray-400 mt-1">Balance: {loadingBalances ? 'Loading...' : fromBalance} {fromToken.symbol}</div>
              {insufficientBalance && (
                <div className="text-xs text-red-500 mt-1">Insufficient balance</div>
              )}
            </div>

            {/* To Token */}
            <div>
              <Label className="text-gray-300">To</Label>
              <div className="flex items-center gap-2 mt-1 relative">
                <Button variant="outline" className="flex items-center gap-2 bg-black border-avalanche-gray-medium text-white" onClick={() => setShowToDropdown(v => !v)}>
                  {toToken.icon && <img src={toToken.icon} alt={toToken.symbol} className="w-5 h-5 rounded-full" />}
                  {toToken.symbol}
                  <ChevronDown className="w-4 h-4 ml-1" />
                </Button>
                {showToDropdown && (
                  <div className="absolute z-10 top-12 left-0 w-40 bg-black border border-avalanche-gray-medium rounded shadow-lg max-h-60 overflow-y-auto">
                    {tokens.filter(t => t.address !== fromToken.address).map(token => (
                      <div key={token.address} className="flex items-center gap-2 px-3 py-2 hover:bg-avalanche-gray-medium cursor-pointer text-white" onClick={() => { setToToken(token); setShowToDropdown(false); }}>
                        {token.icon && <img src={token.icon} alt={token.symbol} className="w-5 h-5 rounded-full" />}
                        <span>{token.symbol}</span>
                      </div>
                    ))}
                  </div>
                )}
                <Input
                  type="number"
                  min="0"
                  step="any"
                  value={minReceived !== '-' && !isNaN(Number(minReceived)) ? minReceived : '0'}
                  readOnly
                  placeholder="0.0"
                  className="bg-black border-avalanche-gray-medium text-white flex-1"
                  disabled
                />
              </div>
              <div className="text-xs text-gray-400 mt-1">Balance: {loadingBalances ? 'Loading...' : toBalance} {toToken.symbol}</div>
            </div>

            {/* Price and Slippage */}
            <div className="flex justify-between items-center text-sm">
              <div className="text-gray-400">Price</div>
              <div className="text-white font-mono">{noPool ? 'No pool' : price}</div>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <div className="text-gray-400">Slippage</div>
              <div className="flex gap-2 ml-6">
                {slippageOptions.map(opt => (
                  <button
                    key={opt}
                    type="button"
                    className={`px-2 py-1 rounded text-xs font-semibold border ${slippage === opt ? 'bg-avalanche-red text-white border-avalanche-red' : 'bg-black text-gray-300 border-avalanche-gray-medium'} transition`}
                    onClick={() => setSlippage(opt)}
                  >
                    {opt}%
                  </button>
                ))}
              </div>
            </div>

            {/* Min received, price impact, LP fee */}
            <div className="grid grid-cols-3 gap-2 text-xs text-gray-400">
              <div>
                <span className="inline-flex items-center gap-1">Min received
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Info className="w-3 h-3 text-gray-400 cursor-pointer" />
                    </TooltipTrigger>
                    <TooltipContent className="max-w-xs">
                      The minimum amount you’ll receive after slippage and fees. If the price moves and you’d get less, the swap will fail.
                    </TooltipContent>
                  </Tooltip>
                </span>
                <br /><span className="text-white font-mono">{minReceived}</span>
              </div>
              <div>
                <span className="inline-flex items-center gap-1">Price impact
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Info className="w-3 h-3 text-gray-400 cursor-pointer" />
                    </TooltipTrigger>
                    <TooltipContent className="max-w-xs">
                      How much your trade moves the price due to pool size. Large trades or low liquidity mean higher price impact.
                    </TooltipContent>
                  </Tooltip>
                </span>
                <br /><span className="text-white font-mono">{priceImpact}</span>
              </div>
              <div>
                <span className="inline-flex items-center gap-1">LP fee
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Info className="w-3 h-3 text-gray-400 cursor-pointer" />
                    </TooltipTrigger>
                    <TooltipContent className="max-w-xs">
                      The 0.3% fee paid to liquidity providers for this swap. It’s deducted from your input before the swap.
                    </TooltipContent>
                  </Tooltip>
                </span>
                <br /><span className="text-white font-mono">{lpFee}</span>
              </div>
            </div>

            {/* Swap Button */}
            <Button
              className="w-full bg-avalanche-red hover:bg-avalanche-red-dark text-white text-lg font-semibold py-2"
              onClick={isConnected ? undefined : connect}
              disabled={insufficientBalance || !isConnected}
            >
              {isConnected ? "Swap" : "Connect Wallet"}
            </Button>
          </CardContent>
        </Card>
      </div>
    </TooltipProvider>
  );
} 