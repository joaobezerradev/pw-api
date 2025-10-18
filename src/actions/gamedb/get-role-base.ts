import { BaseRpc, BufferWriter, BufferReader, GameDBConnection, RpcAction } from '../../core';

/**
 * Namespace GetRoleBase
 * Contém os tipos Input, Output e RoleBase
 */
export namespace GetRoleBase {
  export type Input = {
    roleId: number;
  };

  export type RoleBase = {
    version: number;
    id: number;
    name: string;
    race: number;
    cls: number;
    gender: number;
    custom_data: Buffer;
    config_data: Buffer;
    custom_stamp: number;
    status: number;  // 0 = normal, 1 = deletion pending, 2 = deleted
    delete_time: number;
    create_time: number;
    lastlogin_time: number;
    forbid: Array<{
      type: number;
      time: number;
      createtime: number;
      reason: string;
    }>;
    help_states: Buffer;
    spouse: number;
    userid: number;
    cross_data: Buffer;
  };

  export type Output = {
    retcode: number;
    base?: RoleBase;
  };
}

/**
 * RPC GetRoleBase - Type 0x0BC5 (3013 decimal)
 * Obtém apenas os dados básicos do personagem
 * Porta: 29400 (GAMEDBD)
 * 
 * @example
 * ```typescript
 * import { GetRoleBase, GameDBConnection } from './src';
 * 
 * // Cria conexão (valores vêm das ENVs)
 * const gamedb = new GameDBConnection();
 * 
 * // Instancia a action com a conexão
 * const getRoleBase = new GetRoleBase(gamedb);
 * 
 * // Executa o RPC
 * const result = await getRoleBase.execute({ roleId: 1024 });
 * 
 * if (result.retcode === 0) {
 *   console.log(`Nome: ${result.base?.name}`);
 *   console.log(`Nível: ${result.base?.cls}`);
 * }
 * ```
 */
export class GetRoleBase extends BaseRpc<GetRoleBase.Input, GetRoleBase.Output> implements RpcAction<GetRoleBase.Input, GetRoleBase.Output> {
  constructor(private readonly connection: GameDBConnection) {
    super(0x0BC5, {} as GetRoleBase.Input, { retcode: -1 }); // 3013
  }

  marshalArgument(writer: BufferWriter, input: GetRoleBase.Input): void {
    writer.writeInt32BE(-1);  // localsid (sempre -1)
    writer.writeUInt32BE(input.roleId);
  }

  unmarshalResult(reader: BufferReader): void {
    const localsid = reader.readInt32BE();
    this.output.retcode = reader.readInt32BE();

    if (this.output.retcode === 0 && reader.hasMore()) {
      this.output.base = this.unmarshalRoleBase(reader);
    }
  }

  private unmarshalRoleBase(reader: BufferReader): GetRoleBase.RoleBase {
    const version = reader.readUInt8();
    const id = reader.readInt32BE();
    const name = reader.readOctetsAsString();
    const race = reader.readInt32BE();
    const cls = reader.readInt32BE();
    const gender = reader.readUInt8();
    const custom_data = reader.readOctets();
    const config_data = reader.readOctets();
    const custom_stamp = reader.readInt32BE();
    const status = reader.readUInt8();
    const delete_time = reader.readInt32BE();
    const create_time = reader.readInt32BE();
    const lastlogin_time = reader.readInt32BE();

    const forbidCount = reader.readCompactUINT();
    const forbid = [];
    for (let i = 0; i < forbidCount; i++) {
      forbid.push({
        type: reader.readUInt8(),
        time: reader.readInt32BE(),
        createtime: reader.readInt32BE(),
        reason: reader.readOctetsAsString(),
      });
    }

    const help_states = reader.readOctets();
    const spouse = reader.readInt32BE();
    const userid = reader.readInt32BE();
    const cross_data = reader.readOctets();

    // reserved2, reserved3, reserved4
    reader.readUInt8();
    reader.readUInt8();
    reader.readUInt8();

    return { version, id, name, race, cls, gender, custom_data, config_data, custom_stamp, 
             status, delete_time, create_time, lastlogin_time, forbid, help_states, 
             spouse, userid, cross_data };
  }

  /**
   * Executa o RPC para buscar dados básicos de um personagem
   * Connection foi injetada no construtor
   */
  async execute(input: GetRoleBase.Input): Promise<GetRoleBase.Output> {
    this.input = input;
    const dataWriter = new BufferWriter();
    this.marshalArgument(dataWriter, input);
    const data = dataWriter.toBuffer();
    
    return new Promise((resolve, reject) => {
      const net = require('net');
      const socket = new net.Socket();
      
      socket.setTimeout(this.connection.timeout);
      
      socket.on('error', (err: Error) => reject(err));
      socket.on('timeout', () => {
        socket.destroy();
        reject(new Error('Connection timeout'));
      });
      
      let responseBuffer = Buffer.alloc(0);
      
      socket.on('data', (chunk: Buffer) => {
        responseBuffer = Buffer.concat([responseBuffer, chunk]);
        
        try {
          const reader = new BufferReader(responseBuffer);
          const responseType = reader.readCompactUINT();
          const size = reader.readCompactUINT();
          
          if (responseBuffer.length >= reader.getOffset() + size) {
            this.unmarshalResult(reader);
            socket.end();
            resolve(this.output);
          }
        } catch (error) {
          // Aguarda mais dados
        }
      });
      
      socket.on('connect', () => {
        const writer = new BufferWriter();
        writer.writeCompactUINT(this.getType());
        writer.writeCompactUINT(data.length);
        writer.writeBuffer(data);
        socket.write(writer.toBuffer());
      });
      
      socket.connect(this.connection.port, this.connection.host);
    });
  }
}

