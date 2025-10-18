import { BaseRpc, BufferWriter, BufferReader, GameDBConnection, RpcAction } from '../../core';

/**
 * Namespace GetRoleStatus
 */
export namespace GetRoleStatus {
  export type Input = {
    roleId: number;
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
    status?: RoleStatus;
  };
}

/**
 * RPC GetRoleStatus - Type 0x0BC7 (3015 decimal)
 * Obtém apenas o status do personagem (level, HP, MP, posição, etc)
 */
export class GetRoleStatus extends BaseRpc<GetRoleStatus.Input, GetRoleStatus.Output> implements RpcAction<GetRoleStatus.Input, GetRoleStatus.Output> {
  constructor(private readonly connection: GameDBConnection) {
    super(0x0BC7, {} as GetRoleStatus.Input, { retcode: -1 });
  }

  marshalArgument(writer: BufferWriter, input: GetRoleStatus.Input): void {
    writer.writeInt32BE(-1);
    writer.writeUInt32BE(input.roleId);
  }

  unmarshalResult(reader: BufferReader): void {
    const localsid = reader.readInt32BE();
    this.output.retcode = reader.readInt32BE();

    if (this.output.retcode === 0 && reader.hasMore()) {
      this.output.status = this.unmarshalRoleStatus(reader);
    }
  }

  private unmarshalRoleStatus(reader: BufferReader): GetRoleStatus.RoleStatus {
    const status: GetRoleStatus.RoleStatus = {
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

    // Resto dos campos
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

  async execute(input: GetRoleStatus.Input): Promise<GetRoleStatus.Output> {
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
