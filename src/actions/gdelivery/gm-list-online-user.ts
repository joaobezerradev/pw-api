import { Protocol, BufferWriter, BufferReader, GDeliveryConnection } from '../../core';

/**
 * Namespace GMListOnlineUser
 */
export namespace GMListOnlineUser {
  export type OnlinePlayer = {
    userid: number;
    roleid: number;
    linkid: number;
    localsid: number;
    gsid: number;
    status: number;
    name: string;
  };

  export type Input = {
    gmRoleId: number;
    localsid?: number;
    handler?: number;
    cond?: string;
  };

  export type Output = {
    retcode: number;
    nextHandler: number;
    players: OnlinePlayer[];
  };
}

/**
 * Protocol GMListOnlineUser - Type 352 (0x160)
 * Lista todos os usuários online no servidor
 */
export class GMListOnlineUser extends Protocol {
  private gmRoleId: number;
  private localsid: number;
  private handler: number;
  private cond: string;
  
  public retcode: number = -1;
  public responseHandler: number = -1;
  public userlist: GMListOnlineUser.OnlinePlayer[] = [];

  constructor(
    private readonly connection: GDeliveryConnection,
    params: GMListOnlineUser.Input
  ) {
    super(352);
    this.gmRoleId = params.gmRoleId;
    this.localsid = params.localsid ?? 1;
    this.handler = params.handler ?? -1;
    this.cond = params.cond ?? '';
  }

  marshal(writer: BufferWriter): void {
    writer.writeInt32BE(this.gmRoleId);
    writer.writeUInt32BE(this.localsid);
    writer.writeInt32BE(this.handler);
    
    if (this.cond) {
      writer.writeOctetsString(this.cond);
    } else {
      writer.writeCompactUINT(1);
      writer.writeUInt8(1);
    }
  }

  unmarshal(reader: BufferReader): void {
    this.retcode = reader.readUInt32BE();
    reader.readInt32BE();
    reader.readInt32BE();
    this.responseHandler = reader.readUInt32BE();
    
    const count = reader.readCompactUINT();
    this.userlist = [];
    
    for (let i = 0; i < count; i++) {
      const player: GMListOnlineUser.OnlinePlayer = {
        userid: reader.readUInt32BE(),
        roleid: reader.readUInt32BE(),
        linkid: reader.readUInt32BE(),
        localsid: reader.readUInt32BE(),
        gsid: reader.readUInt32BE(),
        status: reader.readUInt8(),
        name: reader.readOctetsAsString(),
      };
      
      this.userlist.push(player);
    }
  }

  async executePage(params: GMListOnlineUser.Input): Promise<GMListOnlineUser.Output> {
    this.gmRoleId = params.gmRoleId;
    this.localsid = params.localsid ?? 1;
    this.handler = params.handler ?? -1;
    this.cond = params.cond ?? '';

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
      let foundResponse = false;
      
      socket.on('data', (data: Buffer) => {
        responseBuffer = Buffer.concat([responseBuffer, data]);
        if (foundResponse) return;
        
        try {
          const reader = new BufferReader(responseBuffer);
          
          while (reader.hasMore()) {
            const startPos = reader.getOffset();
            
            try {
              const responseType = reader.readCompactUINT();
              const size = reader.readCompactUINT();
              
              if (responseType === 353) {
                this.unmarshal(reader);
                foundResponse = true;
                socket.end();
                
                if (this.retcode === 0) {
                  resolve({
                    retcode: this.retcode,
                    nextHandler: this.responseHandler,
                    players: this.userlist,
                  });
                } else {
                  reject(new Error(`GMListOnlineUser failed with retcode: ${this.retcode}`));
                }
                break;
              } else {
                reader.setOffset(reader.getOffset() + size);
              }
            } catch (e) {
              reader.setOffset(startPos);
              break;
            }
          }
        } catch (error) {
          // Aguarda mais dados
        }
      });
      
      socket.on('connect', () => {
        try {
          const dataWriter = new BufferWriter();
          this.marshal(dataWriter);
          const data = dataWriter.toBuffer();
          
          const writer = new BufferWriter();
          writer.writeCompactUINT(this.getType());
          writer.writeCompactUINT(data.length);
          writer.writeBuffer(data);
          
          socket.write(writer.toBuffer());
        } catch (error) {
          socket.destroy();
          reject(error);
        }
      });
      
      socket.connect(this.connection.port, this.connection.host);
    });
  }

  async executeAll(params: Omit<GMListOnlineUser.Input, 'handler'>): Promise<GMListOnlineUser.OnlinePlayer[]> {
    const allPlayers: GMListOnlineUser.OnlinePlayer[] = [];
    let handler = -1;
    
    do {
      try {
        const result = await this.executePage({
          ...params,
          handler,
        });
        
        allPlayers.push(...result.players);
        handler = result.nextHandler;
        
        if (handler < 0 && handler !== -1) {
          handler = handler >>> 0;
        }
        
        if (handler === 4294967295 || handler === 0xFFFFFFFF) {
          break;
        }
        
      } catch (error: any) {
        throw error;
      }
      
    } while (true);
    
    return allPlayers;
  }
}
