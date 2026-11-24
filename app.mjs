import { actions, worlds } from './recipes.mjs';
import {
  battleOutcome, battleRules, canBattle, checkStep, instructionsFor, judgeCreative, judgeRecipe, modes, pantryFor, rivalMovesAt, stepHint,
} from './game.mjs';

const $ = (id) => document.getElementById(id);
const worldSelect = $('world');
const modeSelect = $('mode');
const recipeSelect = $('recipe');
const ingredientSelect = $('ingredient');
const actionSelect = $('action');
const minutesInput = $('minutes');
let round;
let timer;

function fillSelect(select, entries, placeholder) {
  select.replaceChildren(...(placeholder ? [new Option(placeholder, '')] : []),
    ...entries.map(([value, label]) => new Option(label, value)));
}

function fillList(id, items) {
  $(id).replaceChildren(...items.map((text) => {
    const item = document.createElement('li');
    item.textContent = text;
    return item;
  }));
}

fillSelect(worldSelect, worlds.map(({ icon, name }, index) => [index, `${icon} ${name}`]));
fillSelect(modeSelect, Object.entries(modes).map(([key, { name }]) => [key, name]));
fillSelect(actionSelect, Object.keys(actions).map((action) => [action, action]), 'Choose a method');
for (const [action, description] of Object.entries(actions)) {
  const term = document.createElement('dt');
  const definition = document.createElement('dd');
  term.textContent = action;
  definition.textContent = description;
  $('glossary').append(term, definition);
}

function updateSetup() {
  const mode = modeSelect.value;
  $('recipe-field').hidden = mode === 'creative';
  $('battle-gate').hidden = mode !== 'battle';
  $('age-confirmation').required = mode === 'battle';
  $('start').disabled = mode === 'battle' && !battleConfirmed();
  $('mode-description').textContent = modes[mode].description;
}

function battleConfirmed() {
  return canBattle($('age-confirmation').checked ? battleRules.minimumAge : undefined);
}

function selectWorld() {
  const world = worlds[worldSelect.value];
  $('world-description').textContent = world.description;
  fillSelect(recipeSelect, world.recipes.map(({ name }, index) => [index, name]));
}

function begin() {
  const mode = modeSelect.value;
  if (mode === 'battle' && !battleConfirmed()) return;
  const world = worlds[worldSelect.value];
  const recipe = mode === 'creative' ? null : world.recipes[recipeSelect.value];
  round = { mode, world, recipe, moves: [], finished: false, started: performance.now() };
  clearInterval(timer);
  $('setup').hidden = true;
  $('kitchen').hidden = false;
  $('result').hidden = true;
  $('retry').hidden = true;
  $('dish-name').value = '';
  $('feedback').textContent = '';
  $('name-field').hidden = mode !== 'creative';
  $('kitchen-label').textContent = `${world.icon} ${world.name} · ${modes[mode].name}`;
  $('dish').textContent = recipe?.name ?? 'Invent a recipe';
  $('clock').hidden = $('time-warning').hidden = $('rival').hidden = mode !== 'battle';
  $('time-warning').textContent = '';
  renderRound();
  $('dish').focus();
  if (mode === 'battle') {
    tick();
    timer = setInterval(tick, 250);
  }
}

function describe({ name, action, minutes }) {
  return `${action} ${name.toLowerCase()}${minutes === undefined ? '' : ` · ${minutes} game min`}`;
}

function renderRound() {
  const { mode, recipe, world, moves, finished } = round;
  const creative = mode === 'creative';
  const learner = mode === 'learner';
  const pantry = creative ? pantryFor(world) : recipe.steps.map(({ name }) => name).sort();
  const remaining = pantry.filter((name) => !moves.some((move) => move.name === name));
  const full = !remaining.length;
  const steps = creative ? [] : instructionsFor(mode, recipe, moves.length);
  $('guide-title').textContent = creative || mode === 'hard' ? 'Pantry' : learner ? 'Your next step' : 'Recipe card';
  $('guide-note').textContent = creative ? 'Choose at least two ingredients. Think about which flavors go together.'
    : mode === 'hard' ? 'Use every ingredient once. Choose your own order, methods, and timings.'
    : learner && finished ? 'All steps complete.'
    : learner && full ? 'All steps complete. Serve your dish!'
    : learner ? stepHint(steps[0])
    : mode === 'medium' ? 'Follow the methods on the card and estimate how long each step takes.'
    : '';
  fillList('guide', creative || mode === 'hard' ? pantry : learner ? [] : steps.map(describe));
  fillList('log', moves.map(describe));
  $('empty-log').hidden = Boolean(moves.length);
  $('hint').hidden = mode !== 'easy' || full || finished;
  $('hint-text').textContent = '';
  $('undo').hidden = learner || finished;
  $('undo').disabled = !moves.length;
  $('cook-form').hidden = full || finished;
  $('serve-form').hidden = finished;
  $('serve').disabled = creative ? moves.length < 2 : !full;
  fillSelect(ingredientSelect, remaining.map((name) => [name, name]), 'Choose an ingredient');
  if (learner) ingredientSelect.setAttribute('aria-describedby', 'guide-note');
  else ingredientSelect.removeAttribute('aria-describedby');
  actionSelect.value = '';
  minutesInput.value = '';
}

function elapsedSeconds() {
  return (performance.now() - round.started) / 1000;
}

function tick() {
  const elapsed = elapsedSeconds();
  const { limitSeconds, rivalSeconds } = battleRules;
  const remaining = Math.max(0, Math.ceil(limitSeconds - elapsed));
  $('clock').textContent = `${remaining} seconds left`;
  const warning = remaining <= 10 ? '10 seconds or less left to serve.' :
    remaining <= 30 ? '30 seconds or less left to serve.' : '';
  if ($('time-warning').textContent !== warning) $('time-warning').textContent = warning;
  const total = round.recipe.steps.length;
  const cooked = rivalMovesAt(round.recipe, elapsed).length;
  const progress = elapsed >= rivalSeconds ? 'Chef Pepper has served!' : `Chef Pepper: ${cooked}/${total} steps cooked`;
  if ($('rival').textContent !== progress) $('rival').textContent = progress;
  if (elapsed >= limitSeconds) finish(limitSeconds, true);
}

function finish(elapsed, timedOut = false) {
  if (round.finished) return;
  const { mode, moves, recipe } = round;
  const dishName = $('dish-name').value.trim() || 'Untitled creation';
  round.finished = true;
  clearInterval(timer);
  renderRound();
  if (mode === 'creative') {
    const { yummy, panel } = judgeCreative(moves);
    $('verdict').textContent = `${dishName}: ${yummy ? 'Yummy!' : 'Needs another try.'}`;
    fillList('details', panel.map(({ name, liked, feedback }) => `${name} — ${liked ? 'Yes' : 'Not yet'}: ${feedback}`));
  } else {
    const { score, steps } = judgeRecipe(recipe, moves);
    const notes = steps.map(({ feedback }, index) => `Step ${index + 1}: ${feedback}`);
    if (mode === 'battle') {
      const { rivalSeconds } = battleRules;
      const rivalScore = judgeRecipe(recipe, rivalMovesAt(recipe, rivalSeconds)).score;
      $('verdict').textContent = battleOutcome(score, elapsed, rivalScore);
      notes.unshift(`Judge’s scores: you ${score}/100 in ${elapsed.toFixed(2)}s; Chef Pepper ${rivalScore}/100 in ${rivalSeconds}s.`);
      if (timedOut) notes.unshift('You didn’t serve in time. The judge still scored the steps you completed.');
      $('clock').textContent = 'Battle complete';
      $('time-warning').textContent = '';
      $('rival').textContent = '';
    } else {
      $('verdict').textContent = `Judge’s score: ${score}/100`;
    }
    fillList('details', notes);
  }
  $('result').hidden = false;
  $('retry').hidden = false;
  $('verdict').focus();
}

worldSelect.addEventListener('change', selectWorld);
modeSelect.addEventListener('change', updateSetup);
$('age-confirmation').addEventListener('change', updateSetup);
$('setup-form').addEventListener('submit', (event) => {
  event.preventDefault();
  begin();
});
$('cook-form').addEventListener('submit', (event) => {
  event.preventDefault();
  if (!round || round.finished || !event.currentTarget.reportValidity()) return;
  if (round.mode === 'battle' && elapsedSeconds() >= battleRules.limitSeconds) {
    tick();
    return;
  }
  const move = { name: ingredientSelect.value, action: actionSelect.value, minutes: minutesInput.valueAsNumber };
  if (round.mode === 'learner') {
    const result = checkStep(round.recipe.steps[round.moves.length], move);
    if (result.points !== 3) {
      $('feedback').textContent = `Try again: ${result.feedback}`;
      return;
    }
  }
  round.moves.push(move);
  renderRound();
  $('feedback').textContent = `${describe(move)} added to your dish.`;
  if ($('cook-form').hidden) $('serve').focus();
  else ingredientSelect.focus();
});
$('hint').addEventListener('click', () => {
  $('hint-text').textContent = stepHint(round.recipe.steps[round.moves.length]);
});
$('undo').addEventListener('click', () => {
  if (round.finished || round.mode === 'learner' || !round.moves.length) return;
  const move = round.moves.pop();
  renderRound();
  $('feedback').textContent = `${move.name} returned to the pantry.`;
  ingredientSelect.focus();
});
$('serve-form').addEventListener('submit', (event) => {
  event.preventDefault();
  if (!round || round.finished || $('serve').disabled) return;
  const elapsed = elapsedSeconds();
  if (round.mode === 'battle' && elapsed >= battleRules.limitSeconds) tick();
  else finish(elapsed);
});
$('retry').addEventListener('click', begin);
$('back').addEventListener('click', () => {
  clearInterval(timer);
  round = undefined;
  $('kitchen').hidden = true;
  $('setup').hidden = false;
  $('setup-title').focus();
});

selectWorld();
updateSetup();
