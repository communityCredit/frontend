import { execHaloCmdWeb } from "@arx-research/libhalo/api/web";
import {
  type Address,
  type Hex,
  type PublicClient,
  getAddress,
  hashMessage,
  hashTypedData,
  isAddress,
  keccak256,
  parseSignature,
  serializeTransaction,
} from "viem";

export class HaloWallet {
  readonly address: Address;
  private publicClient?: PublicClient;

  constructor(address: string, publicClient?: PublicClient) {
    this.address = getAddress(address);
    this.publicClient = publicClient;
  }

  getAddress(): Promise<Address> {
    return Promise.resolve(this.address);
  }

  connect(publicClient: PublicClient): HaloWallet {
    return new HaloWallet(this.address, publicClient);
  }

  async resolveName(name: string): Promise<Address> {
    if (isAddress(name)) {
      return getAddress(name);
    }

    if (!this.publicClient) {
      throw new Error("Public client required for ENS resolution");
    }

    throw new Error("ENS resolution not implemented");
  }

  async sendTransaction(transaction: any): Promise<Hex> {
    if (!this.publicClient) {
      throw new Error("Public client required for sending transactions");
    }

    const signedTx = await this.signTransaction(transaction);

    return signedTx;
  }

  async signDigest(digest: Hex): Promise<Hex> {
    let res;

    try {
      res = await execHaloCmdWeb({
        name: "sign",
        keyNo: 1,
        digest: digest.substring(2),
      });
    } catch (e) {
      throw e;
    }

    const signAddr = getAddress(`0x${res.etherAddress}`);

    if (signAddr !== this.address) {
      throw new Error("This HaLo card is not currently active. Switch HaLo first.");
    }

    return `0x${res.signature.ether}` as Hex;
  }

  async signTransaction(transaction: any): Promise<Hex> {
    const tx = {
      ...transaction,
      from: this.address,
      chainId: (transaction as any).chainId || 1,
    };

    const { from, ...txForSigning } = tx;

    try {
      const serializedTx = serializeTransaction(txForSigning as any);
      const digest = keccak256(serializedTx);

      const signatureHex = await this.signDigest(digest);

      const signature = parseSignature(signatureHex);

      return serializeTransaction(txForSigning as any, signature);
    } catch (error) {
      console.error("Transaction signing error:", error);
      throw new Error(`Failed to sign transaction: ${error}`);
    }
  }

  async signMessage(message: string): Promise<Hex> {
    const digest = hashMessage(message);
    return await this.signDigest(digest);
  }

  async signTypedData(params: { domain?: any; types: any; primaryType: string; message: any }): Promise<Hex> {
    const { domain, types, primaryType, message } = params;

    const digest = hashTypedData({
      domain,
      types,
      primaryType,
      message,
    });

    return await this.signDigest(digest);
  }
}
