import BoardState from "./model";
import { RenameCard, ChangeCardNotes, ChangeCardLabels, fillerStr } from "./controller";

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

    // TODO : remove
    // Just a temp card mockup.
    document.getElementsByTagName("body")[0].appendChild(MakeCardDiv(0));

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
        const exportData = new Blob([JSON.stringify(boardState)], {type: 'application/json'});
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
    
    
    // TODO : remove
    // Dummy button for testing focused view.
    const renderFocusBtn = document.createElement("div");
    renderFocusBtn.addEventListener("click", (() =>
    {
        appState.guiViewMode = "focused";
        document.dispatchEvent(OutdatedGUI);
    }));
    renderFocusBtn.append("Go to focused view.");
    document.getElementsByTagName("body")[0].appendChild(renderFocusBtn);
}

/*
* Renders a view of one focused card.
* Shows title, labels, notes.
* Provides controls for renaming card,
* changing notes, adding/deleting labels
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
    const container = document.createElement("div");
    container.classList.add("cardContainer");
    
    // Basic structure of a card's representation
    // in aggregate view is a 3x3 matrix.
    const cells: number[] =
    [
        0, 1, 2,
        3, 4, 5,
        6, 7, 8
    ];

    /*
    * Defines each cell for the 3x3.
    */
    function MakeCell(indexInto3x3: number)
    {
        const cell = document.createElement("div");
        switch(indexInto3x3)
        {
            // TODO : add interactivity.

            case 4:
                cell.style.textAlign = "left";
                cell.classList.add("cardCell");
                cell.append(boardState.cardsTitles[id]);
                break;
            case 1:
                cell.classList.add("arrow");
                cell.append("^");
                break;
            case 3:
                cell.classList.add("arrow");
                cell.append("<");
                break;
            case 5:
                cell.classList.add("arrow");
                cell.append(">");
                break;
            case 7:
                cell.classList.add("arrow");
                cell.append("v");
                break;
        }
        return cell;
    }

    // Have already defined what each cell will be,
    // Can insert cells into container, now that 
    // they've all been defined.
    cells.forEach((i) =>
    {
        container.appendChild(MakeCell(i));
    });

    return container;
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
