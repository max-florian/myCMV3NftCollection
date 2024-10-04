import { WalletAdapterNetwork } from "@solana/wallet-adapter-base";
import { clusterApiUrl, PublicKey } from "@solana/web3.js";

export const network = (WalletAdapterNetwork.Devnet) as WalletAdapterNetwork;

export const rpcHost = clusterApiUrl(network);

export const candyMachineId = new PublicKey("85QCdyHB1Vd7iUgrKFp4i53VKdkDpcfggTYfLuTeXZKQ");

export const defaultGuardGroup = undefined;

export const whitelistedWallets = [
  "AWYTLdav4bveazeAt3aBeAXvZVJCb6WwugkuYNix7CZ6",
  "3LX6GN5MmnZ4AZp1vAsdjyGE954EESfmSihHVo7wsUrS"
];
