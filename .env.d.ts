declare namespace NodeJS {
  interface ProcessEnv {
    [key: string]: string | undefined;
    

    NODE_ENV: 'test';
    JSON_RPC_URL: string;
    SRP: string;
    DEVIATION_PATH: string;
    WS_URL: string;
  }
}