import { Rpc, BufferWriter, BufferReader } from '../../core';

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
 * @example
 * ```typescript
 * const connection = new GameConnection('127.0.0.1', 29400);
 * 
 * const rpc = await connection.call(new RenameRole({
 *   roleId: 1073,
 *   oldName: 'NomeAntigo',
 *   newName: 'NovoNome',
 * }));
 * 
 * if (rpc.output.retcode === 0) {
 *   console.log('✅ Personagem renomeado com sucesso!');
 * }
 * ```
 */
export class RenameRole extends Rpc {
  private input: RenameRoleInput;
  public output: RenameRoleOutput = { retcode: -1 };

  constructor(input: RenameRoleInput) {
    super(3404); // 0xD4C = 3404
    this.input = input;
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
}

