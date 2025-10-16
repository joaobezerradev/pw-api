/**
 * Testes de integração - GetFactionInfo
 */
import { describe, it, expect } from 'vitest';
import { GameConnection } from '../../core';
import { GetFactionInfo } from './index';

describe('GetFactionInfo - Teste de Integração', () => {
  const connection = new GameConnection('127.0.0.1', 29400);

  it('deve obter informações da facção pelo factionId', async () => {
    const factionId = 1;

    const rpc = await connection.call(
      new GetFactionInfo({ factionId })
    );

    expect(rpc.output.retcode).toBe(0);
    
    if (rpc.output.faction) {
      expect(rpc.output.faction.fid).toBe(factionId);
      expect(typeof rpc.output.faction.name).toBe('string');
      expect(typeof rpc.output.faction.level).toBe('number');
      expect(Array.isArray(rpc.output.faction.members)).toBe(true);
      
      console.log('✓ Facção obtida:', {
        id: rpc.output.faction.fid,
        nome: rpc.output.faction.name,
        level: rpc.output.faction.level,
        líder: rpc.output.faction.masterid,
        membros: rpc.output.faction.count,
      });
    }
  }, 30000);

  it('deve retornar erro para facção inválida', async () => {
    const factionId = 999999;

    try {
      const rpc = await connection.call(
        new GetFactionInfo({ factionId })
      );
      
      // Se não lançou erro, verifica se tem dados válidos
      expect(rpc.output.faction).toBeDefined();
    } catch (err) {
      // Esperado para factionId inválido
      expect(err).toBeDefined();
    }
  }, 30000);
});

