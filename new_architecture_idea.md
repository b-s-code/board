# WHY DO THINGS THIS WAY?

Current approach has a poorly thought out paradigm of when and how state/view should be updated.
Makes it less than joyous to work with.

## DATA MODEL

```pseudocode
struct DataModel
{
    /* CARDS */
    // Do not have a reference to the list they belong to.
    // Instead can loop over listsCards to find owning list of card of interest.
    uint[]          cardsIds            // Used when anything needs a reference to a card.
    string[]        cardsTitles  
    string[]        cardsNotes
    (string[])[]    cardsLabels  

    /* LISTS */
    uint[]          listsIds            // Used when anything needs a reference to a list.  Allows duplicate list titles.
    string[]        listTitles
    (uint[])[]      listsCards          // Tracks the card-list relation.  Order of cardIds within an arr elt specifies top-to-bottom order in GUI.

    /* GUI */
    string          guiViewMode         // "welcome", "aggregate", "focused card", or "download data".  "welcome" view should have load/new buttons.
    uint[]          listsPositions      // From LHS.  Parallel to listIds.
}
```

## WHAT SHOULD THE CODE LOOK LIKE?

A global state object for the data model.

Rendering functions for each guiViewMode.

A bunch of pure functions where you pass in global state and return a new global state.
(It's not that much data.)

The rendering functions should set up EventListeners for GUI controls.
Clicking on stuff, changing the text in a text field etc will trigger events.
The event handlers will:
- call one of the pure functions
    - passing in copy of current global state
    - passing in new value to be assigned to something in the data model
    - new global state will be set using return value
- call an appropriate rendering function

