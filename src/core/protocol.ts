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
  constructor(type: number) {
    super(type);
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
   * Implementação padrão de marshal para RPCs
   */
  marshal(writer: BufferWriter): void {
    this.marshalArgument(writer);
  }

  /**
   * Implementação padrão de unmarshal para RPCs
   */
  unmarshal(reader: BufferReader): void {
    this.unmarshalResult(reader);
  }
}

