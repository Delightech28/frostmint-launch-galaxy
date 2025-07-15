import React, { useEffect, useState } from "react";
import { ethers } from "ethers";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { DialogTitle, DialogDescription } from "./ui/dialog";

// Fuji testnet router address (same for both DEXs)
const ROUTER_ADDRESS = "0x2D99ABD9008Dc933ff5c0CD271B88309593aB921";

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
  { name: "Trader Joe", value: "traderjoe" },
  { name: "Pangolin", value: "pangolin" }
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
    erc20.allowance(userAddress, ROUTER_ADDRESS).then((allow: bigint) => {
      const needed = parseUnitsSafe(amountMemeToken || "0", memeTokenDecimals);
      setIsApproved(allow >= needed && needed > 0n);
    });
  }, [provider, userAddress, memeTokenAddress, amountMemeToken, memeTokenDecimals, txStatus]);

  // Approve MemeToken
  const handleApprove = async () => {
    setError("");
    setIsApproving(true);
    try {
      if (!signer) throw new Error("Wallet not connected");
      const erc20 = new ethers.Contract(memeTokenAddress, ERC20_ABI, signer);
      const tx = await erc20.approve(ROUTER_ADDRESS, parseUnitsSafe(amountMemeToken, memeTokenDecimals));
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
      const router = new ethers.Contract(ROUTER_ADDRESS, ROUTER_ABI, signer);
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
      <div className="mb-4">
        <Label htmlFor="dex" className="text-gray-300">Select DEX</Label>
        <select
          id="dex"
          className="w-full bg-black border border-avalanche-gray-medium rounded p-2 pr-8 mt-1 text-white focus:outline-none focus:border-avalanche-red"
          value={dex}
          onChange={e => setDex(e.target.value)}
        >
          {DEX_OPTIONS.map(opt => <option key={opt.value} value={opt.value} className="bg-black text-white">{opt.name}</option>)}
        </select>
      </div>
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
      <Button variant="outline" className="w-full mt-4 border-avalanche-red text-avalanche-red hover:bg-avalanche-red hover:text-white" onClick={onClose}>Close</Button>
    </div>
  );
};

export default AddLiquidity; 