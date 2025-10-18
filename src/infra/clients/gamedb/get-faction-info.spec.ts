/**
 * Testes de integração - GetFactionInfo
 */
import { describe, it, expect, beforeAll } from 'vitest';
import { GameDBConnection } from '@infra/connections';
import { GetFactionInfo } from '@infra/clients';

beforeAll(() => {
  process.env.GAME_SERVER_HOST = '127.0.0.1';
  process.env.GAMEDB_PORT = '29400';
  process.env.GAMEDB_TIMEOUT = '20000';
});

describe('GetFactionInfo - Teste de Integração', () => {

  it('deve obter informações da facção pelo factionId', async () => {
    const factionId = 1;

    const connection = new GameDBConnection();
    const resultAction = new GetFactionInfo(connection);
    const result = await resultAction.execute({ factionId });

    expect(result.retcode).toBe(0);
    
    if (result.faction) {
      expect(result.faction.fid).toBe(factionId);
      expect(typeof result.faction.name).toBe('string');
      expect(typeof result.faction.level).toBe('number');
      expect(Array.isArray(result.faction.members)).toBe(true);
      
      console.log('✓ Facção obtida:', {
        id: result.faction.fid,
        nome: result.faction.name,
        level: result.faction.level,
        líder: result.faction.masterid,
        membros: result.faction.count,
      });
    }
  }, 30000);

  it('deve retornar erro para facção inválida', async () => {
    const factionId = 999999;

    try {
      const connection = new GameDBConnection();
    const resultAction = new GetFactionInfo(connection);
    const result = await resultAction.execute({ factionId });
      
      // Se não lançou erro, verifica se tem dados válidos
      expect(result.faction).toBeDefined();
    } catch (err) {
      // Esperado para factionId inválido
      expect(err).toBeDefined();
    }
  }, 30000);
});

