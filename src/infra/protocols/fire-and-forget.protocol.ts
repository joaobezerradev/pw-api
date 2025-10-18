import { BufferWriter } from '../io/buffer-writer';
import { BufferReader } from '../io/buffer-reader';
import { Protocol } from './protocol';

/**
 * Fire-and-Forget Protocol
 * Protocolo que envia dados sem esperar resposta
 */
export abstract class FireAndForgetProtocol extends Protocol {
  constructor(type: number) {
    super(type);
  }

  /**
   * Serializa o protocolo
   */
  abstract marshal(writer: BufferWriter): void;

  /**
   * Deserializa o protocolo (geralmente não usado em fire-and-forget)
   */
  unmarshal(reader: BufferReader): void {
    // Fire-and-forget não espera resposta
  }
}
