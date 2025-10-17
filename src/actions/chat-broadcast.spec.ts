import { describe, it, expect } from 'vitest';
import { ChatBroadcast, ChatChannel } from './chat-broadcast';

const config = {
  host: '127.0.0.1',
  port: 29300, // GPROVIDER
};

describe('ChatBroadcast - Teste de Integração', () => {
  it('deve enviar mensagem mundial com sucesso', async () => {
    await expect(
      ChatBroadcast.sendWorld(config.host, config.port, {
        message: 'Teste de mensagem mundial',
      })
    ).resolves.toBeUndefined();
  }, 10000);

  it('deve enviar mensagem de sistema com sucesso', async () => {
    await expect(
      ChatBroadcast.sendSystem(config.host, config.port, {
        message: 'Teste de mensagem de sistema',
      })
    ).resolves.toBeUndefined();
  }, 10000);

  it('deve enviar horn com sucesso', async () => {
    await expect(
      ChatBroadcast.sendHorn(config.host, config.port, {
        message: 'Teste de horn',
        srcRoleId: 1073,
      })
    ).resolves.toBeUndefined();
  }, 10000);

  it('deve enviar broadcast customizado com sucesso', async () => {
    await expect(
      ChatBroadcast.send(config.host, config.port, {
        channel: ChatChannel.WORLD,
        message: 'Teste customizado',
        srcRoleId: 0,
        emotion: 0,
        data: '',
      })
    ).resolves.toBeUndefined();
  }, 10000);
});

