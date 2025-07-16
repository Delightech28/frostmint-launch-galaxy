import React, { useEffect, useState } from "react";
import { ethers } from "ethers";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { DialogTitle, DialogDescription } from "./ui/dialog";

// UniswapV2Router02 ABI (only needed functions)
const ROUTER_ABI = [
  "function addLiquidityAVAX(address token, uint256 amountTokenDesired, uint256 amountTokenMin, uint256 amountAVAXMin, address to, uint256 deadline) payable returns (uint256 amountToken, uint256 amountAVAX, uint256 liquidity)"
];

// ERC20 ABI (only needed functions)
const ERC20_ABI = [
  "function approve(address spender, uint256 amount) external returns (bool)",
  "function allowance(address owner, address spender) view returns (uint256)",
  "function balanceOf(address owner) view returns (uint256)",
  "function decimals() view returns (uint8)"
];

const DEX_OPTIONS = [
  { name: "Trader Joe", value: "traderjoe" }
];

function formatUnitsSafe(amount: bigint, decimals: number) {
  try {
    return ethers.formatUnits(amount, decimals);
  } catch {
    return "0";
  }
}

function parseUnitsSafe(amount: string, decimals: number) {
  try {
    return ethers.parseUnits(amount || "0", decimals);
  } catch {
    return 0n;
  }
}

// Only Trader Joe router address (Fuji testnet)
const ROUTER_ADDRESSES: Record<string, string> = {
  traderjoe: "0x3705aBF712ccD4fc56Ee76f0BD3009FD4013ad75"
};

const AddLiquidity = ({ memeTokenAddress, memeTokenSymbol, memeTokenDecimals, memeTokenImageUrl, onClose, onAddLiquiditySuccess }: {
  memeTokenAddress: string;
  memeTokenSymbol: string;
  memeTokenDecimals: number;
  memeTokenImageUrl?: string;
  onClose: () => void;
  onAddLiquiditySuccess?: () => void;
}) => {
  const [dex, setDex] = useState(DEX_OPTIONS[0].value);
  const [provider, setProvider] = useState<ethers.BrowserProvider | null>(null);
  const [signer, setSigner] = useState<ethers.JsonRpcSigner | null>(null);
  const [userAddress, setUserAddress] = useState<string>("");
  const [memeTokenBalance, setMemeTokenBalance] = useState<string>("0");
  const [avaxBalance, setAvaxBalance] = useState<string>("0");
  const [amountMemeToken, setAmountMemeToken] = useState<string>("");
  const [amountAVAX, setAmountAVAX] = useState<string>("");
  const [isApproving, setIsApproving] = useState(false);
  const [isApproved, setIsApproved] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [txStatus, setTxStatus] = useState<null | { status: "pending" | "success" | "error", message: string, hash?: string }>(null);
  const [error, setError] = useState<string>("");

  // Helper to get the current router address
  const getRouterAddress = () => ROUTER_ADDRESSES[dex];

  // Setup provider and signer
  useEffect(() => {
    if ((window as any).ethereum) {
      const p = new ethers.BrowserProvider((window as any).ethereum);
      setProvider(p);
      p.getSigner().then(s => {
        setSigner(s);
        s.getAddress().then(setUserAddress).catch(() => {});
      });
    }
  }, []);

  // Fetch balances
  useEffect(() => {
    if (!provider || !userAddress || !memeTokenAddress) return;
    const erc20 = new ethers.Contract(memeTokenAddress, ERC20_ABI, provider);
    erc20.balanceOf(userAddress).then((bal: bigint) => setMemeTokenBalance(formatUnitsSafe(bal, memeTokenDecimals)));
    provider.getBalance(userAddress).then((bal: bigint) => setAvaxBalance(formatUnitsSafe(bal, 18)));
  }, [provider, userAddress, memeTokenAddress, memeTokenDecimals, txStatus]);

  // Check approval
  useEffect(() => {
    if (!provider || !userAddress || !memeTokenAddress) return;
    const erc20 = new ethers.Contract(memeTokenAddress, ERC20_ABI, provider);
    erc20.allowance(userAddress, getRouterAddress()).then((allow: bigint) => {
      const needed = parseUnitsSafe(amountMemeToken || "0", memeTokenDecimals);
      setIsApproved(allow >= needed && needed > 0n);
    });
  }, [provider, userAddress, memeTokenAddress, amountMemeToken, memeTokenDecimals, dex, txStatus]);

  // Approve MemeToken
  const handleApprove = async () => {
    setError("");
    setIsApproving(true);
    try {
      if (!signer) throw new Error("Wallet not connected");
      const erc20 = new ethers.Contract(memeTokenAddress, ERC20_ABI, signer);
      const tx = await erc20.approve(getRouterAddress(), parseUnitsSafe(amountMemeToken, memeTokenDecimals));
      setTxStatus({ status: "pending", message: "Approval pending...", hash: tx.hash });
      await tx.wait();
      setTxStatus({ status: "success", message: "Token approved!", hash: tx.hash });
      setIsApproved(true);
    } catch (e: any) {
      setError(e.message || "Approval failed");
      setTxStatus({ status: "error", message: e.message || "Approval failed" });
    } finally {
      setIsApproving(false);
    }
  };

  // Add Liquidity
  const handleAddLiquidity = async () => {
    setError("");
    setIsAdding(true);
    try {
      if (!signer) throw new Error("Wallet not connected");
      const router = new ethers.Contract(getRouterAddress(), ROUTER_ABI, signer);
      const amountToken = parseUnitsSafe(amountMemeToken, memeTokenDecimals);
      const amountTokenMin = amountToken * 95n / 100n; // 5% slippage
      const avaxAmount = parseUnitsSafe(amountAVAX, 18);
      const amountAVAXMin = avaxAmount * 95n / 100n; // 5% slippage
      const deadline = Math.floor(Date.now() / 1000) + 60 * 20; // 20 min
      const tx = await router.addLiquidityAVAX(
        memeTokenAddress,
        amountToken,
        amountTokenMin,
        amountAVAXMin,
        userAddress,
        deadline,
        { value: avaxAmount }
      );
      setTxStatus({ status: "pending", message: "Adding liquidity...", hash: tx.hash });
      await tx.wait();
      setTxStatus({ status: "success", message: "Liquidity added!", hash: tx.hash });
      setAmountMemeToken("");
      setAmountAVAX("");
      if (onAddLiquiditySuccess) onAddLiquiditySuccess();
    } catch (e: any) {
      setError(e.message || "Add liquidity failed");
      setTxStatus({ status: "error", message: e.message || "Add liquidity failed" });
    } finally {
      setIsAdding(false);
    }
  };

  // Fetch price from selected DEX only
  const [price, setPrice] = useState<string | null>(null);
  const [priceLoading, setPriceLoading] = useState(false);
  useEffect(() => {
    async function fetchPrice() {
      setPrice(null);
      setPriceLoading(true);
      try {
        // Only Trader Joe factory address
        const FACTORY_ADDRESS = "0x9Ad6C38BE94206cA50bb0d90783181662f0Cfa10";
        const FACTORY_ABI = [
          'function getPair(address tokenA, address tokenB) external view returns (address pair)'
        ];
        const PAIR_ABI = [
          'function getReserves() external view returns (uint112 reserve0, uint112 reserve1, uint32 blockTimestampLast)',
          'function token0() external view returns (address)',
          'function token1() external view returns (address)'
        ];
        const WAVAX = '0xd00ae08403b9bbb9124bb305c09058e32c39a48c';
        const provider = new ethers.JsonRpcProvider('https://api.avax-test.network/ext/bc/C/rpc');
        const factory = new ethers.Contract(FACTORY_ADDRESS, FACTORY_ABI, provider);
        const pairAddress = await factory.getPair(memeTokenAddress, WAVAX);
        if (pairAddress === ethers.ZeroAddress) {
          setPrice(null);
          setPriceLoading(false);
          return;
        }
        const pair = new ethers.Contract(pairAddress, PAIR_ABI, provider);
        const [reserve0, reserve1] = await pair.getReserves();
        const token0 = await pair.token0();
        let reserveToken, reserveWAVAX;
        if (token0.toLowerCase() === memeTokenAddress.toLowerCase()) {
          reserveToken = reserve0;
          reserveWAVAX = reserve1;
        } else {
          reserveToken = reserve1;
          reserveWAVAX = reserve0;
        }
        if (reserveToken == 0n) {
          setPrice(null);
        } else {
          const priceValue = Number(ethers.formatUnits(reserveWAVAX, 18)) / Number(ethers.formatUnits(reserveToken, memeTokenDecimals));
          setPrice(priceValue.toFixed(6));
        }
      } catch (e) {
        setPrice(null);
      } finally {
        setPriceLoading(false);
      }
    }
    if (memeTokenAddress) fetchPrice();
  }, [dex, memeTokenAddress, memeTokenDecimals, txStatus]);

  // Validation
  const parsedMemeTokenBalance = parseFloat(memeTokenBalance.replace(/,/g, ''));
  const parsedAmountMemeToken = parseFloat(amountMemeToken);
  const hasInsufficientToken = !!amountMemeToken && parsedAmountMemeToken > parsedMemeTokenBalance;

  const parsedAvaxBalance = parseFloat(avaxBalance.replace(/,/g, ''));
  const parsedAmountAvax = parseFloat(amountAVAX);
  const hasInsufficientAvax = !!amountAVAX && parsedAmountAvax > parsedAvaxBalance;

  const canApprove = !!amountMemeToken && parsedAmountMemeToken > 0 && !isApproved && !isApproving && !hasInsufficientToken && !hasInsufficientAvax;
  const canAddLiquidity = !!amountMemeToken && !!amountAVAX && isApproved && !isAdding && parsedAmountMemeToken > 0 && parsedAmountAvax > 0 && !hasInsufficientToken && !hasInsufficientAvax;

  return (
    <div className="max-w-md mx-auto bg-black rounded-lg border border-avalanche-gray-medium p-6 mt-8">
      {memeTokenImageUrl && (
        <div className="flex justify-center mb-4">
          <img src={memeTokenImageUrl} alt={memeTokenSymbol} className="w-16 h-16 rounded-full object-cover border-2 border-avalanche-red" />
        </div>
      )}
      <DialogTitle className="text-white text-xl font-bold mb-1">Add Liquidity to <span className="text-avalanche-red">{memeTokenSymbol}/AVAX</span></DialogTitle>
      <DialogDescription className="text-gray-300 mb-4">
        Select DEX and supply both <span className="text-avalanche-red font-semibold">{memeTokenSymbol}</span> and <span className="text-avalanche-red font-semibold">AVAX</span> to enable trading for your new token.
      </DialogDescription>
      {/* DEX selection removed: Only Trader Joe is used */}
      <div className="mb-4">
        <Label htmlFor="memeToken" className="text-gray-300">{memeTokenSymbol} Amount</Label>
        <Input
          id="memeToken"
          type="number"
          min="0"
          step="any"
          value={amountMemeToken}
          onChange={e => setAmountMemeToken(e.target.value)}
          placeholder={`Balance: ${memeTokenBalance}`}
          className="bg-black border-avalanche-gray-medium text-white"
          disabled={isApproved || isApproving}
        />
        <div className="text-xs text-gray-400 mt-1">Balance: {memeTokenBalance} <span className="text-avalanche-red">{memeTokenSymbol}</span></div>
        {hasInsufficientToken && (
          <div className="text-red-500 text-xs mt-1">Insufficient token balance</div>
        )}
      </div>
      <div className="mb-4">
        <Label htmlFor="avax" className="text-gray-300">AVAX Amount</Label>
        <Input
          id="avax"
          type="number"
          min="0"
          step="any"
          value={amountAVAX}
          onChange={e => setAmountAVAX(e.target.value)}
          placeholder={`Balance: ${avaxBalance}`}
          className="bg-black border-avalanche-gray-medium text-white"
          disabled={isApproved || isApproving}
        />
        <div className="text-xs text-gray-400 mt-1">Balance: {avaxBalance} <span className="text-avalanche-red">AVAX</span></div>
        {hasInsufficientAvax && (
          <div className="text-red-500 text-xs mt-1">Insufficient AVAX balance</div>
        )}
      </div>
      {error && <div className="text-red-500 text-sm mb-2">{error}</div>}
      {txStatus && (
        <div className={`mb-2 text-sm ${txStatus.status === "error" ? "text-red-500" : txStatus.status === "success" ? "text-green-400" : "text-avalanche-red"}`}>
          {txStatus.message}
          {txStatus.hash && (
            <>
              {" "}
              <a
                href={`https://testnet.snowtrace.io/tx/${txStatus.hash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="underline text-avalanche-red"
              >
                View on Snowtrace
              </a>
            </>
          )}
        </div>
      )}
      <div className="flex gap-2 mt-4">
        {!isApproved && (
          <Button onClick={handleApprove} disabled={!canApprove} className="w-1/2 bg-avalanche-red hover:bg-avalanche-red-dark text-white">
            {isApproving ? "Approving..." : `Approve ${memeTokenSymbol}`}
          </Button>
        )}
        <Button onClick={handleAddLiquidity} disabled={!canAddLiquidity} className="w-1/2 bg-avalanche-red hover:bg-avalanche-red-dark text-white">
          {isAdding ? "Adding..." : "Add Liquidity"}
        </Button>
      </div>
      <Label className="text-white">Price ({DEX_OPTIONS.find(opt => opt.value === dex)?.name}):</Label>
      {priceLoading ? (
        <div className="text-gray-400 text-sm">Loading...</div>
      ) : price ? (
        <div className="text-white text-lg font-mono">1 {memeTokenSymbol} = {price} AVAX</div>
      ) : (
        <div className="text-gray-400 text-sm">No pool or no price yet</div>
      )}
      <Button variant="outline" className="w-full mt-4 border-avalanche-red text-avalanche-red hover:bg-avalanche-red hover:text-white" onClick={onClose}>Close</Button>
    </div>
  );
};

export default AddLiquidity; 