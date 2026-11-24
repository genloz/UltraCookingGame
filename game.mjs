import { actions, ingredients } from './recipes.mjs';

export const modes = {
  learner: { name: 'Learner', description: 'Follow the recipe one guided step at a time.' },
  easy: { name: 'Easy', description: 'See the full recipe and ask for hints while you cook.' },
  medium: { name: 'Medium', description: 'See the steps, but work out the timings yourself.' },
  hard: { name: 'Hard', description: 'Only the ingredients are shown. You choose the order, methods, and timings.' },
  creative: { name: 'Creative', description: 'Invent a dish from the world’s pantry and serve it to three judges.' },
  battle: { name: 'Battle · 13+', description: 'Race Chef Pepper to cook the same recipe. Quality wins; speed breaks a tie.' },
};

export const battleRules = { minimumAge: 13, rivalSeconds: 45, limitSeconds: 90 };
export const canBattle = (age) => Number.isInteger(age) && age >= battleRules.minimumAge;

export function pantryFor(world) {
  return [...new Set(world.recipes.flatMap(({ steps }) => steps.map(({ name }) => name)))].sort();
}

export function instructionsFor(mode, recipe, completed = 0) {
  if (mode === 'learner') return recipe.steps.slice(completed, completed + 1);
  if (mode === 'easy' || mode === 'battle') return recipe.steps;
  if (mode === 'medium') return recipe.steps.map(({ name, action }) => ({ name, action }));
  return [];
}

export function stepHint(step) {
  return `${step.action} ${step.name.toLowerCase()} for ${step.minutes} game ${step.minutes === 1 ? 'minute' : 'minutes'}. ${actions[step.action]}`;
}

export function checkStep(expected, actual) {
  if (!expected || !actual) return { points: 0, feedback: 'A step is missing.' };
  if (actual.name !== expected.name) return { points: 0, feedback: `Use ${expected.name.toLowerCase()} at this step.` };
  if (actual.action !== expected.action) return { points: 1, feedback: `${expected.action} ${expected.name.toLowerCase()} at this step.` };
  if (actual.minutes !== expected.minutes) {
    return { points: 2, feedback: `Aim for ${expected.minutes} game min rather than ${actual.minutes}.` };
  }
  return { points: 3, feedback: 'Method and timing are spot on.' };
}

export function judgeRecipe(recipe, moves) {
  const steps = recipe.steps.map((expected, index) => checkStep(expected, moves[index]));
  const score = Math.round(100 * steps.reduce((total, step) => total + step.points, 0) / (3 * steps.length));
  return { score, steps };
}

export function judgeCreative(moves) {
  const selected = moves.map(({ name }) => ingredients[name]);
  const roles = new Set(selected.map(({ role }) => role));
  const sharedFlavor = selected.some(({ flavors }, index) =>
    selected.slice(index + 1).some((other) => flavors.some((flavor) => other.flavors.includes(flavor))),
  );
  const technique = moves.map((move, index) => {
    const target = selected[index].methods[move.action];
    if (target === undefined) return `${move.action} is not a good fit for ${move.name.toLowerCase()}.`;
    if (target !== move.minutes) return `${move.name}: try ${target} game min for ${move.action.toLowerCase()}.`;
    return '';
  }).filter(Boolean);
  const panel = [
    { name: 'Chef Sage', liked: roles.size >= 2, feedback: roles.size >= 2
      ? 'Your ingredients play different roles in the dish.' : 'Try a mix of main ingredients, produce, or accents.' },
    { name: 'Chef Ember', liked: !technique.length, feedback: technique.length
      ? technique.join(' ') : 'Your methods and timings suit the ingredients.' },
    { name: 'Chef Zest', liked: sharedFlavor, feedback: sharedFlavor
      ? 'At least two ingredients share a flavor that ties the dish together.' : 'Try pairing ingredients with a flavor in common.' },
  ];
  return { yummy: panel.filter(({ liked }) => liked).length >= 2, panel };
}

export function rivalMovesAt(recipe, elapsedSeconds) {
  const count = Math.min(recipe.steps.length, Math.floor(elapsedSeconds * recipe.steps.length / battleRules.rivalSeconds));
  return recipe.steps.slice(0, count).map((step, index) =>
    index === recipe.steps.length - 1 ? { ...step, minutes: step.minutes + 1 } : step,
  );
}

export function battleOutcome(playerScore, elapsedSeconds, rivalScore) {
  if (playerScore !== rivalScore) return playerScore > rivalScore ? 'You win!' : 'Chef Pepper wins!';
  if (elapsedSeconds === battleRules.rivalSeconds) return 'It’s a tie!';
  return elapsedSeconds < battleRules.rivalSeconds ? 'You win on speed!' : 'Chef Pepper wins on speed!';
}
