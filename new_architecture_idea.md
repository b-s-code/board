# WHY DO THINGS THIS WAY?

Current approach has a poorly thought out paradigm of when and how state/view should be updated.
Makes it less than joyous to work with.

## DATA MODEL

```pseudocode
struct BoardStateModel
{
    /* CARDS */
    // Do not have a reference to the list they belong to.
    // Instead can loop over listsCards to find owning list of card of interest.
    // Index into these parallel arrays is used when anything needs a reference to a card.
    string[]        cardsTitles  
    string[]        cardsNotes
    (string[])[]    cardsLabels  

    /* LISTS */
    uint[]          listsIds            // Used when anything needs a reference to a list.  Allows duplicate list titles.
    string[]        listTitles
    (uint[])[]      listsCards          // Tracks the card-list relation.  Order of cardIds within an arr elt specifies top-to-bottom order in GUI.
    uint[]          listsPositions      // From LHS.  Parallel to listIds.
}
```

```typescript
interface BoardState
{
    cardsTitles : string[],
    cardsNotes : string[],
    cardsLables : string[][],
    listsIds : number[],
    listsTitles : string[],
    listsCards : number[][],
    listsPositions : number[]
}
```

```pseudocode
struct AppStateModel
{
    /* GUI */
    string          guiViewMode         // "welcome", "aggregate", "focused", or "download data".  "welcome" view should have load/new buttons.
    uint            focusedCardId
}
```


## WHAT SHOULD THE CODE LOOK LIKE?

### Data

Two global state objects:

1. Application state.  Created at start of session, discarded at the end.
2. Board state.  Loaded/saved as file, read/written to at runtime.

### Functions

Basic flow is:

1. App gets initialized.
2. The following occur in a loop:

    - User perfoms an action.
    - Action triggers an event.
    - Event handler calls a pure function, passing board state and required data to make user's requested change.
    - Event handler assigns the return value of the pure function to the global board state.
    - Board state, but not necessarily GUI now represents what user wants.
    - Event handler makes any necessary changes to application state, raises an outdated GUI event then returns.
    - Outdated GUI event handler calls appropriate render function.
    - Render function deletes a bunch of stuff from the DOM, reads from app state and board state, draws everything and sets up event handlers to respond to user's next action.

So what code to write?

We'll have a rendering function for each guiViewMode.
Each should be void, take no params, only read from (never write to) application and board states, and should affect the DOM.
Each is responsible for creating event handlers for all and only possible user actions that may be taken for that rendered view.
Any modification of board and application state should be left to event handlers, and they'll accomplish the board state modification by calling pure functions and assigning the return value to global board state.  They can modify application state themselves though.

Also need functions for:

- loading board state from file
- exporting board state to file and initiating download
- constructing a default board state

Other thoughts...

The initialization function will have to:

- call either the board state constructing function or the board state loading function, depending on user choice
