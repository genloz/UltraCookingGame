import test from 'node:test';
import assert from 'node:assert/strict';
import { worlds, actions } from './recipes.mjs';
import { battleOutcome, battleRules, canBattle, checkStep, instructionsFor, judgeCreative, judgeRecipe, pantryFor } from './game.mjs';

const recipe = worlds[0].recipes[0];

test('every world provides playable recipes with unique ingredients and valid steps', () => {
  assert.deepEqual(worlds.map(({ name }) => name), ['Paradise', 'Forest', 'Camp', 'Arctic']);
  for (const world of worlds) {
    assert.ok(world.recipes.length >= 2);
    for (const dish of world.recipes) {
      assert.equal(new Set(dish.steps.map(({ name }) => name)).size, dish.steps.length);
      for (const step of dish.steps) {
        assert.ok(pantryFor(world).includes(step.name));
        assert.ok(actions[step.action]);
        assert.ok(Number.isInteger(step.minutes) && step.minutes > 0 && step.minutes <= 60);
      }
      assert.equal(judgeRecipe(dish, dish.steps).score, 100);
    }
  }
});

test('recipe support decreases across the learning difficulties', () => {
  assert.deepEqual(instructionsFor('learner', recipe, 1), [recipe.steps[1]]);
  assert.deepEqual(instructionsFor('easy', recipe), recipe.steps);
  assert.deepEqual(instructionsFor('medium', recipe), recipe.steps.map(({ name, action }) => ({ name, action })));
  assert.deepEqual(instructionsFor('hard', recipe), []);
});

test('recipe judging recognizes order, method, timing, and missing steps', () => {
  const [first, second] = recipe.steps;
  assert.equal(checkStep(first, second).points, 0);
  assert.equal(checkStep(first, { ...first, action: 'Bake' }).points, 1);
  assert.equal(checkStep(first, { ...first, minutes: first.minutes + 1 }).points, 2);
  assert.equal(judgeRecipe(recipe, []).score, 0);
  assert.ok(judgeRecipe(recipe, [...recipe.steps].reverse()).score < 100);
});

test('creative judging explains a successful dish and gives feedback on a poor one', () => {
  const liked = judgeCreative(recipe.steps);
  assert.equal(liked.yummy, true);
  assert.equal(liked.panel.length, 3);
  assert.ok(liked.panel.every(({ liked, feedback }) => liked && feedback));
  const disliked = judgeCreative([recipe.steps[0], recipe.steps[1]].map((step) => ({ ...step, action: 'Bake' })));
  assert.equal(disliked.yummy, false);
  assert.ok(disliked.panel.some(({ feedback }) => feedback.includes('not a good fit')));
});

test('battle is opt-in for older players and only breaks quality ties with time', () => {
  for (const age of [undefined, 12, 12.9, '13']) assert.equal(canBattle(age), false);
  assert.equal(canBattle(13), true);
  const { rivalScore, rivalSeconds, limitSeconds } = battleRules;
  assert.equal(battleOutcome(rivalScore + 1, limitSeconds), 'You win!');
  assert.equal(battleOutcome(rivalScore - 1, 1), 'Chef Pepper wins!');
  assert.equal(battleOutcome(rivalScore, rivalSeconds - 1), 'You win on speed!');
  assert.equal(battleOutcome(rivalScore, rivalSeconds), 'It’s a tie!');
  assert.equal(battleOutcome(rivalScore, rivalSeconds + 1), 'Chef Pepper wins on speed!');
});
