import { Rpc, BufferWriter, BufferReader } from '../../core';

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
 * const connection = new GameConnection('127.0.0.1', 29400);
 * 
 * const rpc = await connection.call(new GetUserRoles({
 *   userid: 16,
 * }));
 * 
 * if (rpc.output.retcode === 0) {
 *   console.log(`Personagens encontrados: ${rpc.output.count}`);
 *   rpc.output.roles.forEach(role => {
 *     console.log(`- ${role.rolename} (ID: ${role.roleid})`);
 *   });
 * }
 * ```
 */
export class GetUserRoles extends Rpc {
  private input: GetUserRolesInput;
  public output: GetUserRolesOutput = { 
    retcode: -1,
    count: 0,
    roles: []
  };

  constructor(input: GetUserRolesInput) {
    super(3401); // 0xD49 = 3401
    this.input = input;
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
}

