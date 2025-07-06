/**
 * Utility functions for handling Ethereum addresses
 */

/**
 * Cleans an Ethereum address by removing double 0x prefixes
 * @param address The address to clean
 * @returns Clean address with single 0x prefix
 */
export function cleanAddress(address: string): string {
  if (!address) return address;

  // Remove double 0x prefix if it exists
  if (address.startsWith("0x0x")) {
    return address.slice(2);
  }

  // Ensure single 0x prefix
  if (!address.startsWith("0x")) {
    return `0x${address}`;
  }

  return address;
}

/**
 * Validates if an address has the correct format
 * @param address The address to validate
 * @returns True if the address format is valid
 */
export function isValidAddressFormat(address: string): boolean {
  if (!address) return false;

  // Check if it starts with 0x and has correct length (42 characters total)
  const cleanAddr = cleanAddress(address);
  return cleanAddr.startsWith("0x") && cleanAddr.length === 42;
}
