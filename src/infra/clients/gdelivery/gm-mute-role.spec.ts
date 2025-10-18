import { describe, it, expect, beforeAll } from 'vitest';
import { GDeliveryConnection } from '@infra/connections';
import { GMMuteRole } from '@infra/clients';

// Setup ENVs para teste
beforeAll(() => {
  process.env.GAME_SERVER_HOST = '127.0.0.1';
  process.env.GDELIVERY_PORT = '29100';
  process.env.GDELIVERY_TIMEOUT = '20000';
});

const TEST_ROLE_ID = 1073;

describe('GMMuteRole - Teste de Integração', () => {
  it('deve mutar personagem com sucesso', async () => {
    const connection = new GDeliveryConnection();
    const gmMuteRole = new GMMuteRole(connection);
    
    await expect(
      gmMuteRole.execute({
        roleId: TEST_ROLE_ID,
        time: 60,
        reason: 'Teste de mute temporário',
      })
    ).resolves.toBeUndefined();
  }, 10000);

  it('deve desmutar personagem com sucesso', async () => {
    const connection = new GDeliveryConnection();
    const gmMuteRole = new GMMuteRole(connection);
    
    await expect(
      gmMuteRole.unmute({
        roleId: TEST_ROLE_ID,
        reason: 'Teste de unmute',
      })
    ).resolves.toBeUndefined();
  }, 10000);

  it('deve mutar com tempo longo', async () => {
    const connection = new GDeliveryConnection();
    const gmMuteRole = new GMMuteRole(connection);
    
    await expect(
      gmMuteRole.execute({
        roleId: TEST_ROLE_ID,
        time: 3600,
        reason: 'Teste de mute longo',
      })
    ).resolves.toBeUndefined();
  }, 10000);

  it('deve desmutar novamente', async () => {
    const connection = new GDeliveryConnection();
    const gmMuteRole = new GMMuteRole(connection);
    
    await expect(
      gmMuteRole.unmute({
        roleId: TEST_ROLE_ID,
      })
    ).resolves.toBeUndefined();
  }, 10000);
});
