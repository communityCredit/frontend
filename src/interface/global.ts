export interface GetWalletResponse {
  balance: number;
  price: number;
  percent_change: number;
  nfts: NFT[];
  tokens: Token[];
}

export interface NFT {
  identifier: string;
  collection: string;
  contract: string;
  token_standard: string;
  name: string;
  description: string;
  image_url: string;
  display_image_url: string;
  display_animation_url: string;
  metadata_url: string;
  opensea_url: string;
  updated_at: string;
  is_disabled: string;
  is_nsfw: string;
}

export interface Token {
  id: number;
  name: string;
  contract_address: string;
  balance: number;
  price: number;
  percent_change: number;
}

export interface GasData {
  gasPricWei: string;
  gasPriceGwei: string;
  estimatedFeeWei: string;
}

export interface GasDataWithNonce {
  gasPricWei: string;
  gasPriceGwei: string;
  estimatedFeeWei: string;
  nonce: number;
}



// Define types for the command and response
export interface HaloCommand {
  name: string;
  keyNo: number;
  message: string;
  legacySignCommand?: boolean;
}

export interface HaloOptions {
  statusCallback: (cause: string) => void;
}

export interface HaloResponse {
  publicKey: string;
  signature: string;
  [key: string]: any; // For any additional fields in the response
}