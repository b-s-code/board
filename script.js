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
var appState = {guiViewMode: "", focusedCardId: 0};

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

    appState.guiViewMode = "welcome";
    document.dispatchEvent(OutdatedGUI);
}

/*
* Handles the OutdatedGUI event.
* Responds by cleaning part of the DOM then calling the appropriate
* rendering function(s), in the appropriate order based on app state.
* Caller should set guiViewMode beforehand.
*/
function Render()
{
    // Ensure that we're rendering on a blank slate.
    // (Except for <script>.)
    StripBody();
    
    const mode = appState.guiViewMode;
    switch(mode)
    {
        case "welcome":
            RenderWelcome();
            break;
        case "aggregate":
            RenderAggregate();
            break;
        case "focused":
            // The aggregate view needs to be rendered first,
            // to ensure the GUI background is up to date.
            // This is only relevant because the aggregate view
            // is partially visible from the focused view.
            RenderAggregate();
            RenderFocus();
            break;
        case "download":
            RenderDownload();
            break;
        default:
            throw "Invalid view mode in app state.";
    }
}

/*
* Renders the welcome screen, where user can create new board or load file.
*/
function RenderWelcome()
{
    // TODO : add style

    var newBtn = document.createElement("div");
    newBtn.append("New board");
    newBtn.addEventListener("click", (e) =>
    {
        boardState = CreateBoard();
        appState.guiViewMode = "aggregate";
        document.dispatchEvent(OutdatedGUI);
    });

    var loadBtn = document.createElement("div");
    loadBtn.append("Load board");
    loadBtn.addEventListener("click", (e) =>
    {
        boardState = LoadBoard();
        appState.guiViewMode = "aggregate";
        document.dispatchEvent(OutdatedGUI);
    });
    
    document.getElementsByTagName("body")[0].append(newBtn, loadBtn);
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
* Opens a file selector.  Returns a board state.
* Called when user clicks button to load existing board data from file.
*/
function LoadBoard()
{
    // TODO : implement
}

/*
* Returns a relatively empty board data object which can be assigned to boardData.
* Called when user clicks button to create a new board.
*/
function CreateBoard()
{
    // TODO : implement
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

// Render needs to be prepared to respond to this event before
// InitializeApp raises it.
document.addEventListener("OutdatedGUI", Render);
InitializeApp();
