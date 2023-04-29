export const isValidAddress = (address: string): boolean => {
    if (typeof address !== 'string') return false;
    if (!/^0x[0-9a-fA-F]{64}$/.test(address)) return false;
    return true;
}