import { BaseRpc, BufferWriter, BufferReader } from '../../core';

/**
 * Input do RPC GetUserRoles
 */
export type GetUserRolesInput = {
  userid: number;      // ID da conta
};

/**
 * Role info retornado
 */
export type RoleInfo = {
  roleid: number;
  rolename: string;
};

/**
 * Output do RPC GetUserRoles
 */
export type GetUserRolesOutput = {
  retcode: number;
  count: number;
  roles: RoleInfo[];
};

/**
 * RPC GetUserRoles - Type 3401 (0xD49)
 * Lista todos os personagens (roles) de uma conta
 * Porta: 29400 (GAMEDBD)
 * 
 * @example
 * ```typescript
 * import { GetUserRoles } from './src';
 * 
 * // Uso independente
 * const result = await GetUserRoles.fetch('127.0.0.1', 29400, {
 *   userid: 16,
 * });
 * 
 * if (result.retcode === 0) {
 *   console.log(`Personagens encontrados: ${result.count}`);
 *   result.roles.forEach(role => {
 *     console.log(`- ${role.rolename} (ID: ${role.roleid})`);
 *   });
 * }
 * ```
 */
export class GetUserRoles extends BaseRpc<GetUserRolesInput, GetUserRolesOutput> {
  constructor(input: GetUserRolesInput) {
    super(3401, input, { retcode: -1, count: 0, roles: [] }); // 0xD49 = 3401
  }

  marshalArgument(writer: BufferWriter): void {
    // retcode (sempre -1 no input)
    writer.writeInt32BE(-1);
    
    // userid
    writer.writeInt32BE(this.input.userid);
  }

  unmarshalResult(reader: BufferReader): void {
    // Lê localsid primeiro (como outros RPCs)
    const localsid = reader.readInt32BE();
    this.output.retcode = reader.readInt32BE();
    
    if (this.output.retcode === 0 && reader.hasMore()) {
      // Lê a lista de roles (IntOctetsVector)
      this.output.count = reader.readCompactUINT();
      this.output.roles = [];
      
      for (let i = 0; i < this.output.count; i++) {
        const roleid = reader.readUInt32BE();
        const rolename = reader.readOctetsAsString();
        
        this.output.roles.push({
          roleid,
          rolename
        });
      }
    }
  }

  /**
   * Busca lista de personagens de uma conta
   * Método independente que não requer GameConnection
   */
  static async fetch(host: string, port: number, input: GetUserRolesInput): Promise<GetUserRolesOutput> {
    const rpc = new GetUserRoles(input);
    return this.executeRpc(host, port, rpc);
  }
}

