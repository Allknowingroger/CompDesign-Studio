
export enum DesignMode {
  INTRO = 'INTRO',
  PARAMETRIC = 'PARAMETRIC',
  ALGORITHMIC = 'ALGORITHMIC',
  AI_GENERATIVE = 'AI_GENERATIVE',
  IMAGE_EDIT = 'IMAGE_EDIT'
}

export interface SuperformulaParams {
  m: number;
  n1: number;
  n2: number;
  n3: number;
  a: number;
  b: number;
  resolution: number;
}

export interface FractalParams {
  angle: number;
  depth: number;
  lengthMultiplier: number;
  branchCount: number;
}
