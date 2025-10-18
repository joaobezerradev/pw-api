import { BufferWriter } from '../buffer-writer';
import { BufferReader } from '../buffer-reader';


/**
 * Interface para protocolos Fire-and-Forget (sem resposta)
 * Usado para ações que apenas enviam dados e não esperam resposta
 */
export interface FireAndForgetAction<TInput> {
  /**
   * Executa o protocolo (envia e não espera resposta)
   */
  execute(input: TInput): Promise<void>;

  /**
   * Serializa os dados para envio
   */
  marshal(writer: BufferWriter, input: TInput): void;

  /**
   * Método unmarshal (não usado em fire-and-forget)
   */
  unmarshal(reader: BufferReader): void;

  /**
   * Retorna o tipo do protocolo
   */
  getType(): number;
}

