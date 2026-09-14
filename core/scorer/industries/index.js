import { normalize } from '../industry-signals.js';
import { agenciesPortfolio } from './agencies-portfolio.js';
import { beautyWellness } from './beauty-wellness.js';
import { clinics } from './clinics.js';
import { ecommerce } from './ecommerce.js';
import { education } from './education.js';
import { fitnessGym } from './fitness-gym.js';
import { homeServices } from './home-services.js';
import { localRetail } from './local-retail.js';
import { professionalServices } from './professional-services.js';
import { restaurants } from './restaurants.js';
import { saasStartup } from './saas-startup.js';

export const INDUSTRIES = [
  agenciesPortfolio,
  beautyWellness,
  clinics,
  ecommerce,
  education,
  fitnessGym,
  homeServices,
  localRetail,
  professionalServices,
  restaurants,
  saasStartup,
];

export const INDUSTRY_IDS = [
  'agencies-portfolio',
  'beauty-wellness',
  'clinics',
  'ecommerce',
  'education',
  'fitness-gym',
  'home-services',
  'local-retail',
  'professional-services',
  'restaurants',
  'saas-startup',
];

export function resolveIndustry(name) {
  if (!name) return null;
  const key = normalize(name);
  return (
    INDUSTRIES.find(
      (industry) =>
        normalize(industry.id) === key || industry.aliases.some((a) => normalize(a) === key),
    ) ?? null
  );
}
