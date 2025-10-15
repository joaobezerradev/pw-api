import { describe, it, expect } from 'vitest';
import { GameConnection } from '../../core/game-connection';
import { GetRolePocket } from '.';

const config = {
  host: '127.0.0.1',
  port: 29400,
};

const TEST_ROLE_ID = 1073;

describe('GetRolePocket - Teste de Integração', () => {
  it('deve obter inventário do personagem com sucesso', async () => {
    const client = new GameConnection(config.host, config.port);
    
    try {
      const rpc = await client.call(new GetRolePocket({ roleId: TEST_ROLE_ID }));
      
      // Verifica retcode
      expect(rpc.output.retcode).toBe(0);
      
      // Verifica pocket
      expect(rpc.output.pocket).toBeDefined();
      expect(rpc.output.pocket?.capacity).toBeGreaterThan(0);
      expect(rpc.output.pocket?.money).toBeGreaterThanOrEqual(0);
      expect(rpc.output.pocket?.items).toBeInstanceOf(Array);
      expect(rpc.output.pocket?.timestamp).toBeTypeOf('number');
      
      // Se houver itens, verifica estrutura
      if (rpc.output.pocket && rpc.output.pocket.items.length > 0) {
        const item = rpc.output.pocket.items[0];
        expect(item.id).toBeGreaterThan(0);
        expect(item.count).toBeGreaterThan(0);
        expect(item.max_count).toBeGreaterThan(0);
        expect(item.data).toBeInstanceOf(Buffer);
      }
      
    } finally {
    }
  });

  it('deve retornar erro para roleId inválido', async () => {
    const client = new GameConnection(config.host, config.port);
    
    try {
      const rpc = await client.call(new GetRolePocket({ roleId: 99999 }));
      
      expect(rpc.output.retcode).not.toBe(0);
      expect(rpc.output.pocket).toBeUndefined();
      
    } finally {
    }
  });
});

