import React, { Suspense } from "react";
import Head from 'next/head';
import dynamic from "next/dynamic";
const DynamicMain = dynamic(() => import('../src/main'), {
  suspense: true,
  ssr: false
})

const IndexPage = ({}) => {
  return (
    <Suspense fallback={`Loading...`}>
      <Head>
        <title>Neo CMv3</title>
        <meta charSet="utf-8"/>
        <meta name="viewport" content="width=device-width, height=device-height, initial-scale=1, shrink-to-fit=no"/>
        <meta name="theme-color" content="#000"/>
        <meta name="description" content="My very own Candy Machine on Solana"/>
        <meta name="keywords" content="Neo-CMv3, Candy Machine, Metaplex, Solana, NFT, non-fungible token, Web3, blockchain, SOL, mint, generative art, digital art, pfp, profile picture"/>
        <meta name="twitter:card" content="summary"/>
        <meta name="twitter:title" content="Neo-CMv3"/>
        <meta name="twitter:description" content="My very own Candy Machine on Solana"/>
        <meta name="twitter:image" content="public/favicon.ico"/>
        <link rel="icon" type="image/x-icon" href="favicon.ico"/>
      </Head>
      <DynamicMain />
    </Suspense>
  );
};

export default IndexPage;
