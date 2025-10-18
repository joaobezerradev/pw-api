import { describe, it, expect, beforeAll } from 'vitest';
import { GDeliveryConnection } from '@infra/connections';
import { GMBanRole } from '@infra/clients';

// Setup ENVs para teste
beforeAll(() => {
  process.env.GAME_SERVER_HOST = '127.0.0.1';
  process.env.GDELIVERY_PORT = '29100';
  process.env.GDELIVERY_TIMEOUT = '20000';
});

const TEST_ROLE_ID = 1073;

describe('GMBanRole - Teste de Integração', () => {
  it('deve banir personagem com sucesso', async () => {
    const connection = new GDeliveryConnection();
    const gmBanRole = new GMBanRole(connection);
    
    await expect(
      gmBanRole.execute({
        roleId: TEST_ROLE_ID,
        time: 60,
        reason: 'Teste de ban temporário',
      })
    ).resolves.toBeUndefined();
  }, 10000);

  it('deve remover ban com sucesso', async () => {
    const connection = new GDeliveryConnection();
    const gmBanRole = new GMBanRole(connection);
    
    await expect(
      gmBanRole.unban({
        roleId: TEST_ROLE_ID,
        reason: 'Teste de unban',
      })
    ).resolves.toBeUndefined();
  }, 10000);

  it('deve banir com tempo longo', async () => {
    const connection = new GDeliveryConnection();
    const gmBanRole = new GMBanRole(connection);
    
    await expect(
      gmBanRole.execute({
        roleId: TEST_ROLE_ID,
        time: 86400,
        reason: 'Teste de ban longo',
      })
    ).resolves.toBeUndefined();
  }, 10000);

  it('deve fazer unban novamente', async () => {
    const connection = new GDeliveryConnection();
    const gmBanRole = new GMBanRole(connection);
    
    await expect(
      gmBanRole.unban({
        roleId: TEST_ROLE_ID,
      })
    ).resolves.toBeUndefined();
  }, 10000);
});
