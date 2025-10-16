/**
 * ForbidUser - Output (Resultado)
 */

export type ForbidUserOutput = {
  retcode: number;
  forbid?: {
    type: number;
    time: number;
    createtime: number;
    reason: string;
  };
};

