import { useCallback } from "react";
import { Paper, Snackbar, LinearProgress } from "@material-ui/core";
import Alert from "@material-ui/lab/Alert";
import { DefaultCandyGuardRouteSettings, Nft } from "@metaplex-foundation/js";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { LAMPORTS_PER_SOL, PublicKey } from "@solana/web3.js";
import confetti from "canvas-confetti";
import Link from "next/link";
import Countdown from "react-countdown";

import { useEffect, useMemo, useState } from "react";
import styled from "styled-components";
import { GatewayProvider } from "@civic/solana-gateway-react";
import { defaultGuardGroup, network } from "./config";

import { MultiMintButton } from "./MultiMintButton";
//import { MintButton } from "./MintButton";
import {
  MintCount,
  Section,
  Container,
  Column,
} from "./styles";
import { AlertState } from "./utils";
import NftsModal from "./NftsModal";
import { WalletAdapterNetwork } from "@solana/wallet-adapter-base";
import useCandyMachineV3 from "./hooks/useCandyMachineV3";
import {
  CustomCandyGuardMintSettings,
  NftPaymentMintSettings,
  ParsedPricesForUI,
} from "./hooks/types";
import { guardToLimitUtil } from "./hooks/utils";

import "@fontsource/plus-jakarta-sans/600.css";
import "@fontsource/noto-sans/900.css";

import SimpleImageSlider from "react-simple-image-slider";

const images = [
  { url: "collection.png" },
  /* my ISP was blocking IPFS
  { url: "https://bafybeidt3npna22eu2h7kewf6je7igtkddbdpdu4w737rhdfhy2rsmx5ze.ipfs.w3s.link/vy3stib90QUIZFoPhxGJ--2--2v1v3_2x.jpg" },
  */
];

/* Configure the image slider here */
function Image() {
  return (
    <SimpleImageSlider
      width={896}
      height={504}
      images={images}
      loop={true}
      showBullets={false}
      showNavs={false}
      navStyle={2}
      navSize={40}
      navMargin={2}
      slideDuration={0.35}
      bgColor="transparent"
    />
  );
}

const BorderLinearProgress = styled(LinearProgress)`
  height: 16px !important;
  border-radius: 30px;
  background-color: var(--alt-background-color) !important;
  > div.MuiLinearProgress-barColorPrimary{
    background-color: var(--primary) !important;
  }
  > div.MuiLinearProgress-bar1Determinate {
    border-radius: 30px !important;
    background-color: var(--primary);
  }
`;
const Header = styled.div`
  display: flex;
  justify-content: flex-end;
  align-items: center;
  position: absolute;
  width: 100%;
`;
const WalletContainer = styled.div`
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  justify-content: right;
  margin: 30px;
  z-index: 999;
  position: relative;

  .wallet-adapter-dropdown-list {
    background: #ffffff;
  }
  .wallet-adapter-dropdown-list-item {
    background: #000000;
  }
  .wallet-adapter-dropdown-list {
    grid-row-gap: 5px;
  }
`;
const Content = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  padding: 0px;
  gap: 32px;
  width: 100%;
`
const Other = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  padding: 0px;
  gap: 48px;
  width: 100%;
`
const CollectionName = styled.h1`
  font-family: 'Noto Sans', 'Helvetica', 'Plus Jakarta Sans', sans-serif;
  font-weight: 800;
  font-size: 64px;
  line-height: 100%;
  color: var(--darkgrey);

  @media only screen and (max-width: 1024px) {
    font-size: 48px;
  }

  @media only screen and (max-width: 450px) {
    font-size: 40px;
  }
`
const InfoRow = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  padding: 0;
  gap: 16px;
  flex-wrap: wrap;
`
const InfoBox = styled.div`
  display: flex;
  flex-direction: row;
  align-items: flex-start;
  padding: 10px 16px;
  gap: 8px;
  border: 2px solid #f5109a;
  border-radius: 4px;
  font-weight: 600;
  font-size: 20px;
  line-height: 100%;
  text-transform: uppercase;
  color: var(--darkgrey);

  @media only screen and (max-width: 450px) {
    font-size: 18px;
  }
`
const IconRow = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  padding: 0px;
  gap: 24px;
  margin-bottom: -3px;
`
const CollectionDescription = styled.p`
  font-weight: 400;
  font-size: 20px;
  line-height: 150%;
  color: var(--darkgrey);
`
const MintedByYou = styled.span`
  font-style: italic;
  font-weight: 500;
  font-size: 16px;
  line-height: 100%;
  text-transform: none;
`
const ProgressbarWrap = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  padding: 0px;
  gap: 16px;
  width: 100%;
`
const StartTimer = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  padding: 32px;
  gap: 48px;
  background: var(--alt-background-color);
  border-radius: 8px;
  @media only screen and (max-width: 450px) {
    gap: 16px;
    padding: 16px;
    width: -webkit-fill-available;
    justify-content: space-between;
  }
`
const StartTimerInner = styled(Paper)`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 0px;
  gap: 16px;
  min-width: 90px;
  border-radius: 0px !important;
  box-shadow: none !important;
  font-style: normal;
  font-weight: 600;
  font-size: 16px;
  line-height: 100%;
  background: none !important;
  text-transform: uppercase;
  color: var(--darkgrey);
  span {
    font-style: normal;
    font-weight: 800;
    font-size: 48px;
    line-height: 100%;
  }

  @media only screen and (max-width: 450px) {
    min-width: 70px;
    span {
      font-size: 32px;
    }
  }
`;
const StartTimerWrap = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: start;
  padding: 0px;
  gap: 16px;
  width: -webkit-fill-available;
`
const StartTimerSubtitle = styled.p`
  font-style: normal;
  font-weight: 600;
  font-size: 20px;
  line-height: 100%;
  text-transform: uppercase;
  color: #FFFFFF;
`
const PrivateWrap = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  padding: 0px;
  gap: 8px;
  width: -webkit-fill-available;
`
const PrivateText = styled.h2`
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  padding: 16px 24px;
  gap: 10px;
  background: var(--error);
  border-radius: 4px;
  font-style: normal;
  font-weight: 600;
  font-size: 20px;
  line-height: 150%;
  text-transform: uppercase;
  color: var(--darkgrey);
  width: -webkit-fill-available;
`
const PrivateSubtext = styled.p`
  font-style: normal;
  font-weight: 400;
  font-size: 16px;
  line-height: 150%;
  color: var(--darkgrey);
`
const WalletAmount = styled.div`
  color: var(--white);
  width: auto;
  padding: 8px 8px 8px 16px;
  min-width: 48px;
  min-height: auto;
  border-radius: 5px;
  background-color: var(--primary);
  box-sizing: border-box;
  transition: background-color 250ms cubic-bezier(0.4, 0, 0.2, 1) 0ms,
    box-shadow 250ms cubic-bezier(0.4, 0, 0.2, 1) 0ms,
    border 250ms cubic-bezier(0.4, 0, 0.2, 1) 0ms;
  font-weight: 600;
  line-height: 100%;
  text-transform: uppercase;
  border: 0;
  margin: 0;
  display: inline-flex;
  outline: 0;
  position: relative;
  align-items: center;
  user-select: none;
  vertical-align: middle;
  justify-content: flex-start;
  gap: 10px;
`;

const Wallet = styled.ul`
  flex: 0 0 auto;
  margin: 0;
  padding: 0;
`;

const ConnectButton = styled(WalletMultiButton)`
  border-radius: 5px !important;
  padding: 6px 16px;
  background-color: #fff;
  color: #000;
  margin: 0 auto;
`;
const ConnectWallet = styled(WalletMultiButton)`
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  padding: 18px 24px;
  gap: 10px;
  width: 100%;
  height: fit-content;
  background-color: var(--primary) !important;
  border-radius: 4px;
  font-style: normal;
  font-weight: 600;
  font-size: 20px;
  line-height: 150%;
  text-transform: uppercase;
  color: var(--white) !important;
  transition: 0.2s;
  :hover {
    background-color: var(--primary) !important;
    color: var(--white) !important;
    opacity: 0.9;
  }
`

export interface HomeProps {
  candyMachineId: PublicKey;
}
const candyMachinOps = {
  allowLists: [
    {
      list: require("../cmv3-demo-initialization/allowlist.json"),
      groupLabel: "waoed",
    },
  ],
};
const Home = (props: HomeProps) => {
  const { connection } = useConnection();
  const wallet = useWallet();
  const candyMachineV3 = useCandyMachineV3(
    props.candyMachineId,
    candyMachinOps
  );

  const [balance, setBalance] = useState<number>();
  const [mintedItems, setMintedItems] = useState<Nft[]>();

  const [alertState, setAlertState] = useState<AlertState>({
    open: false,
    message: "",
    severity: undefined,
  });

  const { guardLabel, guards, guardStates, prices } = useMemo(() => {
    const guardLabel = defaultGuardGroup;
    return {
      guardLabel,
      guards:
      candyMachineV3.guards[guardLabel] ||
        candyMachineV3.guards.default ||
        {},
      guardStates: candyMachineV3.guardStates[guardLabel] ||
        candyMachineV3.guardStates.default || {
          isStarted: true,
          isEnded: false,
          isLimitReached: false,
          canPayFor: 10,
          messages: [],
          isWalletWhitelisted: true,
          hasGatekeeper: false,
        },
      prices: candyMachineV3.prices[guardLabel] ||
        candyMachineV3.prices.default || {
          payment: [],
          burn: [],
          gate: [],
        },
    };
  }, [
    candyMachineV3.guards,
    candyMachineV3.guardStates,
    candyMachineV3.prices,
  ]);
  
  useEffect(() => {
    (async () => {
      if (wallet?.publicKey) {
        try {
          const balance = await connection.getBalance(wallet.publicKey);
        } catch {
          alert('Failed to connect wallet to the RPC.\n\nAre you online?');
        }
        setBalance(balance / LAMPORTS_PER_SOL);
      }
    })();
  }, [wallet, connection]);

  useEffect(() => {
    if (mintedItems?.length === 0) throwConfetti();
  }, [mintedItems]);

  const openOnSolscan = useCallback((mint) => {
    window.open(
      `https://solscan.io/address/${mint}${[WalletAdapterNetwork.Devnet, WalletAdapterNetwork.Testnet].includes(
        network
      )
        ? `?cluster=${network}`
        : ""
      }`
    );
  }, []);

  const throwConfetti = useCallback(() => {
    confetti({
      particleCount: 400,
      spread: 70,
      origin: { y: 0.6 },
    });
  }, [confetti]);

  const startMint = useCallback(
    async (quantityString: number = 1) => {
      const nftGuards: NftPaymentMintSettings[] = Array(quantityString)
            .fill(undefined)
            .map((_, i) => {
              return {
                burn: guards.burn?.nfts?.length
                  ? {
                    mint: guards.burn.nfts[i]?.mintAddress,
                  }
                  : undefined,
                payment: guards.payment?.nfts?.length
                  ? {
                    mint: guards.payment.nfts[i]?.mintAddress,
                  }
                  : undefined,
                gate: guards.gate?.nfts?.length
                  ? {
                    mint: guards.gate.nfts[i]?.mintAddress,
                  }
                  : undefined,
              };
            });
            
      candyMachineV3
        .mint(quantityString, {
          groupLabel: guardLabel,
          nftGuards,
        })
        .then((items) => {
          setMintedItems(items as any);
        })
        .catch((e) =>
          setAlertState({
            open: true,
            message: e.message,
            severity: "error",
          })
        );
    },
    [candyMachineV3.mint, guards]
  );
  
  const MintButton = ({
    gatekeeperNetwork,
  }: {
    gatekeeperNetwork?: PublicKey;
  }) => (
    <MultiMintButton
      candyMachine={candyMachineV3.candyMachine}
      gatekeeperNetwork={gatekeeperNetwork}
      isMinting={candyMachineV3.status.minting}
      setIsMinting={() => { }}
      isActive={!!candyMachineV3.items.remaining}
      isEnded={guardStates.isEnded}
      isSoldOut={!candyMachineV3.items.remaining}
      guardStates={guardStates}
      onMint={startMint}
      prices={prices}
    />
  );

  const solCost = useMemo(
    () =>
    prices
      ? prices.payment
      .filter(({ kind }) => kind === "sol")
      .reduce((a, { price }) => a + price, 0)
    : 0,
    [prices]
  );

  const tokenCost = useMemo(
    () =>
    prices
      ? prices.payment
      .filter(({ kind }) => kind === "token")
      .reduce((a, { price }) => a + price, 0)
    : 0,
    [prices]
  );

  let candyPrice = null;
  if (prices.payment.filter(({kind}) => kind === "token").reduce((a, { kind }) => a + kind, "")) {
    candyPrice = `${tokenCost} Token`
  } else if (prices.payment.filter(({kind}) => kind === "sol").reduce((a, { price }) => a + price, 0)) {
    candyPrice = `◎ ${solCost}`
  } else {
    candyPrice = "1 NFT"
  }

  return (
    <main>
      <>
        <Header>
          <WalletContainer>
            <Wallet>
              {wallet ? (
                <WalletAmount>
                  {(balance || 0).toLocaleString()} SOL
                  <ConnectButton />
                </WalletAmount>
              ) : (
                <ConnectButton>Connect Wallet</ConnectButton>
              )}
            </Wallet>
          </WalletContainer>
        </Header>
        <Section>
          <Container>
            <Column>
              <div className="image-wrap">
                <Image />
              </div>
            </Column>
            <Column>
              <Content>
                <CollectionName>Max's Test NFT Collection</CollectionName>
                <InfoRow>
                  {guardStates.isStarted && wallet.publicKey && (
                    <InfoBox>
                      <p>NFTS AVAILABLE</p>
                      <p>{candyMachineV3.items.available}{" "}</p>
                    </InfoBox>
                  )}
                </InfoRow>
                <CollectionDescription>This is my test nft collection made by Metaplex and Candy Machine V3</CollectionDescription>
              </Content>
              <Other>
                {!guardStates.isStarted ? (
                  
                  <Countdown
                    date={guards.startTime}
                    renderer={renderGoLiveDateCounter}
                    onComplete={() => {
                      candyMachineV3.refresh();
                    }}
                  />
                ) : !wallet?.publicKey ? (
                  <ConnectWallet>Connect Wallet</ConnectWallet>
                  // ) : !guardStates.canPayFor ? (
                  //   <h1>You cannot pay for the mint</h1>
                ) : !guardStates.isWalletWhitelisted ? (
                  <PrivateWrap>
                    <PrivateText>Mint is private</PrivateText>
                    <PrivateSubtext>You’re currently not allowed to mint. Try again at a later time.</PrivateSubtext>
                  </PrivateWrap>
                ) : (
                  <>
                    <>
                      {!!candyMachineV3.items.remaining &&
                       guardStates.hasGatekeeper &&
                       wallet.publicKey &&
                       wallet.signTransaction ? (
                         <GatewayProvider
                           wallet={{
                             publicKey: wallet.publicKey,
                             //@ts-ignore
                             signTransaction: wallet.signTransaction,
                           }}
                           gatekeeperNetwork={guards.gatekeeperNetwork}
                           connection={connection}
                           cluster={
                             process.env.NEXT_PUBLIC_SOLANA_NETWORK || "devnet"
                           }
                           options={{ autoShowModal: false }}
                         >
                           <MintButton
                             gatekeeperNetwork={guards.gatekeeperNetwork}
                           />
                         </GatewayProvider>
                       ) : (
                         <MintButton />
                       )}
                    </>
                  </>
                )}

                <ProgressbarWrap>
                  {guardStates.isStarted && wallet.publicKey && (
                    <MintCount>
                      Total minted {candyMachineV3.items.redeemed} /  
                      {candyMachineV3.items.available}{" "}
                      {(guards?.mintLimit?.mintCounter?.count ||
                        guards?.mintLimit?.settings?.limit) && (
                          <MintedByYou>
                            <>
                              ({guards?.mintLimit?.mintCounter?.count || "0"}
                              {guards?.mintLimit?.settings?.limit && (
                                <>/{guards?.mintLimit?.settings?.limit} </>
                              )}
                              by you)
                            </>
                          </MintedByYou>
                        )}
                    </MintCount>
                  )}
                  {guardStates.isStarted && wallet.publicKey && (
                    <div className="w-100">
                      <BorderLinearProgress variant="determinate" value={(candyMachineV3.items.redeemed * 100 / candyMachineV3.items.available)}></BorderLinearProgress>
                    </div>
                  )}
                </ProgressbarWrap>


                <NftsModal
                  openOnSolscan={openOnSolscan}
                  mintedItems={mintedItems || []}
                  setMintedItems={setMintedItems}
                />
              </Other>
            </Column>
          </Container>
        </Section>
      </>
      <Snackbar
        open={alertState.open}
        autoHideDuration={6000}
        onClose={() => setAlertState({ ...alertState, open: false })}
      >
        <Alert
          onClose={() => setAlertState({ ...alertState, open: false })}
          severity={alertState.severity}
        >
          {alertState.message}
        </Alert>
      </Snackbar> 
    </main>
  );
};

export default Home;

const renderGoLiveDateCounter = ({ days, hours, minutes, seconds }: any) => {
  return (
    <StartTimerWrap>
      <StartTimerSubtitle>Mint opens in:</StartTimerSubtitle>
      <StartTimer>
        <StartTimerInner elevation={1}>
          <span>{days}</span>Days
        </StartTimerInner>
        <StartTimerInner elevation={1}>
          <span>{hours}</span>
          Hours
        </StartTimerInner>
        <StartTimerInner elevation={1}>
          <span>{minutes}</span>Mins
        </StartTimerInner>
        <StartTimerInner elevation={1}>
          <span>{seconds}</span>Secs
        </StartTimerInner>
      </StartTimer>
    </StartTimerWrap>
  );
};
