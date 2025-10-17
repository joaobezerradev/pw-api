import { describe, it, expect } from 'vitest';
import { GMBanRole } from './gm-ban-role';

const config = {
  host: '127.0.0.1',
  port: 29100, // GDELIVERYD
};

const TEST_ROLE_ID = 1073;

describe('GMBanRole - Teste de Integração', () => {
  it('deve banir personagem com sucesso', async () => {
    await expect(
      GMBanRole.send(config.host, config.port, {
        roleId: TEST_ROLE_ID,
        time: 60, // 1 minuto
        reason: 'Teste de ban temporário',
      })
    ).resolves.toBeUndefined();
  }, 10000);

  it('deve remover ban com sucesso', async () => {
    await expect(
      GMBanRole.unban(config.host, config.port, {
        roleId: TEST_ROLE_ID,
        reason: 'Teste de unban',
      })
    ).resolves.toBeUndefined();
  }, 10000);

  it('deve banir com tempo longo', async () => {
    await expect(
      GMBanRole.send(config.host, config.port, {
        roleId: TEST_ROLE_ID,
        time: 86400, // 24 horas
        reason: 'Teste de ban longo',
      })
    ).resolves.toBeUndefined();
  }, 10000);

  it('deve fazer unban novamente', async () => {
    await expect(
      GMBanRole.unban(config.host, config.port, {
        roleId: TEST_ROLE_ID,
      })
    ).resolves.toBeUndefined();
  }, 10000);
});

