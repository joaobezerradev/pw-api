/**
 * RoleActions - Testes de Integração
 */
import { describe, it, expect } from 'vitest';
import { GameConnection } from '../core/game-connection';
import { RoleActions } from './role-actions';

const config = {
  host: '127.0.0.1',
  port: 29400,
};

const TEST_ROLE_ID = 1073;
const INVALID_ROLE_ID = 99999;

describe('RoleActions - Testes de Integração', () => {
  describe('getBase', () => {
    it('deve retornar dados básicos com sucesso', async () => {
      const client = new GameConnection(config.host, config.port);
      const actions = new RoleActions(client);

      try {
        const result = await actions.getBase(TEST_ROLE_ID);

        expect(result.retcode).toBe(0);
        expect(result.data).toBeDefined();
        expect(result.data?.id).toBe(TEST_ROLE_ID);
        expect(result.data?.name).toBe('JJJ');
      } finally {
      }
    });

    it('deve retornar erro para roleId inválido', async () => {
      const client = new GameConnection(config.host, config.port);
      const actions = new RoleActions(client);

      try {
        const result = await actions.getBase(INVALID_ROLE_ID);

        expect(result.retcode).not.toBe(0);
        expect(result.data).toBeUndefined();
      } finally {
      }
    });
  });

  describe('getStatus', () => {
    it('deve retornar status com sucesso', async () => {
      const client = new GameConnection(config.host, config.port);
      const actions = new RoleActions(client);

      try {
        const result = await actions.getStatus(TEST_ROLE_ID);

        expect(result.retcode).toBe(0);
        expect(result.data).toBeDefined();
        expect(result.data?.level).toBeGreaterThan(0);
        expect(result.data?.hp).toBeGreaterThan(0);
      } finally {
      }
    });
  });

  describe('getFullData', () => {
    it('deve retornar todos os dados em paralelo', async () => {
      const client = new GameConnection(config.host, config.port);
      const actions = new RoleActions(client);

      try {
        const result = await actions.getFullData(TEST_ROLE_ID);

        expect(result.retcode).toBe(0);
        expect(result.data).toBeDefined();
        expect(result.data?.base.name).toBe('JJJ');
        expect(result.data?.status.level).toBeGreaterThan(0);
        expect(result.data?.pocket).toBeDefined();
        expect(result.data?.equipment).toBeInstanceOf(Array);
      } finally {
      }
    });

    it('deve retornar erro para roleId inválido', async () => {
      const client = new GameConnection(config.host, config.port);
      const actions = new RoleActions(client);

      try {
        const result = await actions.getFullData(INVALID_ROLE_ID);

        expect(result.retcode).not.toBe(0);
        expect(result.data).toBeNull();
      } finally {
      }
    });
  });
});

