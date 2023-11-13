export const CONTRACT_ADDRESS = "YOUR-CONTRACT-ADDRESS";

export function formatPkhString(pkh = "") {
  return pkh.substring(0, 5) + "..." + pkh.substring(pkh.length - 4);
}
