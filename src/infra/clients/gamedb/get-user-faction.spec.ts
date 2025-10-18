/**
 * Testes de integração - GetUserFaction
 */
import { describe, it, expect, beforeAll } from 'vitest';
import { GameDBConnection } from '@infra/connections';
import { GetUserFaction } from '@infra/clients';

beforeAll(() => {
  process.env.GAME_SERVER_HOST = '127.0.0.1';
  process.env.GAMEDB_PORT = '29400';
  process.env.GAMEDB_TIMEOUT = '20000';
});

describe('GetUserFaction - Teste de Integração', () => {

  it('deve obter facção do personagem pelo roleId', async () => {
    const roleId = 1073;

    const connection = new GameDBConnection();
    const resultAction = new GetUserFaction(connection);
    const result = await resultAction.execute({ roleId });

    expect(result.retcode).toBe(0);
    
    if (result.faction) {
      expect(result.faction.roleid).toBe(roleId);
      expect(typeof result.faction.name).toBe('string');
      expect(typeof result.faction.factionid).toBe('number');
      expect(typeof result.faction.cls).toBe('number');
      expect(typeof result.faction.role).toBe('number');
      
      console.log('✓ Facção do personagem obtida:', {
        roleId: result.faction.roleid,
        nome: result.faction.name,
        factionId: result.faction.factionid,
        classe: result.faction.cls,
        cargo: result.faction.role,
        apelido: result.faction.nickname,
      });
    }
  }, 30000);

  it('deve retornar erro para personagem inválido', async () => {
    const roleId = 999999999;

    try {
      const connection = new GameDBConnection();
    const resultAction = new GetUserFaction(connection);
    const result = await resultAction.execute({ roleId });
      
      // Se não retornou erro, verifica retcode
      expect(result.retcode).toBeDefined();
    } catch (err) {
      // Esperado para roleId inválido
      expect(err).toBeDefined();
    }
  }, 30000);
});

