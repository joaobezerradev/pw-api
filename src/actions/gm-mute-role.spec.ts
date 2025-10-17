import { describe, it, expect } from 'vitest';
import { GMMuteRole } from './gm-mute-role';

const config = {
  host: '127.0.0.1',
  port: 29100, // GDELIVERYD
};

const TEST_ROLE_ID = 1073;

describe('GMMuteRole - Teste de Integração', () => {
  it('deve mutar personagem com sucesso', async () => {
    await expect(
      GMMuteRole.send(config.host, config.port, {
        roleId: TEST_ROLE_ID,
        time: 60, // 1 minuto
        reason: 'Teste de mute',
      })
    ).resolves.toBeUndefined();
  }, 10000);

  it('deve desmutar personagem com sucesso', async () => {
    await expect(
      GMMuteRole.unmute(config.host, config.port, {
        roleId: TEST_ROLE_ID,
        reason: 'Teste de unmute',
      })
    ).resolves.toBeUndefined();
  }, 10000);

  it('deve mutar com tempo longo', async () => {
    await expect(
      GMMuteRole.send(config.host, config.port, {
        roleId: TEST_ROLE_ID,
        time: 3600, // 1 hora
        reason: 'Teste de mute longo',
      })
    ).resolves.toBeUndefined();
  }, 10000);

  it('deve desmutar novamente', async () => {
    await expect(
      GMMuteRole.unmute(config.host, config.port, {
        roleId: TEST_ROLE_ID,
      })
    ).resolves.toBeUndefined();
  }, 10000);
});

