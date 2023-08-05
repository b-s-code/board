export interface BoardState
{
    cardsIds : number[],
    cardsTitles : string[],
    cardsNotes : string[],
    cardsLabels : string[][],
    listsIds : number[],
    listsTitles : string[],
    listsCards : number[][],
    listsPositions : number[]
};

/*
* Don't need to have a class and constructor because this can be used
* for default construction.
*/
const EmptyBoard: BoardState =
{
    cardsIds : [],
    cardsTitles : [],
    cardsNotes : [],
    cardsLabels : [],
    listsIds : [],
    listsTitles : [],
    listsCards : [],
    listsPositions : []
};

/*
* The non-empty template board that will be used when user
* creates a new board.
*/
const BlankCanvasBoard: BoardState =
{
    cardsIds : [0],
    cardsTitles : ["..."],
    cardsNotes : ["..."],
    cardsLabels :
    [
        [
            "..."
        ]
    ],
    listsIds : [0, 1],
    listsTitles : ["...", "..."],
    listsCards :
    [
        [0],
        []
    ],
    listsPositions : [0, 1]
};

/*
* For tests.
*/
export const SampleBoardState: BoardState =
{
    cardsIds : [0, 1, 2, 3, 4, 5, 6, 7, 8],
    cardsTitles : ["apple", "orange", "banana", "pear", "peach", "apple", "dog", "cat", "bird"],
    cardsNotes : ["apple tasty", "orange tasty", "banana tasty", "pear ugh", "peach hairy", "apple gross", "dog fun", "cat ugly", "bird elegant"],
    cardsLabels :
    [
        [
            "red",
            "crunchy"
        ],
        [
            "orange",
            "citrus"
        ],
        [
            "yellow",
            "brown",
            "green"
        ],
        [
            "green",
            "crunchy"
        ],
        [
            "soft",
            "warm coloured"
        ],
        [
            "green",
            "crunchy"
        ],
        [
            "barking animal",
            "likable"
        ],
        [
            "non-barking",
            "unable to fly"
        ],
        [
            "capable of flight",
            "non-barking"
        ]
    ],
    listsIds : [0, 1, 2, 3],
    listsTitles : ["Left", "L Mid", "R Mid", "Right"],
    listsCards :
    [
        [0, 1],
        [2],
        [3, 4],
        [5, 6, 7]
    ],
    listsPositions : [0, 1, 2, 3]
};

/*
* Holds state of the user's board.
* Can be imported and exported as file.
* Can be auto-populated as a blank canvas for  new board.
*/
var boardState: BoardState = EmptyBoard;

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
    // Set app state.
    // Raise outdated GUI event.
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
        boardState = BlankCanvasBoard;
        appState.guiViewMode = "aggregate";
        document.dispatchEvent(OutdatedGUI);
    });

    // Wraps div representing load button and an
    // invisble file input control together.
    var loadBtnWrapper = document.createElement("div");
    
    var loadBtn = document.createElement("div");
    var fileInput = document.createElement("input");

    loadBtn.append("Load Board");
    fileInput.type = "file"
    fileInput.style.display = "block";
    fileInput.style.position = "absolute";
    fileInput.style.top = "0";
    fileInput.style.right = "0";
    fileInput.style.opacity = "0";
    // Dirty hack to solve previous issue where clickable area
    // was smaller than desired.
    // See https://stackoverflow.com/questions/21842274/cross-browser-custom-styling-for-file-upload-button/21842275#21842275
    fileInput.style.fontSize = "100px";
    fileInput.style.filter = "alpha(opacity=0)";
    fileInput.style.cursor = "pointer";
    loadBtnWrapper.style.position = "relative";
    loadBtnWrapper.style.overflow = "hidden";
    loadBtnWrapper.style.float = "left";
    loadBtnWrapper.style.clear = "left";
    loadBtnWrapper.append(loadBtn, fileInput);

    fileInput.addEventListener("change", (e) =>
    {
        if  (!(fileInput.files))
        {
            return;
        }

        const file = fileInput.files[0]
        if (!file)
        {
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) =>
        {
            // e.target points to the reader
            if  (e.target)
            {
                const fileContents: any = e.target.result;
                boardState = JSON.parse(fileContents);
            }
        }
        reader.onerror = (e) =>
        {
            if (e.target)
            {
                const error = e.target.error;
                console.error(`Error occured while reading ${file.name}`, error);
            }
        }

        reader.readAsText(file);
        appState.guiViewMode = "aggregate";
        document.dispatchEvent(OutdatedGUI);
    });
    
    document.getElementsByTagName("body")[0].append(newBtn, loadBtnWrapper);
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
* Implementation relies on <script>s preceding all other children of <body>.
*/
function StripBody()
{
    // Count up scripts in the DOM so they don't get removed.
    // Better than maintaining a magic number in code each time the
    // number of <script> tags in the HTML changes.
    let numScripts = document.getElementsByTagName("script").length;
    
    while (document.getElementsByTagName("body")[0].children.length > numScripts)
    {
        document.getElementsByTagName("body")[0].children[numScripts].remove();
    } 
}

/*
* Called when user clicks button to download their board data.
* Serializes boardData to a JSON text file and initiates download.
*/
function ExportBoard(board: BoardState)
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
export function MoveCard(board: BoardState, cardId: number, dir: string): BoardState
{
    // TODO : Write tests for and implement this function.
    return board;
}

/*
* Pure function.
* Returns a new board, with list moved one unit in direction dir.
* Return input board if dir is not possible direction movement,
* given list's current position.
* dir can be "left" or "right".
*/
function MoveList(board: BoardState, listId: number, dir: string)
{
    //
}

/*
* Pure function.
* Returns a new board, with one new card at the end of the list with given listId.
* Chooses default values for the card's properties.
*/
function AddCard(board: BoardState, listId: number)
{
    //
}

/*
* Pure function.
* Returns a new board, with one new list in rightmost position.
* Chooses default values for the card's properties.
*/
function AddList(board: BoardState)
{
    //
}

/*
* Pure function.
* Returns a new board, with the card with given cardId removed.
*/
function DeleteCard(board: BoardState, cardId: number)
{
    //
}

/*
* Pure function.
* Returns a new board, with the list with given listId removed.
*/
function DeleteList(board: BoardState, listId: number)
{
    //
}

/*
* Pure function.
* Returns a new board, where the card with supplied cardId is assigned
* the new title newTitle.
*/
function RenameCard(board: BoardState, cardId: number, newTitle: string)
{
    //
}

/*
* Pure function.
* Returns a new board, where the list with supplied listId is assigned
* the new title newTitle.
*/
function RenameList(board: BoardState, listId: number, newTitle: string)
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
function ChangeCardLabels(board: BoardState, cardId: number, newLabels: string[])
{
    //
}

/*
* Pure function.
* Returns a new board, where the card with supplied cardId is assigned
* the new notes string newNote.
*/
function ChangeCardNotes(board: BoardState, cardId: number, newNotes: string)
{
    //
}

// Render needs to be prepared to respond to this event before
// InitializeApp raises it.
document.addEventListener("OutdatedGUI", Render);
InitializeApp();
