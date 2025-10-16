import { GameConnection, LogLevel, Rpc, BufferWriter, BufferReader } from './src';

// GetUserFaction - Type 4607
class GetUserFaction extends Rpc {
  private roleId: number;
  public output: any = { retcode: -1 };

  constructor(roleId: number) {
    super(0x11FF); // 4607
    this.roleId = roleId;
  }

  marshalArgument(writer: BufferWriter): void {
    // Testar sem o reason, só o roleId
    writer.writeUInt32BE(this.roleId);  // rid apenas
  }

  unmarshalResult(reader: BufferReader): void {
    console.log('Total bytes recebidos:', reader.size());
    console.log('Buffer completo (hex):', reader['buffer'].toString('hex').substring(0, 100));
    
    this.output.retcode = reader.readInt32BE();
    console.log('Retcode lido:', this.output.retcode);
    
    if (reader.hasMore()) {
      console.log('Bytes restantes após retcode:', reader.size() - reader.getOffset());
    }
  }
}

async function test() {
  console.log('=== Teste V2: GetUserFaction na porta 29300 ===\n');
  
  const connection = new GameConnection('127.0.0.1', 29300, LogLevel.INFO);
  
  try {
    const rpc = await connection.call(new GetUserFaction(1073));
    console.log('\nOutput final:', rpc.output);
  } catch (err: any) {
    console.error('Erro:', err.message);
  }
}

test();
