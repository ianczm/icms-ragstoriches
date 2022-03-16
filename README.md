# ICMS Journey of Life Webgame

Rags to Riches is an event organised by the International Council of Malaysian Scholars in collaboration with Maybank. The event is about raising financial literacy among the Malaysian Youth through learning about financial planning.

## Game Details

Participants will participate in a "credit score simulation" game, where they will be given a prompt and options to select from. Their goal is to make the financially-wise choice in order to grow their capital and improve their credit score.

- Early questions would start off simple with obvious answers.
- Later questions would target the grey areas of financial planning where the answer is not always obvious in the short term, but has long term impacts.
- A credit score is maintained throughout the game that changes according to their borrowing/lending activities.
- Players start with **initial capital** that will change according to their buying/selling activities.

-------------------------------------------------------------------------------

## Requirements

The website serves as the interface where participants get to interact with various elements of the game.

---

## Absolutely Urgent

- ~~prevent character resetting when loading the game pane (implemented)~~
- ~~add character id as a property to Character (implemented)~~

- realign calculations so that we don't get stress to 100% after first two scenarios lmao

## Must Have

### Game

- ~~update user choice selection with firebase in real time (implemented)~~
- ~~update character statistics in real time with firebase (implemented)~~
- [WIP] enable page-by-page navigation for each scenario in vue
    - update character's currentpage property
    - submit answer button
    - need to figure out how to perform calculations if participants backtrack (we can enforce only one way navigation to avoid this)
- [WIP] add accounting balance sheet below main scenario screen to show assets and liabilities
- [TODO] migrate scenarios from content document and implement calculation

- add paragraphs to scenario (allow admin to add scenarios)
- store previous answer / accountitems in character to execute complex scenarios (e.g. if they chose to buy a bungalow, then in this question their tax will be higher)
- game needs to figure out if character is on the outcome screen or not to sync with teammates
- networth very negative at the start
- improve laptop friendliness (font weight)
- progress bar for how many questions left

---

## Should Have

### Admin Panel

_Modify: being able to create, edit, remove, reset_

- enable easy database management
    - view and modify users (needs firebase admin sdk)
        - display name
        - password
        - view uid and email (since these are read-only)
    - view and modify individual characters
    - view and modify scenarios (for easy scenario creation)
- reset switch for any database tables
    - ~~reset all users to default state~~
    - return a list of randomly generated passwords for each user
    - ~~characters (implemented)~~

---

## Nice to Have

### Home

- add countdown timer to event

### Game

- add countdown timer on the game screen

### Optimisations
- improve mobile friendliness

---