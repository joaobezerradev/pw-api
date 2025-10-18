import { BaseRpc, BufferWriter, BufferReader, GameDBConnection, RpcAction } from '../../core';

/**
 * Namespace GetFactionInfo
 */
export namespace GetFactionInfo {
  export type Input = {
    factionId: number;
  };

  export type FactionMember = {
    memberid: number;
    memberrole: number;
  };

  export type FactionInfo = {
    fid: number;
    name: string;
    level: number;
    masterid: number;
    masterrole: number;
    count: number;
    members: FactionMember[];
    announce: string;
    sysinfo: string;
  };

  export type Output = {
    retcode: number;
    faction?: FactionInfo;
  };
}

/**
 * RPC GetFactionInfo - Type 0x11FE (4606 decimal)
 * Obtém informações completas da facção pelo factionId
 */
export class GetFactionInfo extends BaseRpc<GetFactionInfo.Input, GetFactionInfo.Output> implements RpcAction<GetFactionInfo.Input, GetFactionInfo.Output> {
  constructor(private readonly connection: GameDBConnection) {
    super(0x11FE, {} as GetFactionInfo.Input, { retcode: -1 });
  }

  marshalArgument(writer: BufferWriter, input: GetFactionInfo.Input): void {
    writer.writeInt32BE(-1);
    writer.writeUInt32BE(input.factionId);
  }

  unmarshalResult(reader: BufferReader): void {
    reader.readUInt32BE();
    reader.readUInt32BE();

    const fid = reader.readUInt32BE();
    const name = reader.readOctetsAsString();
    const level = reader.readUInt8();
    
    const masterid = reader.readUInt32BE();
    const masterrole = reader.readUInt8();
    
    const count = reader.readCompactUINT();
    const members: GetFactionInfo.FactionMember[] = [];
    
    for (let i = 0; i < count; i++) {
      members.push({
        memberid: reader.readUInt32BE(),
        memberrole: reader.readUInt8(),
      });
    }
    
    const announce = reader.readOctetsAsString();
    const sysinfo = reader.readOctetsAsString();

    this.output.retcode = 0;
    this.output.faction = {
      fid,
      name,
      level,
      masterid,
      masterrole,
      count,
      members,
      announce,
      sysinfo,
    };
  }

  async execute(input: GetFactionInfo.Input): Promise<GetFactionInfo.Output> {
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
