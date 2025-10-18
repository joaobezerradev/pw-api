import { BaseRpc, BufferWriter, BufferReader, GameDBConnection, RpcAction } from '../../core';

/**
 * Namespace GetRoleBaseStatus
 */
export namespace GetRoleBaseStatus {
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
    status: number;
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

  export type RoleStatus = {
    version: number;
    level: number;
    level2: number;
    exp: number;
    sp: number;
    pp: number;
    hp: number;
    mp: number;
    posx: number;
    posy: number;
    posz: number;
    worldtag: number;
    invader_state: number;
    invader_time: number;
    pariah_time: number;
    reputation: number;
  };

  export type Output = {
    retcode: number;
    base?: RoleBase;
    status?: RoleStatus;
  };
}

/**
 * RPC GetRoleBaseStatus - Type 0x0BD1 (3025 decimal)
 * Obtém base + status do personagem (mais eficiente que 2 chamadas separadas)
 */
export class GetRoleBaseStatus extends BaseRpc<GetRoleBaseStatus.Input, GetRoleBaseStatus.Output> implements RpcAction<GetRoleBaseStatus.Input, GetRoleBaseStatus.Output> {
  constructor(private readonly connection: GameDBConnection) {
    super(0x0BD1, {} as GetRoleBaseStatus.Input, { retcode: -1 });
  }

  marshalArgument(writer: BufferWriter, input: GetRoleBaseStatus.Input): void {
    writer.writeInt32BE(-1);
    writer.writeUInt32BE(input.roleId);
  }

  unmarshalResult(reader: BufferReader): void {
    const localsid = reader.readInt32BE();
    this.output.retcode = reader.readInt32BE();

    if (this.output.retcode === 0 && reader.hasMore()) {
      this.output.base = this.unmarshalRoleBase(reader);
      
      if (reader.hasMore()) {
        this.output.status = this.unmarshalRoleStatus(reader);
      }
    }
  }

  private unmarshalRoleBase(reader: BufferReader): GetRoleBaseStatus.RoleBase {
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

    reader.readUInt8();
    reader.readUInt8();
    reader.readUInt8();

    return { version, id, name, race, cls, gender, custom_data, config_data, custom_stamp, 
             status, delete_time, create_time, lastlogin_time, forbid, help_states, 
             spouse, userid, cross_data };
  }

  private unmarshalRoleStatus(reader: BufferReader): GetRoleBaseStatus.RoleStatus {
    const status: GetRoleBaseStatus.RoleStatus = {
      version: reader.readUInt8(),
      level: reader.readInt32BE(),
      level2: reader.readInt32BE(),
      exp: reader.readInt32BE(),
      sp: reader.readInt32BE(),
      pp: reader.readInt32BE(),
      hp: reader.readInt32BE(),
      mp: reader.readInt32BE(),
      posx: reader.readFloatBE(),
      posy: reader.readFloatBE(),
      posz: reader.readFloatBE(),
      worldtag: reader.readUInt32BE(),
      invader_state: reader.readInt32BE(),
      invader_time: reader.readInt32BE(),
      pariah_time: reader.readInt32BE(),
      reputation: reader.readInt32BE(),
    };

    reader.readOctets();
    reader.readOctets();
    reader.readOctets();
    reader.readOctets();
    reader.readInt32BE();
    reader.readInt32BE();
    reader.readInt32BE();
    reader.readInt32BE();
    reader.readInt32BE();
    reader.readInt32BE();
    reader.readOctets();
    reader.readUInt16BE();
    reader.readOctets();
    reader.readOctets();
    reader.readOctets();
    reader.readOctets();
    reader.readOctets();
    reader.readOctets();
    reader.readOctets();
    reader.readOctets();
    reader.readOctets();
    reader.readOctets();
    reader.readOctets();
    reader.readOctets();
    reader.readOctets();
    reader.readOctets();
    reader.readOctets();
    reader.readOctets();
    reader.readOctets();
    reader.readInt32BE();

    return status;
  }

  async execute(input: GetRoleBaseStatus.Input): Promise<GetRoleBaseStatus.Output> {
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
