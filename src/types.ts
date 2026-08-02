export interface SymptomRecord {
  fatigueLevel: number; // 0-10
  brainFog: number; // 0-10
  musclePain: number; // 0-10
  sleepQuality: number; // 0-10 (unrefreshing sleep)
  postExertionalMalaise: boolean;
  orthostaticIntolerance: boolean; // 站立不耐受
  additionalNotes: string;
}

export interface StepStatus {
  id: number;
  name: string;
  enName: string;
  status: 'locked' | 'unlocked' | 'active' | 'completed';
  description: string;
}
