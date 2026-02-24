declare class PeerVeClient {
  constructor();
  pConnectToServer(
    token: string,
    dataHandler: (data: any) => void,
    options?: any
  ): Promise<void>;
}
