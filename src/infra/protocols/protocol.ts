import { BufferWriter } from '../io/buffer-writer';
import { BufferReader } from '../io/buffer-reader';

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
   * Converte o protocolo para string (para debug)
   */
  toString(): string {
    return `${this.constructor.name}(type=${this.type})`;
  }
}

