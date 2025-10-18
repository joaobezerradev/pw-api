import { describe, it, expect, beforeAll } from 'vitest';
import { GDeliveryConnection } from '@infra/connections';
import { GMListOnlineUser } from '@infra/clients';

// Setup ENVs para teste
beforeAll(() => {
  process.env.GAME_SERVER_HOST = '127.0.0.1';
  process.env.GDELIVERY_PORT = '29100';
  process.env.GDELIVERY_TIMEOUT = '30000';
});

describe('GMListOnlineUser - Teste de Integração', () => {
  it('deve buscar uma página de jogadores online', async () => {
    const connection = new GDeliveryConnection();
    const gmListOnlineUser = new GMListOnlineUser(connection, { gmRoleId: 32 });
    
    const result = await gmListOnlineUser.executePage({
      gmRoleId: 32,
      handler: -1,
    });

    expect(result).toBeDefined();
    expect(result.players).toBeInstanceOf(Array);
    expect(result.nextHandler).toBeTypeOf('number');
    
    if (result.players.length > 0) {
      const player = result.players[0];
      expect(player.userid).toBeTypeOf('number');
      expect(player.roleid).toBeTypeOf('number');
      expect(player.name).toBeTypeOf('string');
      expect(player.linkid).toBeTypeOf('number');
      expect(player.localsid).toBeTypeOf('number');
      expect(player.gsid).toBeTypeOf('number');
      expect(player.status).toBeTypeOf('number');
    }
  }, 30000);

  it('deve buscar todos os jogadores online', async () => {
    const connection = new GDeliveryConnection();
    const gmListOnlineUser = new GMListOnlineUser(connection, { gmRoleId: 32 });
    
    const players = await gmListOnlineUser.executeAll({
      gmRoleId: 32,
    });

    expect(players).toBeInstanceOf(Array);
    expect(players.length).toBeGreaterThanOrEqual(0);
    
    const roleIds = new Set(players.map(p => p.roleid));
    expect(roleIds.size).toBe(players.length);
    
    console.log(`✓ Total de jogadores online: ${players.length}`);
  }, 60000);

  it('deve lidar com servidor sem jogadores online', async () => {
    const connection = new GDeliveryConnection();
    const gmListOnlineUser = new GMListOnlineUser(connection, { gmRoleId: 32 });
    
    const result = await gmListOnlineUser.executePage({
      gmRoleId: 32,
      handler: -1,
    });

    expect(result.players).toBeInstanceOf(Array);
  }, 30000);
});
