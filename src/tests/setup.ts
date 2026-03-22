import '@testing-library/jest-dom/vitest';

// Mock PeerVeClient global
class MockPeerVeClient {
  async pConnectToServer() {}
}
(globalThis as any).PeerVeClient = MockPeerVeClient;
