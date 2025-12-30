export interface RelatedEmotion {
  id: string; // key for i18n
}

export interface Affect {
  id: string; // key for i18n
  related: string[]; // keys for i18n
}

export const AFFECTS: Affect[] = [
  {
    id: 'interest_excitement',
    related: ['curiosity', 'fascination', 'engagement', 'enthusiasm', 'flow', 'concentration']
  },
  {
    id: 'enjoyment_joy',
    related: ['happiness', 'gratitude', 'relief', 'euphoria', 'pride', 'contentment', 'love']
  },
  {
    id: 'surprise_startle',
    related: ['astonishment', 'shock', 'wonder', 'confusion', 'disorientation']
  },
  {
    id: 'fear_terror',
    related: ['anxiety', 'panic', 'nervousness', 'apprehension', 'dread', 'unease']
  },
  {
    id: 'anger_rage',
    related: ['irritation', 'frustration', 'hatred', 'resentment', 'bitterness', 'aggression']
  },
  {
    id: 'distress_anguish',
    related: ['sadness', 'grief', 'hopelessness', 'melancholy', 'helplessness', 'sorrow']
  },
  {
    id: 'shame_humiliation',
    related: ['embarrassment', 'shyness', 'guilt', 'insecurity', 'self_consciousness']
  },
  {
    id: 'disgust',
    related: ['aversion', 'revulsion', 'loathing', 'repulsion']
  },
  {
    id: 'dissmell',
    related: ['contempt', 'arrogance', 'disdain', 'coldness', 'judgmentalism']
  }
];
