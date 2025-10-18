import { RpcAction } from '@domain/contracts';
import { BaseRpc } from '@infra/protocols';
import { BufferWriter, BufferReader } from '@infra/io';
import { GameDBConnection } from '@infra/connections';

/**
 * Namespace GetUserFaction
 */
export namespace GetUserFaction {
  export type Input = {
    roleId: number;
  };

  export type UserFaction = {
    unk1: number;
    unk2: number;
    roleid: number;
    name: string;
    factionid: number;
    cls: number;
    role: number;
    delayexpel: Buffer;
    extend: Buffer;
    nickname: string;
  };

  export type Output = {
    retcode: number;
    faction?: UserFaction;
  };
}

/**
 * RPC GetUserFaction - Type 0x11FF (4607 decimal)
 * Obtém informações da facção do personagem pelo roleId
 */
export class GetUserFaction extends BaseRpc<GetUserFaction.Input, GetUserFaction.Output> implements RpcAction<GetUserFaction.Input, GetUserFaction.Output> {
  constructor(private readonly connection: GameDBConnection) {
    super(0x11FF, {} as GetUserFaction.Input, { retcode: -1 });
  }

  marshalArgument(writer: BufferWriter, input: GetUserFaction.Input): void {
    writer.writeInt32BE(-1);
    writer.writeUInt32BE(1);
    writer.writeUInt32BE(input.roleId);
  }

  unmarshalResult(reader: BufferReader): void {
    const unk1 = reader.readUInt32BE();
    const unk2 = reader.readUInt32BE();
    const roleid = reader.readUInt32BE();
    const name = reader.readOctetsAsString();
    const factionid = reader.readUInt32BE();
    const cls = reader.readUInt8();
    const role = reader.readUInt8();
    const delayexpel = reader.readOctets();
    const extend = reader.readOctets();
    const nickname = reader.readOctetsAsString();

    this.output.retcode = 0;
    this.output.faction = {
      unk1,
      unk2,
      roleid,
      name,
      factionid,
      cls,
      role,
      delayexpel,
      extend,
      nickname,
    };
  }

  async execute(input: GetUserFaction.Input): Promise<GetUserFaction.Output> {
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
