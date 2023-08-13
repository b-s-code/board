const cloneDeep = require('lodash.clonedeep');

export interface BoardState
{
    // Elts are indices of respective cards details
    // into the card arrays below.
    cardsIds : number[],

        cardsTitles : string[],
        cardsNotes  : string[],
        cardsLabels : string[][],
    
    // Elts are indices of respective lists details
    // into the list arrays below.
    listsIds : number[],
    
        listsTitles    : string[],

        // One array of card ids (which are indices
        // into other card arrays, and need to be
        // created/deleted/updated here as cards are
        // added/removed/moved between lists) per list.
        listsCards     : number[][],
        
        listsPositions : number[]
};

/*
* Used by regular code and test code.
*/
export const fillerStr = "...";

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
    cardsTitles : [fillerStr],
    cardsNotes : [fillerStr],
    cardsLabels :
    [
        [
            fillerStr
        ]
    ],
    listsIds : [0, 1],
    listsTitles : [fillerStr, fillerStr],
    listsCards :
    [
        [0],
        []
    ],
    listsPositions : [0, 1]
};

/*
* For tests.
* The object is wrapped in a function as a simple
* way of preventing mutation.
*/
export function SampleBoardState(): BoardState
{
    const state: BoardState =
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
    return state;
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
* Does not assume list/card ids and positions
* are gapless sequences.
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
    const boardCopy: BoardState = cloneDeep(board);

    // Need some details about the list that the card comes from.
    const sourceListId: number = boardCopy.listsIds.filter((listId) => boardCopy.listsCards[listId].includes(cardId))[0];
    const sourceListCards: number[] = boardCopy.listsCards[sourceListId];
    const sourceListPosOnBoard: number = boardCopy.listsPositions[sourceListId];
    
    // Need to know where the card is in its original list.
    const cardPosInSourceList: number = boardCopy.listsCards[sourceListId].indexOf(cardId);
    
    // First check move is possible.
    // If not, just return the supplied board.
    var isPoss: boolean = true;
    switch (dir)
    {
        case "up":
            if (cardPosInSourceList === 0)
            {
                // Then card is already at top of its list.
                isPoss = false;
            }
            break;
        case "down":
            const bottom: number = boardCopy.listsCards[sourceListId].length - 1;
            if (cardPosInSourceList === bottom)
            {
                // Then card is already at bottom of its list.
                isPoss = false;
            }
            break;
        case "left":
            const leftmostListPosition: number = Math.min(...boardCopy.listsPositions);
            if (sourceListPosOnBoard === leftmostListPosition)
            {
                // Then card is already in leftmost list.
                isPoss = false;
            }
            break;
        case "right":
            const rightmostListPosition: number = Math.max(...boardCopy.listsPositions);
            if (sourceListPosOnBoard === rightmostListPosition)
            {
                // Then card is already in rightmost list.
                isPoss = false;
            }
            break;
    }
    if (!isPoss)
    {
        return board;
    }

    // Assume now that move is indeed possible.
    const resultBoard: BoardState = cloneDeep(boardCopy);
    switch (dir)
    {
        // Source list === destination list when moving vertically.

        case "up":
            { // Scopes used so sourcePos, destPos can be redefined.
                const sourcePos: number = cardPosInSourceList;
                const destPos: number = cardPosInSourceList - 1;

                // Swap card with supplied id with the card above it.
                const tempCardId: number = resultBoard.listsCards[sourceListId][destPos];
                resultBoard.listsCards[sourceListId][destPos] = cardId;
                resultBoard.listsCards[sourceListId][sourcePos] = tempCardId;
            }
            break;

        case "down":
            {
                const sourcePos: number = cardPosInSourceList;
                const destPos: number = cardPosInSourceList + 1;

                // Swap card with supplied id with the card above it.
                const tempCardId: number = resultBoard.listsCards[sourceListId][destPos];
                resultBoard.listsCards[sourceListId][destPos] = cardId;
                resultBoard.listsCards[sourceListId][sourcePos] = tempCardId;
            }
            break;
        
        // Source list !== destination list when moving horizontally.
    
         case "left":
            {
                // Need to determine id of destination list.
                const destListPos: number = sourceListPosOnBoard - 1;
                const destListId: number = boardCopy.listsIds.filter((listId) => boardCopy.listsPositions[listId] === destListPos)[0];
                
                // Remove supplied card id from source list.
                resultBoard.listsCards[sourceListId].splice(cardPosInSourceList, 1);

                // Insert supplied card id into destination list.
                const destPos: number = Math.min(boardCopy.listsCards[destListId].length, cardPosInSourceList);
                resultBoard.listsCards[destListId].splice(destPos, 0, cardId);
            }
            break;
        case "right":
            {
                // Need to determine id of destination list.
                const destListPos = sourceListPosOnBoard + 1;
                const destListId: number = boardCopy.listsIds.filter((listId) => boardCopy.listsPositions[listId] === destListPos)[0];
                
                // Remove supplied card id from source list.
                resultBoard.listsCards[sourceListId].splice(cardPosInSourceList, 1);

                // Insert supplied card id into destination list.
                const destPos: number = Math.min(boardCopy.listsCards[destListId].length, cardPosInSourceList);
                resultBoard.listsCards[destListId].splice(destPos, 0, cardId);
            }
            break;
    }

    return resultBoard;
}

/*
* Pure function.
* Returns a new board, with list moved one unit in direction dir.
* Return input board if dir is not possible direction movement,
* given list's current position.
* dir can be "left" or "right".
*/
export function MoveList(board: BoardState, listId: number, dir: string): BoardState
{
    const resultBoard: BoardState = cloneDeep(board);
    const origPos: number = board.listsPositions[listId];

    // Don't modify board state if rightmost list is being moved right.
    const rightmost: number = Math.max(...board.listsPositions);
    if (dir === "right" && origPos === rightmost)
    {
        return resultBoard;
    }
    
    // Don't modify board state if leftmost list is being moved left.
    const leftmost: number = Math.min(...board.listsPositions);
    if (dir === "left" && origPos === leftmost)
    {
        return resultBoard;
    }

    // Can assume now that a valid movement has been specified.
    switch (dir)
    {
        case "left":
            {
                // Prepare for swap.
                const otherSwappeeOrigPos: number = origPos - 1;  
                const otherSwappeeId: number = board.listsIds.filter((id) => board.listsPositions[id] === otherSwappeeOrigPos)[0];
                
                // Execute swap.
                resultBoard.listsPositions[listId] = otherSwappeeOrigPos;
                resultBoard.listsPositions[otherSwappeeId] = origPos;
            }
            break;
        case "right":
            {
                // Prepare for swap.
                const otherSwappeeOrigPos: number = origPos + 1;  
                const otherSwappeeId: number = board.listsIds.filter((id) => board.listsPositions[id] === otherSwappeeOrigPos)[0];
                
                // Execute swap.
                resultBoard.listsPositions[listId] = otherSwappeeOrigPos;
                resultBoard.listsPositions[otherSwappeeId] = origPos;
            }
            break;
    }
    return resultBoard;
}

/*
* Pure function.
* Returns a new board, with one new card at the end of the list with given listId.
* Sets filler values for the card's properties.
* Expects no gaps in card ids in input board.
*/
export function AddCard(board: BoardState, listId: number): BoardState
{
    // TODO : update implementation of this function:
    //        original contract of this function was that
    //        card ids may have gaps
    //        new contract is no gaps
    //        may simplify implementation


    // If there are any unused card ids which lie between the min
    // id and the max id, then we reuse that id when adding new card.

    const resultBoard: BoardState = cloneDeep(board);
    const origCardIds: number[] = cloneDeep(board.cardsIds);
    const smallest: number = Math.min(...origCardIds);
    const largest: number = Math.max(...origCardIds);
    
    var idForNewCard: number = largest + 1;
    const canReuseSomeId: boolean = largest - smallest > origCardIds.length - 1;
    if (canReuseSomeId)
    { // Then we shall find the smallest such id.
        for (let i: number = smallest + 1; i < largest; i++)
        {
            if (!(origCardIds.includes(i)))
            {
                idForNewCard = i;
                break;
            }
        }
    }
    resultBoard.cardsIds.push(idForNewCard);
    resultBoard.cardsIds.sort();

    const indexForNewCard: number = resultBoard.cardsIds.indexOf(idForNewCard);
   
    resultBoard.cardsTitles.splice(indexForNewCard, 0, fillerStr);
    resultBoard.cardsNotes.splice(indexForNewCard, 0, fillerStr);
    resultBoard.cardsLabels.splice(indexForNewCard, 0, [fillerStr]);
    resultBoard.listsCards[listId].push(idForNewCard);

    return resultBoard;
}

/*
* Pure function.
* Returns a new board, with one new list in rightmost position.
* New board contains one filler card, with filler values for its properties.
* Expects no gaps in list ids in input board.
*/
export function AddList(board: BoardState): BoardState
{
    // TODO : implement this function.
    
    // TODO : remove dummy return value.
    return EmptyBoard;
}

/*
* Pure function.
* Returns a new board, with the card with given cardId removed.
* Leaves no gaps in card ids in output board.
*/
export function DeleteCard(board: BoardState, cardId: number): BoardState
{
    // TODO : update implementation to satisfy new contract.
    // I.e. must leave no gaps in card id array, and have its
    // entries accurately represent indexes of each respective
    // card into the other card arrays.

    // Find index of deletee (it's the same across many arrays).
    const resultBoard: BoardState = cloneDeep(board);
    const indexOfDeletee: number = resultBoard.cardsIds.indexOf(cardId);

    if (indexOfDeletee === -1)
    { // Then no card with supplied id exists.
        return resultBoard;
    }

    // Exploit knowledge of deletee's index.
    resultBoard.cardsIds.splice(indexOfDeletee, 1); 
    resultBoard.cardsTitles.splice(indexOfDeletee, 1); 
    resultBoard.cardsNotes.splice(indexOfDeletee, 1); 
    resultBoard.cardsLabels.splice(indexOfDeletee, 1); 

    // Other cleanup (from list).  Brute force removal...
    // we don't try to find out which list the card is in.
    resultBoard.listsCards.forEach((elt, i) =>
    {
        resultBoard.listsCards[i] = elt.filter((id) => id !== cardId);
    });

    return resultBoard;
}

/*
* Pure function.
* Returns a new board, with the list with given listId removed.
* Leaves no gaps in list ids in output board.
*/
export function DeleteList(board: BoardState, listId: number): BoardState
{
    var resultBoard: BoardState = cloneDeep(board);

    // Find all cards belonging to the list.
    // Delete each.
    const idsOfCardsToDelete: number[] = [...resultBoard.listsCards[listId]];
    idsOfCardsToDelete.forEach((id) =>
    {
        resultBoard = DeleteCard(resultBoard, id);
    });

    // Now we're ready to get rid of the list itself.
    resultBoard.listsIds.splice(listId, 1);
    resultBoard.listsTitles.splice(listId, 1);
    resultBoard.listsCards.splice(listId, 1);


    // TODO : update implementation to satisfy new contract.
    // I.e. must leave no gaps in list id array, and have its
    // entries accurately represent indexes of each respective
    // list into the other list arrays.


    // We leave listsPositions in a state where
    // it's elements may not be a consecutive
    // increasing sequence.  I.e. there may be gaps.
    // The responsibility of gap filling is left
    // with the list addition function.
    resultBoard.listsPositions.splice(listId, 1);

    return resultBoard;
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
