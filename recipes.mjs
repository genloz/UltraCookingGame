export const actions = {
  Chop: 'Cut an ingredient into smaller pieces.',
  Mix: 'Combine ingredients without heating them.',
  Sauté: 'Cook quickly in a pan with a little fat.',
  Simmer: 'Cook gently in liquid with small bubbles.',
  Bake: 'Cook with the surrounding heat of an oven.',
  Toast: 'Brown the outside with dry heat.',
};

const ingredient = (role, flavors, methods) => ({ role, flavors, methods });

export const ingredients = {
  Mango: ingredient('produce', ['sweet', 'bright'], { Chop: 2, Mix: 1 }),
  Pineapple: ingredient('produce', ['sweet', 'bright'], { Chop: 2, Sauté: 4 }),
  Lime: ingredient('accent', ['bright'], { Mix: 1 }),
  'Coconut rice': ingredient('base', ['mellow', 'sweet'], { Simmer: 12 }),
  'Cultivated mushrooms': ingredient('produce', ['earthy', 'savory'], { Sauté: 5 }),
  'Cooked barley': ingredient('base', ['earthy', 'mellow'], { Simmer: 8, Mix: 2 }),
  Thyme: ingredient('accent', ['earthy'], { Mix: 1 }),
  Blueberries: ingredient('produce', ['sweet', 'bright'], { Mix: 1, Simmer: 5 }),
  Oats: ingredient('base', ['mellow'], { Toast: 4, Bake: 12 }),
  'Maple syrup': ingredient('accent', ['sweet', 'mellow'], { Mix: 1 }),
  Marshmallow: ingredient('accent', ['sweet'], { Toast: 2 }),
  Chocolate: ingredient('accent', ['sweet', 'mellow'], { Mix: 1 }),
  'Graham crackers': ingredient('base', ['sweet'], { Mix: 1, Toast: 2 }),
  'Damper dough': ingredient('base', ['mellow'], { Bake: 20 }),
  Butter: ingredient('accent', ['mellow'], { Mix: 1 }),
  Jam: ingredient('produce', ['sweet', 'bright'], { Mix: 1 }),
  Reindeer: ingredient('base', ['earthy', 'savory'], { Simmer: 30, Sauté: 6 }),
  Potato: ingredient('produce', ['earthy', 'mellow'], { Chop: 3, Simmer: 15, Bake: 25 }),
  Broth: ingredient('accent', ['savory'], { Simmer: 5, Mix: 1 }),
  Cod: ingredient('base', ['savory', 'mellow'], { Bake: 12, Simmer: 8 }),
  Lemon: ingredient('accent', ['bright'], { Mix: 1 }),
  Dill: ingredient('accent', ['bright', 'savory'], { Mix: 1 }),
};

const step = (name, action) => ({ name, action, minutes: ingredients[name].methods[action] });

export const worlds = [
  {
    name: 'Paradise', icon: '🌴', description: 'Sunny fruit and tropical flavors.',
    recipes: [
      { name: 'Tropical Fruit Cup', steps: [step('Mango', 'Chop'), step('Pineapple', 'Chop'), step('Lime', 'Mix')] },
      { name: 'Pineapple Coconut Rice', steps: [step('Coconut rice', 'Simmer'), step('Pineapple', 'Sauté'), step('Lime', 'Mix')] },
    ],
  },
  {
    name: 'Forest', icon: '🌲', description: 'Woodland berries, herbs, and earthy mushrooms.',
    recipes: [
      { name: 'Woodland Mushroom Barley', steps: [step('Cultivated mushrooms', 'Sauté'), step('Cooked barley', 'Simmer'), step('Thyme', 'Mix')] },
      { name: 'Blueberry Oat Crunch', steps: [step('Oats', 'Toast'), step('Blueberries', 'Simmer'), step('Maple syrup', 'Mix')] },
    ],
  },
  {
    name: 'Camp', icon: '⛺', description: 'Campfire favorites for a night under the stars.',
    recipes: [
      { name: 'Roasted Marshmallow S’mores', steps: [step('Marshmallow', 'Toast'), step('Chocolate', 'Mix'), step('Graham crackers', 'Mix')] },
      { name: 'Camp Damper', steps: [step('Damper dough', 'Bake'), step('Butter', 'Mix'), step('Jam', 'Mix')] },
    ],
  },
  {
    name: 'Arctic', icon: '❄️', description: 'Warming stew and bright northern fish dishes.',
    recipes: [
      { name: 'Reindeer Stew', steps: [step('Broth', 'Simmer'), step('Reindeer', 'Simmer'), step('Potato', 'Simmer')] },
      { name: 'Lemon Dill Cod', steps: [step('Cod', 'Bake'), step('Lemon', 'Mix'), step('Dill', 'Mix')] },
    ],
  },
];
