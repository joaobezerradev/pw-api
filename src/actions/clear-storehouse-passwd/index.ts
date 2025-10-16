import { Rpc, BufferWriter, BufferReader } from '../../core';

/**
 * Input do RPC ClearStorehousePasswd
 */
export type ClearStorehousePasswdInput = {
  roleid: number;      // ID do personagem (ou userid dependendo do uso)
  rolename?: string;   // Nome do personagem (opcional, pode ser vazio)
};

/**
 * Output do RPC ClearStorehousePasswd
 */
export type ClearStorehousePasswdOutput = {
  retcode: number;
};

/**
 * RPC ClearStorehousePasswd - Type 3402 (0xD4A)
 * Remove o lock/senha do armazém da conta
 * Porta: 29400 (GAMEDBD)
 * 
 * ⚠️ IMPORTANTE: O personagem PRECISA estar OFFLINE/deslogado para funcionar!
 * 
 * @example
 * ```typescript
 * const connection = new GameConnection('127.0.0.1', 29400);
 * 
 * // ⚠️ Certifique-se que o personagem está OFFLINE antes de executar!
 * const rpc = await connection.call(new ClearStorehousePasswd({
 *   roleid: 1073,
 * }));
 * 
 * if (rpc.output.retcode === 0) {
 *   console.log('✅ Lock removido com sucesso!');
 * }
 * ```
 */
export class ClearStorehousePasswd extends Rpc {
  private input: ClearStorehousePasswdInput;
  public output: ClearStorehousePasswdOutput = { retcode: -1 };

  constructor(input: ClearStorehousePasswdInput) {
    super(3402); // 0xD4A = 3402
    this.input = input;
  }

  marshalArgument(writer: BufferWriter): void {
    // retcode (sempre -1 no input)
    writer.writeInt32BE(-1);
    
    // roleid (pode ser userid ou roleid dependendo do contexto)
    writer.writeInt32BE(this.input.roleid);
    
    // rolename (Octets) - pode ser vazio
    writer.writeOctetsString(this.input.rolename || '');
    
    // reserved (Octets) - sempre vazio
    writer.writeOctetsString('');
  }

  unmarshalResult(reader: BufferReader): void {
    // Lê localsid primeiro (como outros RPCs)
    const localsid = reader.readInt32BE();
    this.output.retcode = reader.readInt32BE();
  }
}

