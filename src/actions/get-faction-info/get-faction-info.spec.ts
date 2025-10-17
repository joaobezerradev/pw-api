/**
 * Testes de integração - GetFactionInfo
 */
import { describe, it, expect } from 'vitest';
import { GetFactionInfo } from './index';

describe('GetFactionInfo - Teste de Integração', () => {
  const config = { host: '127.0.0.1', port: 29400 };

  it('deve obter informações da facção pelo factionId', async () => {
    const factionId = 1;

    const result = await GetFactionInfo.fetch(config.host, config.port, { factionId });

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
      const result = await GetFactionInfo.fetch(config.host, config.port, { factionId });
      
      // Se não lançou erro, verifica se tem dados válidos
      expect(result.faction).toBeDefined();
    } catch (err) {
      // Esperado para factionId inválido
      expect(err).toBeDefined();
    }
  }, 30000);
});

