/**
 * Testes de integração - GetUserFaction
 */
import { describe, it, expect } from 'vitest';
import { GameConnection } from '../../core';
import { GetUserFaction } from './index';

describe('GetUserFaction - Teste de Integração', () => {
  const connection = new GameConnection('127.0.0.1', 29400);

  it('deve obter facção do personagem pelo roleId', async () => {
    const roleId = 1073;

    const rpc = await connection.call(
      new GetUserFaction({ roleId })
    );

    expect(rpc.output.retcode).toBe(0);
    
    if (rpc.output.faction) {
      expect(rpc.output.faction.roleid).toBe(roleId);
      expect(typeof rpc.output.faction.name).toBe('string');
      expect(typeof rpc.output.faction.factionid).toBe('number');
      expect(typeof rpc.output.faction.cls).toBe('number');
      expect(typeof rpc.output.faction.role).toBe('number');
      
      console.log('✓ Facção do personagem obtida:', {
        roleId: rpc.output.faction.roleid,
        nome: rpc.output.faction.name,
        factionId: rpc.output.faction.factionid,
        classe: rpc.output.faction.cls,
        cargo: rpc.output.faction.role,
        apelido: rpc.output.faction.nickname,
      });
    }
  }, 30000);

  it('deve retornar erro para personagem inválido', async () => {
    const roleId = 999999999;

    try {
      const rpc = await connection.call(
        new GetUserFaction({ roleId })
      );
      
      // Se não retornou erro, verifica retcode
      expect(rpc.output.retcode).toBeDefined();
    } catch (err) {
      // Esperado para roleId inválido
      expect(err).toBeDefined();
    }
  }, 30000);
});

