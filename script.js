/*
* Holds state of the user's board.
* Can be imported and exported as file.
* Can be auto-populated as a blank canvas for  new board.
*/
var boardState = {};

/*
* Will not be imported or exported.
* Intended guiViewMode space is "welcome", "aggregate", "focused", "download".
*/
var appState = {guiViewMode: "welcome", focusedCardId: 0};

/* TODO : consider implementing RenderWelcome, InitializeApp next */

/*
* The only custom event.
* Raisers of this event should make any necessary changes to:
*   - board state
*   - app sate
* then return.  I.e. no code needing to be executed appear
* in any block where this is called, following the event raise.
*/
const OutdatedGUI = new Event("OutdatedGUI");

/*
* Call once to start the application. 
*/
function InitializeApp()
{
    // Set app state.  Raise outdated GUI event.
    // Then render function will take over.
    // No need to set board state here.
}

/*
* Handles the OutdatedGUI event.
* Responds by calling the appropriate rendering function based on app state.
* Caller should set guiViewMode, then call this, which will call other
* rendering functions as needed.
* Why not call them directly?  This function takes responsibility for 
* ensuring they're called in correct order.
*/
function Render()
{
    // Call StripBody.

    // if guiViewMode is "focused card", the aggregate view needs
    // to be rendered first to ensure background is up to date
}

/*
* Renders the welcome screen, where user can create new board or load file.
*/
function RenderWelcome()
{
    // Call StripBody.  Arguably redundant, but if an option to restart the app is added, this call is required.

    // Make button to construct new default board.

    // Event handler for user choosing to proceed with new board.

    // Make button to load board state from user's local file.
    
    // Event handler for user choosing to proceed with loaded board.
}

/*
* Renders the aggregate view.
* Shows lists, cards
* Provides controls for saving boardData to file,
* adding/deleting/repositioning cards/lists,
* renaming lists,
* bringing one card into focus,
* preparing board state for download.
*/
function RenderAggregate()
{
    // Call StripBody.

    //
}

/*
* Renders a view of one focused card.
* Shows title, labels, notes.
* Provides controls for renaming card,
* changing notes, adding/deleting labels
*/
function RenderFocus()
{
    //
}

/*
* Renders a view which contains a user control for downloading board state,
* exported as a file.
*/
function RenderDownload()
{
    //
}

/*
* Removes all child elements of the <body> element, except for <script>.
* Implementation relies on <script> being 0th child of <body>.
*/
function StripBody()
{
    while (document.getElementsByTagName("body")[0].children.length > 1)
    {
        document.getElementsByTagName("body")[0].children[1].remove();
    } 
}

/*
* Called when user clicks button to download their board data.
* Serializes boardData to a JSON text file and initiates download.
*/
function ExportBoard(boardData)
{
    //
}

/*
* Called when user clicks button to load existing board data from file.
*/
function LoadBoard()
{
    //
}

/*
* Returns a relatively empty board data object which can be assigned to boardData.
* Called when user clicks button to create a new board.
*/
function CreateBoard()
{
    //
}

/*
* Pure function.
* Returns a new board, with card moved one unit in direction dir.
* Return input board if dir is not possible direction movement,
* given card's current position.
* dir can be "up", "down", "left", or "right".
*/
function MoveCard(board, cardId, dir)
{
    //
}

/*
* Pure function.
* Returns a new board, with list moved one unit in direction dir.
* Return input board if dir is not possible direction movement,
* given list's current position.
* dir can be "left" or "right".
*/
function MoveList(board, listId, dir)
{
    //
}

/*
* Pure function.
* Returns a new board, with one new card at the end of the list with given listId.
* Chooses default values for the card's properties.
*/
function AddCard(board, listId)
{
    //
}

/*
* Pure function.
* Returns a new board, with one new list in rightmost position.
* Chooses default values for the card's properties.
*/
function AddList(board)
{
    //
}

/*
* Pure function.
* Returns a new board, with the card with given cardId removed.
*/
function DeleteCard(board, cardId)
{
    //
}

/*
* Pure function.
* Returns a new board, with the list with given listId removed.
*/
function DeleteList(board, listId)
{
    //
}

/*
* Pure function.
* Returns a new board, where the card with supplied cardId is assigned
* the new title newTitle.
*/
function RenameCard(board, cardId, newTitle)
{
    //
}

/*
* Pure function.
* Returns a new board, where the list with supplied listId is assigned
* the new title newTitle.
*/
function RenameList(board, listId, newTitle)
{
    //
}

/*
* Pure function.
* Returns a new board, where the card with supplied cardId is assigned
* the new string array of labels newLabels.
* Can be used for adding/deleting/renaming a label.
* Chooses a default name for new labels.
*/
function ChangeCardLabels(board, cardId, newLabels)
{
    //
}

/*
* Pure function.
* Returns a new board, where the card with supplied cardId is assigned
* the new notes string newNote.
*/
function ChangeCardNotes(board, cardId, newNotes)
{
    //
}

/*
*
*/
function f()
{
    //
}

InitializeApp();
document.addEventListener("OutdatedGUI", Render);
