import { BaseRpc, BufferWriter, BufferReader } from '../../core';

/**
 * Input do RPC RenameRole
 */
export type RenameRoleInput = {
  roleId: number;      // ID do personagem
  oldName: string;     // Nome antigo
  newName: string;     // Nome novo
};

/**
 * Output do RPC RenameRole
 */
export type RenameRoleOutput = {
  retcode: number;
};

/**
 * RPC RenameRole - Type 3404 (0xD4C)
 * Renomeia um personagem (role)
 * Porta: 29400 (GAMEDBD)
 * 
 * ⚠️ RECOMENDADO: Personagem deve estar OFFLINE para evitar problemas
 * 
 * @example
 * ```typescript
 * import { RenameRole } from './src';
 * 
 * // Uso independente
 * const result = await RenameRole.fetch('127.0.0.1', 29400, {
 *   roleId: 1073,
 *   oldName: 'NomeAntigo',
 *   newName: 'NovoNome',
 * });
 * 
 * if (result.retcode === 0) {
 *   console.log('✅ Personagem renomeado com sucesso!');
 * }
 * ```
 */
export class RenameRole extends BaseRpc<RenameRoleInput, RenameRoleOutput> {
  constructor(input: RenameRoleInput) {
    super(3404, input, { retcode: -1 }); // 0xD4C = 3404
  }

  marshalArgument(writer: BufferWriter): void {
    // retcode (sempre -1 no input)
    writer.writeInt32BE(-1);
    
    // roleid
    writer.writeInt32BE(this.input.roleId);
    
    // oldname (Octets)
    writer.writeOctetsString(this.input.oldName);
    
    // newname (Octets)
    writer.writeOctetsString(this.input.newName);
  }

  unmarshalResult(reader: BufferReader): void {
    // Lê localsid primeiro (como outros RPCs)
    const localsid = reader.readInt32BE();
    this.output.retcode = reader.readInt32BE();
  }

  /**
   * Renomeia um personagem
   * Método independente que não requer GameConnection
   */
  static async fetch(host: string, port: number, input: RenameRoleInput): Promise<RenameRoleOutput> {
    const rpc = new RenameRole(input);
    return this.executeRpc(host, port, rpc);
  }
}

