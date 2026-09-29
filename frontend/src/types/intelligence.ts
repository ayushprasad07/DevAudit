export type Confidence = 
    | "HIGH"
    | "MEDIUM"
    | "LOW"
    | "NONE";

export interface RuleEvaluation{
    ruleName : string;
    matched : boolean;
    confidence : Confidence
    reason : string;
}

export interface BreakingChange {
  version: string;
  type: string;
  title: string;
  description: string;
  confidence: Confidence;
  source?: string;
}