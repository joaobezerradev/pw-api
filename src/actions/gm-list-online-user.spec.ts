import { describe, it, expect } from 'vitest';
import { GMListOnlineUser } from './gm-list-online-user';

const config = {
  host: '127.0.0.1',
  port: 29100, // GDELIVERYD
};

describe('GMListOnlineUser - Teste de Integração', () => {
  it('deve buscar uma página de jogadores online', async () => {
    const result = await GMListOnlineUser.fetchPage(config.host, config.port, {
      gmRoleId: 32,
      handler: -1, // Primeira página
    });

    expect(result).toBeDefined();
    expect(result.players).toBeInstanceOf(Array);
    expect(result.nextHandler).toBeTypeOf('number');
    
    // Verifica estrutura dos jogadores
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
    const players = await GMListOnlineUser.fetchAll(config.host, config.port, {
      gmRoleId: 32,
    });

    expect(players).toBeInstanceOf(Array);
    expect(players.length).toBeGreaterThanOrEqual(0);
    
    // Verifica que não há duplicatas (por roleid)
    const roleIds = new Set(players.map(p => p.roleid));
    expect(roleIds.size).toBe(players.length);
    
    console.log(`✓ Total de jogadores online: ${players.length}`);
  }, 60000);

  it('deve lidar com servidor sem jogadores online', async () => {
    // Este teste pode falhar se houver jogadores online
    // Mas deve sempre retornar um array
    const result = await GMListOnlineUser.fetchPage(config.host, config.port, {
      gmRoleId: 32,
      handler: -1,
    });

    expect(result.players).toBeInstanceOf(Array);
  }, 30000);
});

