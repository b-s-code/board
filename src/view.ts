import BoardState from "./model";
import
{ 
    RenameCard, 
    ChangeCardNotes, 
    ChangeCardLabels, 
    fillerStr, 
    MoveCard, 
    DeleteCard, 
    AddCard, 
    DeleteList,
    MoveList,
    AddList
} from "./controller";


/*
* The non-empty template board that will be used when user
* creates a new board.
* The object is wrapped in a function as a simple
* way of preventing mutation.
*/
function FillerBoardState(): BoardState
{
    const state: BoardState =
    {
    cardsTitles    : [fillerStr],
    cardsNotes     : [fillerStr],
    cardsLabels    : [[fillerStr]],
    listsTitles    : [fillerStr, fillerStr],
    listsCards     : [[0], []],
    listsPositions : [0, 1]
    };
    return state;
};

/*
* Holds state of the user's board.
* Can be imported and exported as file.
*/
var boardState: BoardState = FillerBoardState();

/*
* Will not be imported or exported.
* Intended guiViewMode space is "welcome", "aggregate", "focused".
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
            RenderFocus();
            break;
        default:
            throw "Invalid view mode in app state.";
    }
}

/*
* Renders the welcome screen, where user can create new board or load file.
* Assumes it has not been called since the browser was last refreshed.
*/
function RenderWelcome()
{
    // Button for creating new board.
    var newBtn = document.createElement("div");
    newBtn.style.cursor = "pointer";
    newBtn.append("New board");
    newBtn.addEventListener("click", (e) =>
    {
        appState.guiViewMode = "aggregate";
        document.dispatchEvent(OutdatedGUI);
    });

    // Wraps div representing load button and an
    // invisble file input control together.
    var loadBtnWrapper = document.createElement("div");
    loadBtnWrapper.style.cursor = "pointer";
    
    // Button for opening existing board.
    var loadBtn = document.createElement("div");
    var fileInput = document.createElement("input");

    loadBtn.append("Load Board");
    fileInput.type = "file"
    fileInput.style.position = "absolute";
    fileInput.style.top = "0";
    fileInput.style.right = "0";
    fileInput.style.opacity = "0";
    // Dirty hack to solve previous issue where clickable area
    // was smaller than desired.
    // See https://stackoverflow.com/questions/21842274/cross-browser-custom-styling-for-file-upload-button/21842275#21842275
    // One impact is that the input element (invisible to the user) can possibly be larger than the visible button div.
    // If this impacts layout of other elements, this approach can be revisited.
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
        reader.onloadend = (e) =>
        {
            // e.target points to the reader
            if  (e.target)
            {
                const fileContents: any = e.target.result;
                boardState = JSON.parse(fileContents);
                appState.guiViewMode = "aggregate";
                document.dispatchEvent(OutdatedGUI);
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
    });

    // Will be a grid container for the buttons.
    const buttonsContainer = document.createElement("div");
    buttonsContainer.id = "buttonsContainer";
    buttonsContainer.append(newBtn, loadBtnWrapper);
    buttonsContainer.style.display = "grid";

    // Display the two buttons side by side.
    buttonsContainer.style.gridTemplateColumns = "auto auto"; 
    buttonsContainer.style.textAlign = "center"; 
    
    document.getElementsByTagName("body")[0].append(buttonsContainer);
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
// TODO : implement functionality for aggregrate GUI.


    /*
    * Renders a button which, when clicked, automatically intiates a
    * download to the user's  file system, of the user's board data,
    * serialized as a JSON text file.
    * A snapshot of the board data, taken at the time of this function
    * being called, is used.
    * This approach is taken on the assumption that any alternative user
    * action that would change the underlying board state would first
    * raise an outdate GUI event, thus re-rendering this button.
    */
    function RenderDownloadBtn()
    {
        const exportData = new Blob([JSON.stringify(boardState)],
                                    {type: 'application/json'});
        const downloadURL = window.URL.createObjectURL(exportData);
        const outputFileName: string = "myBoardData.json";
        const dlBtnText: string = "Save (download board)";
        const dlBtn = document.createElement("div");
        const dlAnchor = document.createElement("a");
        dlAnchor.download=outputFileName;
        dlAnchor.href = downloadURL;
        dlBtn.append(dlBtnText);
        dlAnchor.appendChild(dlBtn);
        document.getElementsByTagName("body")[0].appendChild(dlAnchor);
    }

    RenderDownloadBtn();
    
    // TODO : continue implementing lists in GUI.
    const listsContainer = document.createElement("div");
    const numLists: number = boardState.listsTitles.length;
    
    // Need an additional column for list-adding button.
    const numColumns: number = numLists + 1;
    
    listsContainer.style.display = "grid";
    listsContainer.style.gridTemplateColumns = "auto ".repeat(numColumns);

    // Will sort list ids by their intended GUI position,
    // left to right.
    const listIds: number[] = boardState.listsTitles.map((elt, i) => i);
    listIds.sort((a: number, b: number) =>
    {
        return boardState.listsPositions[a] - boardState.listsPositions[b]
    });

    for (let i = 0; i < numColumns; i++)
    {
        if (i == numLists)
        {
            // The last item to display in the list container
            // is not a list itself, but a button for adding
            // a new list to the board.
            listsContainer.append(MakeAddListBtn()); 
            continue;
        }
        const listDiv = MakeListDiv(listIds[i]);
        listDiv.style.backgroundColor = "red";
        listDiv.style.margin = "5px";
        listDiv.style.padding = "5px";
        listsContainer.appendChild(listDiv);
    }
    document.getElementsByTagName("body")[0].appendChild(listsContainer);

}

/*
* Renders a view of one focused card.
* Shows title, labels, notes.
* Provides controls for renaming card,
* changing notes, adding/deleting labels,
* deleting the card.
*/
function RenderFocus()
{
    const id: number = appState.focusedCardId; 

    const cardParts: Node[] = 
    [
        // TODO : Add style to each.
        MakeCardTitleDiv(id),
        MakeNoteDiv(id),
        MakeLabelsDiv(id),
        MakeCardDeleteButton(id),
        MakeCardBackButton()
    ];

    cardParts.forEach((cardPart) =>
    {
        document.getElementsByTagName("body")[0].appendChild(cardPart);
    });
}

/*
* Takes id of a card.  Returns a div to add to the
* aggregate view, displaying card's title and 
* providing user controls for moving card.
*/
function MakeCardDiv(id: number)
{
    // TODO : add style

    const container = document.createElement("div");
    container.classList.add("cardContainer");
    
    /*
    * Basic structure of a card's representation
    * in aggregate view is a 3x3 matrix:
    * 
    *  |-----------------|-----------------|------------------|
    *  |                 |                 |                  |
    *  |                 |  move up btn    |                  |
    *  |                 |                 |                  |
    *  |-----------------|-----------------|------------------|
    *  |                 |                 |                  |
    *  |  move left btn  |  card title     |  move right btn  |
    *  |                 |                 |                  |
    *  |-----------------|-----------------|------------------|
    *  |                 |                 |                  |
    *  |                 |  move down btn  |                  |
    *  |                 |                 |                  |
    *  |-----------------|-----------------|------------------|
    */

    const cells: number[] =
    [
        0, 1, 2,
        3, 4, 5,
        6, 7, 8
    ];

    /*
    * Defines each cell for the 3x3.
    */
    function MakeCell(cardId: number, indexInto3x3: number)
    {
        const cell = document.createElement("div");
        switch(indexInto3x3)
        {
            // Center cell represents the card itself.
            case 4:
                cell.style.textAlign = "left";
                cell.classList.add("cardCell");
                cell.append(boardState.cardsTitles[id]);
                cell.addEventListener("click", () =>
                {
                    appState.focusedCardId = cardId;
                    appState.guiViewMode = "focused";
                    document.dispatchEvent(OutdatedGUI);
                });
                break;
                
            // Cells with buttons for moving card.
            case 1:
            case 3:
            case 5:
            case 7:
                // Parallel arrays.
                const arrowCellIds: number[] = [1, 3, 5, 7];
                var arrows: string[] = ['🢁','🢀','🢂','🢃'];
                const directions: string[] = ["up", "left", "right", "down"];
                
                // Construct cell from data in parallel arrays.
                cell.classList.add("arrow");
                cell.append(arrows[arrowCellIds.indexOf(indexInto3x3)]);
                cell.addEventListener("click", () =>
                {
                    boardState = MoveCard(boardState, id, directions[arrowCellIds.indexOf(indexInto3x3)]);
                    document.dispatchEvent(OutdatedGUI);
                });
                break;

            // Cells with buttons for moving card.
            default:
                break;
        }
        return cell;
    }

    // Have already defined what each cell will be,
    // Can insert cells into container, now that 
    // they've all been defined.
    cells.forEach((i) =>
    {
        container.appendChild(MakeCell(id, i));
    });

    return container;
}

/*
* Takes id of a list.  Returns a div to add to the
* aggregate view, displaying all child cards and 
* providing user controls for moving, renaming list.
*/
function MakeListDiv(listId: number)
{
    // TODO : implement

    /*
    * Basic structure of a list's representation
    * in aggregate view:
    *
    *   |--------|--------------------------|--------|
    *   |        |  title | delete list btn |        |
    *   |        |--------------------------|        |
    *   |  move  |       card               |  move  |
    *   |  left  |--------------------------|  right |
    *   |  btn   |       card               |  btn   |
    *   |        |--------------------------|        |
    *   |        |       card               |        |
    *   |        |--------------------------|        |
    *   |        |      add card btn        |        |
    *   |--------|--------------------------|--------|
    */
   
    // Construct metacontainer.
    const topLevelContainer = document.createElement("div");
    topLevelContainer.style.display= "grid";
    
    // Want side columns to be narrow than center column.
    topLevelContainer.style.gridTemplateColumns = "1fr 6fr 1fr";

    // Construct left and right columns, including interactivity.
    const leftColumn = document.createElement("div");
    const rightColumn = document.createElement("div");
    leftColumn.append("🢀");
    rightColumn.append("🢂");
    leftColumn.classList.add("arrow");
    rightColumn.classList.add("arrow");
    leftColumn.addEventListener("click", () =>
    {
        boardState = MoveList(boardState, listId, "left");
        document.dispatchEvent(OutdatedGUI);
    });
    rightColumn.addEventListener("click", () =>
    {
        boardState = MoveList(boardState, listId, "right");
        document.dispatchEvent(OutdatedGUI);
    });

    const middleColumnContainer = document.createElement("div");
    middleColumnContainer.style.display = "grid";

    // Construct middle column, top row.
    const topRow = document.createElement("div");
    topRow.style.display = "grid";
    
    // Want delete button to be narrower than title div.
    topRow.style.gridTemplateColumns = "3fr 1fr";

    const titleDiv = document.createElement("div");
    titleDiv.append(boardState.listsTitles[listId]);
    topRow.appendChild(titleDiv);
    const deleteBtn = MakeListDeleteButton(listId);
    topRow.appendChild(deleteBtn);
    middleColumnContainer.appendChild(topRow);

    // Construct middle column, middle rows.
    const listCardIds: number[] = boardState.listsCards[listId];
    listCardIds.forEach((cardId) =>
    {
        middleColumnContainer.appendChild(MakeCardDiv(cardId));
    });

    // Construct middle column, bottom rows.
    middleColumnContainer.appendChild(MakeAddCardToListBtn(listId));
    
    // Put it all together.
    topLevelContainer.appendChild(leftColumn);
    topLevelContainer.appendChild(middleColumnContainer);
    topLevelContainer.appendChild(rightColumn);

    return topLevelContainer;
}

/*
* Takes id of a card.  Returns a div which
* displays a card's title and provides user
* controls for changing title.
*/
function MakeCardTitleDiv(id: number)
{
    // Populate card title from current board state.
    const title: string = boardState.cardsTitles[id];
    const result = document.createElement("H1");
    result.append(title);
    
    // Used to make title writable by the user.
    result.id = "card_title_div";

    // Add interactivity to title.
    result.addEventListener("click", () =>
    {
        // Make input area for user to set new title.
        const toReplace = document.getElementById("card_title_div");
        const editableArea = document.createElement("input");
        editableArea.placeholder = title;
        editableArea.addEventListener("keypress", (event) =>
        {
            if (event.getModifierState("Control") && event.key === "Enter")
            {
                boardState = RenameCard(boardState, id, editableArea.value);
                document.dispatchEvent(OutdatedGUI);
            }
        });
       
        // Preserve line break between title area and notes area,
        // by inserting a spacer div.
        const editableAreaWrapper = document.createElement("div");
        editableAreaWrapper.appendChild(document.createElement("div"));
        editableAreaWrapper.appendChild(editableArea);

        // Swap title div for input control.
        toReplace?.replaceWith(editableAreaWrapper);
    });
    return result;
}

/*
* Takes id of a card.  Returns a div which
* displays a card's note and provides user
* controls for changing note contents.
*/
function MakeNoteDiv(id: number)
{
    // Populate card note from current board state.
    const note: string = boardState.cardsNotes[id];
    const result = document.createElement("div");
    result.append(note);
    
    // Used to make note writable by the user.
    result.id = "card_note_div";

    // Add interactivity to note.
    result.addEventListener("click", () =>
    {
        // Make input area for user to set new note.
        const toReplace = document.getElementById("card_note_div");
        const editableArea = document.createElement("textarea");
        editableArea.placeholder = note;
        editableArea.addEventListener("keypress", (event) =>
        {
            if (event.getModifierState("Control") && event.key === "Enter")
            {
                boardState = ChangeCardNotes(boardState, id, editableArea.value);
                document.dispatchEvent(OutdatedGUI);
            }
        });
       
        // Preserve line break between notes area and labels
        // by inserting a spacer div.
        const editableAreaWrapper = document.createElement("div");
        editableAreaWrapper.appendChild(document.createElement("div"));
        editableAreaWrapper.appendChild(editableArea);

        // Swap note div for input control.
        toReplace?.replaceWith(editableAreaWrapper);
    });
    return result;
}

/*
* Takes id of a card.  Returns a div which
* displays a card's labels in a row and provides
* user controls for changing labels.
*/
function MakeLabelsDiv(id: number)
{
    const labels: string[] = boardState.cardsLabels[id];
    const result = document.createElement("div");
    result.style.display = "grid";
    result.style.gridTemplateColumns = "auto ".repeat(labels.length);
    
    // Used to make labels writable by the user.
    result.id = "card_labels_div";
    
    labels.forEach((label) =>
    {
        const labelDiv = document.createElement("div");
        labelDiv.append(label);
        result.appendChild(labelDiv);
    });

    // Add interactivity to label list.
    result.addEventListener("click", () =>
    {
        // Make input area for user to modify labels.
        const toReplace = document.getElementById("card_labels_div");
        const editableArea = document.createElement("input");
        editableArea.value = labels.join(", ");
        editableArea.addEventListener("keypress", (event) =>
        {
            if (event.getModifierState("Control") && event.key === "Enter")
            {
                const newLabels: string[] = editableArea.value
                                            .split(",")
                                            .map(s => s.trimStart());

                boardState = ChangeCardLabels(boardState, id, newLabels);
                document.dispatchEvent(OutdatedGUI);
            }
        });
        toReplace?.replaceWith(editableArea);
    });
    return result;
}

/*
* Returns a button which adds a new default card to given list.
* Doesn't change GUI view mode.
*/
function MakeAddCardToListBtn(listId: number)
{
    const btn = document.createElement("div");
    btn.append("✚");
    btn.classList.add("addCardButton");
    btn.addEventListener("click", () =>
    {
        boardState = AddCard(boardState, listId);
        document.dispatchEvent(OutdatedGUI);
    });
    return btn;
}

/*
* Returns a button which, when clicked, creates a new
* default list, adding it to the board.
* Doesn't change GUI view mode.
*/
function MakeAddListBtn()
{
    const btn = document.createElement("div");
    btn.append("✚");
    btn.classList.add("addListButton");
    
    btn.addEventListener("click", () =>
    {
        boardState = AddList(boardState);
        document.dispatchEvent(OutdatedGUI);
    });
    return btn;
}

/*
* Returns a button which deletes the given list.
* Doesn't change GUI view mode.
*/
function MakeListDeleteButton(id: number)
{
    const btn = document.createElement("div");
    btn.append("✗")

    // Don't want button text against edge of button.
    btn.style.display = "flex";
    btn.style.alignItems = "center";
    btn.style.justifyContent = "center";    

    btn.style.background = "#ff5555";
    btn.addEventListener("click", () =>
    {
        boardState = DeleteList(boardState, id);
        document.dispatchEvent(OutdatedGUI);
    });
    return btn;
}

/*
* Returns a button which returns user to aggregate view.
*/
function MakeCardBackButton()
{
    const btn = document.createElement("div");
    btn.append("Back");
    btn.addEventListener("click", () =>
    {
        appState.guiViewMode = "aggregate";
        document.dispatchEvent(OutdatedGUI);
    });
    return btn;
}

/*
* Returns a button which deletes the focused card theen
* returns user to aggregate view.
*/
function MakeCardDeleteButton(id: number)
{
    const btn = document.createElement("div");
    btn.append("Delete card");
    btn.addEventListener("click", () =>
    {
        boardState = DeleteCard(boardState, id);
        appState.focusedCardId = 0;
        appState.guiViewMode = "aggregate";
        document.dispatchEvent(OutdatedGUI);
    });
    return btn;
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
    const numScripts = document.getElementsByTagName("script").length;
    
    while (document.getElementsByTagName("body")[0].children.length > numScripts)
    {
        document.getElementsByTagName("body")[0].children[numScripts].remove();
    } 
}

// Render needs to be prepared to respond to this event before
// InitializeApp raises it.
document.addEventListener("OutdatedGUI", Render);
InitializeApp();
