import { BufferWriter } from './buffer-writer';
import { BufferReader } from './buffer-reader';

/**
 * Classe base para todos os protocolos
 */
export abstract class Protocol {
  protected type: number;

  constructor(type: number) {
    this.type = type;
  }

  /**
   * Retorna o tipo do protocolo
   */
  getType(): number {
    return this.type;
  }

  /**
   * Serializa o protocolo para um buffer
   */
  abstract marshal(writer: BufferWriter): void;

  /**
   * Deserializa o protocolo de um buffer
   */
  abstract unmarshal(reader: BufferReader): void;

  /**
   * Codifica o protocolo completo (tipo + dados)
   */
  encode(): Buffer {
    const dataWriter = new BufferWriter();
    this.marshal(dataWriter);
    const data = dataWriter.toBuffer();

    const writer = new BufferWriter();
    writer.writeCompactUINT(this.type);
    writer.writeBuffer(data);

    return writer.toBuffer();
  }

  /**
   * Decodifica um protocolo de um buffer
   */
  static decode(buffer: Buffer): { type: number; data: Buffer } {
    const reader = new BufferReader(buffer);
    const type = reader.readCompactUINT();
    const data = reader.readRemainingBytes();
    return { type, data };
  }
}

/**
 * RPC Base
 */
export abstract class Rpc extends Protocol {
  protected xid: number = 0;

  constructor(type: number) {
    super(type);
  }

  /**
   * Define o XID da transa�0�4�0�0o
   */
  setXid(xid: number): void {
    this.xid = xid;
  }

  /**
   * Retorna o XID da transa�0�4�0�0o
   */
  getXid(): number {
    return this.xid;
  }

  /**
   * Serializa o argumento do RPC
   */
  abstract marshalArgument(writer: BufferWriter): void;

  /**
   * Deserializa o resultado do RPC
   */
  abstract unmarshalResult(reader: BufferReader): void;

  /**
   * Implementa�0�4�0�0o padr�0�0o de marshal para RPCs (Big-Endian)
   */
  marshal(writer: BufferWriter): void {
    // RPCs n�0�0o usam XID no marshal, apenas os argumentos
    this.marshalArgument(writer);
  }

  /**
   * Implementa�0�4�0�0o padr�0�0o de unmarshal para RPCs (Big-Endian)
   */
  unmarshal(reader: BufferReader): void {
    // L�� o retcode primeiro
    this.unmarshalResult(reader);
  }
}

