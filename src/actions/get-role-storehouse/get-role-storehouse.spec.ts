import { describe, it, expect } from 'vitest';
import { GameConnection } from '../../core/game-connection';
import { GetRoleStorehouse } from '.';

const config = {
  host: '127.0.0.1',
  port: 29400,
};

const TEST_ROLE_ID = 1073;

describe('GetRoleStorehouse - Teste de Integração', () => {
  it('deve obter armazém do personagem com sucesso', async () => {
    const client = new GameConnection(config.host, config.port);
    
    try {
      const rpc = await client.call(new GetRoleStorehouse({ roleId: TEST_ROLE_ID }));
      
      // Verifica retcode
      expect(rpc.output.retcode).toBe(0);
      
      // Verifica storehouse
      expect(rpc.output.storehouse).toBeDefined();
      expect(rpc.output.storehouse?.capacity).toBeGreaterThan(0);
      expect(rpc.output.storehouse?.money).toBeGreaterThanOrEqual(0);
      expect(rpc.output.storehouse?.items).toBeInstanceOf(Array);
      expect(rpc.output.storehouse?.dress).toBeInstanceOf(Array);
      expect(rpc.output.storehouse?.material).toBeInstanceOf(Array);
      expect(rpc.output.storehouse?.generalcard).toBeInstanceOf(Array);
      
      // Se houver itens, verifica estrutura
      if (rpc.output.storehouse && rpc.output.storehouse.items.length > 0) {
        const item = rpc.output.storehouse.items[0];
        expect(item.id).toBeGreaterThan(0);
        expect(item.count).toBeGreaterThan(0);
        expect(item.data).toBeInstanceOf(Buffer);
      }
      
    } finally {
    }
  });

  it('deve retornar erro para roleId inválido', async () => {
    const client = new GameConnection(config.host, config.port);
    
    try {
      const rpc = await client.call(new GetRoleStorehouse({ roleId: 99999 }));
      
      expect(rpc.output.retcode).not.toBe(0);
      expect(rpc.output.storehouse).toBeUndefined();
      
    } finally {
    }
  });
});
