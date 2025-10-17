import { Protocol, BufferWriter, BufferReader } from '../core';

/**
 * Informações de usuário online
 */
export type OnlinePlayer = {
  userid: number;
  roleid: number;
  linkid: number;
  localsid: number;
  gsid: number;
  status: number;
  name: string;
};

/**
 * Protocol GMListOnlineUser - Type 352 (0x160)
 * Lista todos os usuários online no servidor
 * Porta: 29100 (GDELIVERYD)
 * 
 * Response: GMListOnlineUser_Re - Type 353 (0x161)
 * 
 * @example
 * ```typescript
 * import { GMListOnlineUser } from './src';
 * 
 * // Buscar todos os usuários online
 * const players = await GMListOnlineUser.fetchAll('127.0.0.1', 29100, {
 *   gmRoleId: 32,
 * });
 * 
 * console.log(`Total online: ${players.length}`);
 * players.forEach(player => {
 *   console.log(`${player.name} (ID: ${player.roleid})`);
 * });
 * ```
 */
export class GMListOnlineUser extends Protocol {
  private gmRoleId: number;
  private localsid: number;
  private handler: number;
  private cond: string;
  
  // Response data
  public retcode: number = -1;
  public responseHandler: number = -1;
  public userlist: OnlinePlayer[] = [];

  constructor(params: {
    gmRoleId: number;
    localsid?: number;
    handler?: number;
    cond?: string;
  }) {
    super(352); // 0x160
    this.gmRoleId = params.gmRoleId;
    this.localsid = params.localsid ?? 1;
    this.handler = params.handler ?? -1;
    this.cond = params.cond ?? '';
  }

  marshal(writer: BufferWriter): void {
    // gmroleid (int)
    writer.writeInt32BE(this.gmRoleId);
    
    // localsid (unsigned int)
    writer.writeUInt32BE(this.localsid);
    
    // handler (int) - usado para paginação
    writer.writeInt32BE(this.handler);
    
    // cond (Octets) - condição de busca
    // PHP usa WriteOctets(1) que escreve um byte com valor 1
    if (this.cond) {
      writer.writeOctetsString(this.cond);
    } else {
      // Escreve Octets vazio ou com 1 byte
      writer.writeCompactUINT(1); // tamanho = 1
      writer.writeUInt8(1);        // valor = 1
    }
  }

  unmarshal(reader: BufferReader): void {
    // Response: GMListOnlineUser_Re (353)
    // Seguindo a ordem do PHP:
    // ReadUInt32() - retcode
    // ReadInt32() - gmroleid
    // ReadInt32() - localsid
    // ReadUInt32() - handler
    // ReadCUInt32() - counter
    
    // retcode (unsigned int no PHP)
    this.retcode = reader.readUInt32BE();
    
    // gmroleid (int)
    reader.readInt32BE();
    
    // localsid (int no PHP)
    reader.readInt32BE();
    
    // handler (unsigned int) - próximo handler para paginação
    this.responseHandler = reader.readUInt32BE();
    
    // userlist counter (CompactUINT)
    const count = reader.readCompactUINT();
    this.userlist = [];
    
    for (let i = 0; i < count; i++) {
      // Seguindo a ordem do PHP:
      // userid (swap_endian + ReadUInt32)
      // roleid, linkid, localsid, gsid (ReadUInt32)
      // status (ReadByte)
      // name (ReadString)
      
      const player: OnlinePlayer = {
        userid: reader.readUInt32BE(), // PHP usa swap_endian, vamos tentar sem primeiro
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

  /**
   * Busca uma página de usuários online
   */
  static async fetchPage(host: string, port: number, params: {
    gmRoleId: number;
    localsid?: number;
    handler?: number;
    cond?: string;
  }): Promise<{
    players: OnlinePlayer[];
    nextHandler: number;
  }> {
    return new Promise((resolve, reject) => {
      const net = require('net');
      const socket = new net.Socket();
      
      socket.setTimeout(30000); // 30 segundos (pode demorar mais em servidores cheios)
      
      socket.on('error', (err: Error) => {
        reject(err);
      });
      
      socket.on('timeout', () => {
        socket.destroy();
        reject(new Error('Connection timeout'));
      });
      
      let responseBuffer = Buffer.alloc(0);
      
      let foundResponse = false;
      
      socket.on('data', (data: Buffer) => {
        responseBuffer = Buffer.concat([responseBuffer, data]);
        
        if (foundResponse) return; // Já processou a resposta
        
        try {
          const reader = new BufferReader(responseBuffer);
          
          // Pode receber múltiplos protocolos, procura pelo tipo 353
          while (reader.hasMore()) {
            const startPos = reader.getOffset();
            
            try {
              const responseType = reader.readCompactUINT();
              const size = reader.readCompactUINT();
              
              if (responseType === 353) {
                // GMListOnlineUser_Re encontrado!
                const protocol = new GMListOnlineUser(params);
                protocol.unmarshal(reader);
                
                foundResponse = true;
                socket.end();
                
                if (protocol.retcode === 0) {
                  resolve({
                    players: protocol.userlist,
                    nextHandler: protocol.responseHandler,
                  });
                } else {
                  reject(new Error(`GMListOnlineUser failed with retcode: ${protocol.retcode}`));
                }
                break;
              } else {
                // Pula protocolos extras (AnnounceServerAttribute, etc)
                reader.setOffset(reader.getOffset() + size);
              }
            } catch (e) {
              // Dados incompletos, volta para a posição inicial e aguarda mais dados
              reader.setOffset(startPos);
              break;
            }
          }
        } catch (error: any) {
          // Aguarda mais dados
        }
      });
      
      socket.on('connect', () => {
        try {
          const protocol = new GMListOnlineUser(params);
          
          // Monta o pacote
          const dataWriter = new BufferWriter();
          protocol.marshal(dataWriter);
          const data = dataWriter.toBuffer();
          
          const writer = new BufferWriter();
          writer.writeCompactUINT(protocol.getType());
          writer.writeCompactUINT(data.length);
          writer.writeBuffer(data);
          
          socket.write(writer.toBuffer());
        } catch (error) {
          socket.destroy();
          reject(error);
        }
      });
      
      socket.connect(port, host);
    });
  }

  /**
   * Busca TODOS os usuários online (loop automático)
   * Não tem limite de iterações - continua até handler = 0xFFFFFFFF
   */
  static async fetchAll(host: string, port: number, params: {
    gmRoleId: number;
    localsid?: number;
    cond?: string;
  }): Promise<OnlinePlayer[]> {
    const allPlayers: OnlinePlayer[] = [];
    let handler = -1;
    
    // Loop infinito até handler = 0xFFFFFFFF (4294967295 unsigned)
    do {
      try {
        const result = await this.fetchPage(host, port, {
          ...params,
          handler,
        });
        
        allPlayers.push(...result.players);
        handler = result.nextHandler;
        
        // Se handler for negativo e não for -1, converte para unsigned
        if (handler < 0 && handler !== -1) {
          handler = handler >>> 0; // Converte para unsigned
        }
        
        // Verifica se chegou ao fim (handler = 0xFFFFFFFF = 4294967295)
        if (handler === 4294967295 || handler === 0xFFFFFFFF) {
          break;
        }
        
      } catch (error: any) {
        throw error;
      }
      
    } while (true); // Loop infinito até handler = 0xFFFFFFFF
    
    return allPlayers;
  }
}

