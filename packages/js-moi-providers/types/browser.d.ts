export interface MoiBrowserProvider {
    isVoyage: boolean;
    isConnected: boolean;
    host: string;
    request?: (method: string, params?: any[]) => Promise<any>
}
