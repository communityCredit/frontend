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
import { cleanAddress } from "../utils/addressUtils";

export class HaloWallet {
  readonly address: Address;
  private publicClient?: PublicClient;

  constructor(address: string, publicClient?: PublicClient) {
    // Clean and validate the address to prevent double 0x prefix
    this.address = getAddress(cleanAddress(address));
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

    // Use viem's gas estimation for the transaction
    const gasEstimate = await this.publicClient.estimateGas({
      account: this.address,
      to: transaction.to,
      data: transaction.data,
      value: transaction.value ?? 0n,
    });

    // Get gas price from the network
    const gasPrice = await this.publicClient.getGasPrice();

    // Get nonce
    const nonce = await this.publicClient.getTransactionCount({
      address: this.address,
      blockTag: "pending",
    });

    // Prepare transaction with viem's estimated values
    const preparedTx = {
      to: transaction.to,
      data: transaction.data,
      value: transaction.value ?? 0n,
      gas: gasEstimate,
      gasPrice,
      nonce,
      chainId: transaction.chainId ?? 545,
    };

    const signedTx = await this.signTransaction(preparedTx);

    return await this.publicClient.sendRawTransaction({ serializedTransaction: signedTx });
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

    const signAddr = getAddress(cleanAddress(res.etherAddress));

    if (signAddr !== this.address) {
      throw new Error("This HaLo card is not currently active. Switch HaLo first.");
    }

    // Ensure the signature is properly formatted as hex with 0x prefix
    const signature = res.signature.ether;
    return (signature.startsWith("0x") ? signature : `0x${signature}`) as Hex;
  }

  async signTransaction(transaction: any): Promise<Hex> {
    // Prepare transaction for signing (legacy format for better compatibility)
    const tx = {
      to: transaction.to,
      data: transaction.data,
      value: transaction.value,
      gas: transaction.gas,
      gasPrice: transaction.gasPrice,
      nonce: transaction.nonce,
      chainId: transaction.chainId,
    };

    try {
      const serializedTx = serializeTransaction(tx as any);
      const digest = keccak256(serializedTx);

      const signatureHex = await this.signDigest(digest);

      // Validate signature format before parsing
      if (!signatureHex || typeof signatureHex !== "string") {
        throw new Error("Invalid signature format from HaLo");
      }

      // Ensure signature is 132 characters long (0x + 130 hex chars for r,s,v)
      if (signatureHex.length !== 132) {
        throw new Error(`Invalid signature length: ${signatureHex.length}, expected 132. Signature: ${signatureHex}`);
      }

      const signature = parseSignature(signatureHex);

      const signedTx = serializeTransaction(tx as any, signature);

      return signedTx;
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
