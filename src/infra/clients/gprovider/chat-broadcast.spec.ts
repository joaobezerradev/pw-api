import { describe, it, expect, beforeAll } from 'vitest';
import { GProviderConnection } from '@infra/connections';
import { ChatBroadcast, ChatChannel } from '@infra/clients';

// Setup ENVs para teste
beforeAll(() => {
  process.env.GAME_SERVER_HOST = '127.0.0.1';
  process.env.GPROVIDER_PORT = '29300';
  process.env.GPROVIDER_TIMEOUT = '20000';
});

describe('ChatBroadcast - Teste de Integração', () => {
  it('deve enviar mensagem mundial com sucesso', async () => {
    const connection = new GProviderConnection();
    const chatBroadcast = new ChatBroadcast(connection);
    
    await expect(
      chatBroadcast.sendWorld({
        message: 'Teste de mensagem mundial',
      })
    ).resolves.toBeUndefined();
  }, 10000);

  it('deve enviar mensagem de sistema com sucesso', async () => {
    const connection = new GProviderConnection();
    const chatBroadcast = new ChatBroadcast(connection);
    
    await expect(
      chatBroadcast.sendSystem({
        message: 'Teste de mensagem de sistema',
      })
    ).resolves.toBeUndefined();
  }, 10000);

  it('deve enviar horn com sucesso', async () => {
    const connection = new GProviderConnection();
    const chatBroadcast = new ChatBroadcast(connection);
    
    await expect(
      chatBroadcast.sendHorn({
        message: 'Teste de horn',
        srcRoleId: 1073,
      })
    ).resolves.toBeUndefined();
  }, 10000);

  it('deve enviar broadcast customizado com sucesso', async () => {
    const connection = new GProviderConnection();
    const chatBroadcast = new ChatBroadcast(connection);
    
    await expect(
      chatBroadcast.execute({
        channel: ChatChannel.WORLD,
        message: 'Teste customizado',
        srcRoleId: 1073,
      })
    ).resolves.toBeUndefined();
  }, 10000);
});
