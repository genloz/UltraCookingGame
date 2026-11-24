# UltraCookingGame

A browser cooking game set in four themed worlds: **Paradise** (tropical fruit and coconut rice), **Forest** (woodland mushrooms and blueberries), **Camp** (s’mores and damper), and **Arctic** (reindeer stew and lemon dill cod).

## Play locally

From the repository root, run `npm start` (requires Python 3), then visit <http://localhost:8000>. No installation or build step is needed. You can also serve the files with any static web server.

Choose a world, mode, and recipe. At the cooking station, select an ingredient, choose a method, and set the number of game minutes. Serve your finished dish to see what worked and what to try next.

| Mode | How it plays |
| --- | --- |
| Learner | Follow one step at a time and retry until the method and timing match. |
| Easy | Read the full recipe and ask for a hint about the next step. |
| Medium | See the ordered ingredients and methods, but figure out the timings yourself. |
| Hard | See only the ingredients. Work out the order, methods, and timings. |
| Creative | Name a recipe you invent from the world’s pantry. Three judges vote on ingredient variety, technique, and how the flavors fit together. |
| Battle | Race Chef Pepper and serve before the 90-second deadline. The judge picks the best dish; speed breaks a score tie. Available after a local 13+ confirmation, not verified age or parental controls. No age or other personal data is collected. |

Battle uses a computer opponent, not online multiplayer. Rounds and creative dishes are not saved. All timings and scores are game rules, not real-world food safety guidance.

## Tests

Run `npm test` with Node.js 20 or newer to test the recipe catalog, mode instructions, judging, and battle rules.