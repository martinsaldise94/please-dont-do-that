import { copyRules } from './copy.js';
import { layoutRules } from './layout.js';
import { visualRules } from './visual.js';
import { credibilityRules } from './credibility.js';

export const rules = [...copyRules, ...layoutRules, ...visualRules, ...credibilityRules];
