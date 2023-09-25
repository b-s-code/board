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
    AddList,
    RenameList
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
    newBtn.classList.add("welcomeButton", "clickable");

    newBtn.append("New board");
    newBtn.addEventListener("click", (e) =>
    {
        appState.guiViewMode = "aggregate";
        document.dispatchEvent(OutdatedGUI);
    });

    // Button for opening existing board, and an
    // invisble file input control.  These work together.
    var loadBtn = document.createElement("div");
    loadBtn.classList.add("welcomeButton", "clickable");
    var fileInput = document.createElement("input");
    fileInput.type = "file";
    
    // By default, clickable area is the size of the 
    // small input element.  Instead we want the clickable 
    // area to correspond to the large div.
    fileInput.style.display = "none";
    loadBtn.addEventListener("click", () => 
    {
        fileInput.click();
    });
    loadBtn.append(document.createTextNode("Load board"), fileInput);

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
    buttonsContainer.append(newBtn, loadBtn);

    document.body.append(buttonsContainer);
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
    /*
    * Helper function.
    * Returns a button which, when clicked, automatically intiates a
    * download to the user's file system, of the user's current board
    * data, serialized as a JSON text file.
    */
    function MakeDownloadBtn()
    {
        // Set up to make data downloadable.
        const exportData = new Blob([JSON.stringify(boardState)],
                                    {type: 'application/json'});
        const downloadURL = window.URL.createObjectURL(exportData);
        const outputFileName: string = "myBoardData.json";
        
        // Create a hidden <a> element, which links to
        // the downloadable data.
        const dlAnchor = document.createElement("a");
        dlAnchor.download=outputFileName;
        dlAnchor.href = downloadURL;
        dlAnchor.style.display = "none";

        // Create a visible div which the user clicks
        // to initiate a download, instead of having
        // them click the <a> element itself.
        const dlBtn = document.createElement("div");
        dlBtn.classList.add("downloadButton", "clickable");
        dlBtn.append("Save (download board)");
        dlBtn.appendChild(dlAnchor);
        dlBtn.addEventListener("click", () => {dlAnchor.click();});

        return dlBtn;
    }

    // Construct bottom bar, which contains app title and
    // a download button, for the user's data.
    const bottomBar = document.createElement("div");
    bottomBar.classList.add("aggregateBottomBar");
    const lhsDiv = document.createElement("div");
    const title = document.createElement("h3");
    title.append("B . O . A . R . D");
    lhsDiv.append(title);
    lhsDiv.classList.add("appTitleDiv");
    bottomBar.append(lhsDiv, MakeDownloadBtn());

    // Now ready to actually render stuff.
    document.body.appendChild(MakeListsContainer());
    document.body.appendChild(bottomBar);
}

/*
* Returns all lists, and thus all cards. 
*/
function MakeListsContainer()
{
    const listsContainer = document.createElement("div");
    const numLists: number = boardState.listsTitles.length;
    
    // Need an additional column for list-adding button.
    const numColumns: number = numLists + 1;
    
    listsContainer.classList.add("listsContainer");
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
        listsContainer.appendChild(listDiv);
    }
    return listsContainer;
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

    /*
    * Basic structure of a card's representation
    * in focused view:
    * 
    *  |----------------|--------------|
    *  |  title         |  delete btn  |  } top row container
    *  |----------------|--------------|
    *  |                               |
    *  |  notes                        |
    *  |                               |
    *  |-------------------------------|
    *  |  labels                       |
    *  |-------------------------------|
    *  |  back btn                     |
    *  |-------------------------------|
    *  
    *   \__________  _________________/
    *              \/ 
    *            container
    */
    const container = document.createElement("div");
    const topRow = document.createElement("div");
    container.classList.add("cardContainerFocused");
    topRow.classList.add("cardTopRowFocused");
    
    // Construct top row.
    const titleDiv = MakeCardTitleDiv(id);
    const deleteBtn = MakeCardDeleteButton(id);
    [titleDiv, deleteBtn].forEach((elt) => topRow.appendChild(elt));

    const parts: Node[] = 
    [
        topRow,
        MakeNoteDiv(id),
        MakeLabelsDiv(id),
        MakeCardBackButton()
    ];
    parts.forEach((cardPart) =>
    {
        container.appendChild(cardPart);
    });
    
    document.body.appendChild(container);
}

/*
* Takes id of a card.  Returns a div to add to the
* aggregate view, displaying card's title and 
* providing user controls for moving card.
*/
function MakeCardDiv(id: number)
{
    const container = document.createElement("div");
    container.classList.add("cardContainerAggregate");
    
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
                cell.classList.add("cardCell", "clickable");
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
                cell.classList.add("arrow", "clickable");
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
    topLevelContainer.classList.add("listTopLevelContainer");

    // Construct left and right columns, including interactivity.
    const leftColumn = document.createElement("div");
    const rightColumn = document.createElement("div");
    leftColumn.append("🢀");
    rightColumn.append("🢂");
    leftColumn.classList.add("arrow", "clickable");
    rightColumn.classList.add("arrow", "clickable");
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
    middleColumnContainer.classList.add("listMiddleColumnContainer");

    // Construct middle column, top row.
    const topRow = document.createElement("div");
    topRow.classList.add("listTopRow");

    const titleDiv = MakeListTitleDiv(listId);
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
    const result = document.createElement("h3");
    result.append(title);
    
    // Used to make title writable by the user.
    result.id = "card_title_div";

    // Add interactivity to title.
    result.addEventListener("click", () =>
    {
        // Make input area for user to set new title.
        const toReplace = document.getElementById("card_title_div");
        const editableArea = document.createElement("input");
        editableArea.value = title;
        editableArea.addEventListener("focusout", (event) =>
        {
            boardState = RenameCard(boardState, id, editableArea.value);
            document.dispatchEvent(OutdatedGUI);
        });

        // Swap title div for input control.
        toReplace?.replaceWith(editableArea);
    });
    return result;
}

/*
* Takes id of a list.  Returns a div which
* displays the list's title and provides user
* controls for changing title.
*/
function MakeListTitleDiv(id: number)
{
    // Populate list title from current board state.
    const title: string = boardState.listsTitles[id];
    const result = document.createElement("h3");
    result.append(title);
    
    // Used to make title writable by the user.
    // There will usually be more than one list title div
    // displayed to the user at a time.
    const htmlEltId: string = "list_title_div_" + id.toString();
    result.id = htmlEltId;

    // Add interactivity to title.
    result.addEventListener("click", () =>
    {
        // Make input area for user to set new title.
        const toReplace = document.getElementById(htmlEltId);
        const editableArea = document.createElement("input");
        editableArea.value = title;
        editableArea.addEventListener("focusout", (event) =>
        {
            boardState = RenameList(boardState, id, editableArea.value);
            document.dispatchEvent(OutdatedGUI);
        });
       
        // Swap title div for input control.
        toReplace?.replaceWith(editableArea);
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
    const textArea = document.createElement("textarea");
    textArea.append(note);
    textArea.classList.add("note");

    // Add interactivity to note.
    textArea.addEventListener("focusout", (event) =>
    {
        boardState = ChangeCardNotes(boardState, id, textArea.value);
        document.dispatchEvent(OutdatedGUI);
    });
    
    return textArea;
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
    result.classList.add("labelContainer");
    
    // Not sure this logic can be farmed out to the stylesheet...
    result.style.gridTemplateColumns = "auto ".repeat(labels.length);
    
    // Used to make labels writable by the user.
    result.id = "card_labels_div";
    
    labels.forEach((label) =>
    {
        const labelDiv = document.createElement("div");
        labelDiv.classList.add("labelDiv", "clickable");
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
        editableArea.addEventListener("focusout", (event) =>
        {
            const newLabels: string[] = editableArea.value
                                        .split(",")
                                        .map(s => s.trimStart());

            boardState = ChangeCardLabels(boardState, id, newLabels);
            document.dispatchEvent(OutdatedGUI);
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
    btn.classList.add("addCardButton", "clickable");
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
    btn.classList.add("addListButton", "clickable");
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
    btn.append("⨯")
    btn.classList.add("deleteButton", "clickable");
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
    btn.classList.add("cardBackButton", "clickable");
    const btnLabel = document.createElement("h3");
    btnLabel.append("↵");
    btn.appendChild(btnLabel);
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
    btn.append("⨯")
    btn.classList.add("deleteButton", "clickable");
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
    
    while (document.body.children.length > numScripts)
    {
        document.body.children[numScripts].remove();
    } 
}

// Render needs to be prepared to respond to this event before
// InitializeApp raises it.
document.addEventListener("OutdatedGUI", Render);
InitializeApp();
