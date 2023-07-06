/*
* Holds state of the user's board.  Can be imported and exported as file.
*/
var boardData = '{}';

const uiOutdatedEvent = new Event("uiNeedsUpdate");
const fileSelector = document.getElementById("fileInputControlHidden");
const saveControls = document.getElementById("saveControls");
const fileExportControl = document.getElementById("fileExportControl");
const listContainer = document.getElementById("listContainer");
const modalCloseButtons = document.getElementsByClassName("modalCloseButton");

/*
* Updates UI from global boardData state, which is assumed to be up to date.
*/
document.addEventListener(
    "uiNeedsUpdate",
    (e) =>
    {
        const userLists = boardData.lists;
        const userCards = boardData.cards;
        const listIds = Object.keys(userLists);
        
        // Empty container before filling it.
        let listNodes = document.getElementsByClassName("userList");
        const oldNumUserLists = listNodes.length;
        for (let i = 0; i < oldNumUserLists; i++)
        {
            listNodes[0].remove();
        }; 
        
        // TODO : change loop over list id's because it doesn't respect position property
        // instead, could have a dict of { position : id } and loop over keys, looking up id
        // as needed to get data for that list.
        // Alternatively, could still loop over id's, but do some positoning logic...

        listIds.forEach(id =>
        {
            // Get data needed to build the div for the new list. 
            const newListDiv = document.createElement("div");
            const theList = userLists[id];
            const listTitle = document.createTextNode(id.toString() + " : " + theList.name);
            const postitionProperty = document.createTextNode("position property : " +    theList.position.toString());
            const br = document.createElement("br");

            // Build the div required for the new list.
            newListDiv.className = "userList";
            newListDiv.appendChild(listTitle);
            newListDiv.appendChild(br);
            newListDiv.appendChild(postitionProperty);

            // Add each relevant card to the list, along with its ID number.
            arrCardsForThisList = userLists[id].cardIds.map(i => [i, userCards[i]]);
            arrCardsForThisList.forEach(AddCardNode);
            
            // Helper function.
            function AddCardNode(cardParts)
            {
                // Get data needed to build the div for the new card.
                // The index of this card in the global state's card array is used so that the div
                // can know about its backing data structure.
                const cardId = cardParts[0];
                const card = cardParts[1];
                const cardTitle = document.createTextNode(card.title);
                
                // Build the div required for the new card.
                const newCardDiv = document.createElement("div");
                newCardDiv.className = "userCard rectDropButton";
                newCardDiv.id = "cardNumber" + cardId.toString();
                newCardDiv.appendChild(cardTitle);
               
                // The card's labels need to be shown too.
                newCardDiv.appendChild(GetLabels(cardId));

                // Each card needs an event listener to display the same (shared) modal when clicked.
                // No need to clean these up manually, the listeners die
                // when the card element gets garbage collected.
                newCardDiv.addEventListener("click", (e) =>
                {
                    // Modal should be shown to focus a card's details when a card is clicked.
                    document.getElementById("modalCardContainer").style.display = "flex";

                    // Delete full card div if and only if one already exists.
                    let fullCards = document.getElementsByClassName("fullCard");
                    if (fullCards.length > 0)
                    {
                        fullCards[0].remove();
                    }
                    
                    // Inject div for card that user has clicked.
                    document.getElementById("modalCardContent").appendChild(FullCard(cardId));
                });

                // Card div is good to go.
                newListDiv.appendChild(newCardDiv);
            }
            
            // List div is good to go.
            listContainer.appendChild(newListDiv);
        });

        // Now must set number of visual columns in list container.
        // Could add 1 if, for example, placing a "new list" button to the right of the rightmost user list.
        const newNumCols = listIds.length;
        listContainer.style.gridTemplateColumns = " auto ".repeat(newNumCols);
    },
    false
);

/*
* Import board data from user-specified file.
* Raise an event when (successfully) finished to get the UI updated.
* No need for user to manually "load" a file, once selected.
*/
fileSelector.onchange = (e) =>
{
    const file = fileSelector.files[0]
    if (!file)
    {
        return;
    }

    const reader = new FileReader();
    reader.onload = (e) =>
    {
        // e.target points to the reader
        const textContent = e.target.result;
        boardData = JSON.parse(textContent);
        document.dispatchEvent(uiOutdatedEvent);
    }
    reader.onerror = (e) =>
    {
        const error = e.target.error;
        console.error(`Error occured while reading ${file.name}`, error);
    }

    reader.readAsText(file);
};

/*
* Export board data to JSON for user to download.
*/
fileExportControl.addEventListener("click", (e) =>
{
    const exportData = new Blob([JSON.stringify(boardData)], {type: 'application/json'});
    const downloadURL = window.URL.createObjectURL(exportData);
    document.getElementById("downloadLink").href = downloadURL;
    document.getElementById("modalDownloadContainer").style.display = "block";
});

/*
* Download controls not needed once download starts.
*/
document.getElementById("downloadLink").addEventListener("click", (e) =>
{
    document.getElementById("modalDownloadContainer").style.display = "none";
});

/*
* User should be able to close any modal.
* Can get away with only running this once because all user cards share the same modal.
*/
[...modalCloseButtons].forEach(closeBtn => 
{
    closeBtn.addEventListener("click", function (e) 
    {
        // User may wish to navigate away from looking at the modal for a card.      
        this.parentNode.parentNode.style.display = "none";
    });
});

/*
* Returns a div containing most of the data available about the card with
* the supplied card ID.  Not just the summary information that will be 
* displayed when the cards are viewed in aggregate.  But everything that 
* should be shown when this card is in focus.
*/
function FullCard(cardId)
{
    // The data source for building the GUI full card.
    const card = boardData.cards[cardId];
    
    let outputDiv = document.createElement("div");
    outputDiv.className = "fullCard";
    const titleDiv = document.createElement("div");
    const titleText = document.createTextNode(card.title);
    const labelDiv = GetLabels(cardId);
    const notesText = document.createTextNode(card.notes);
    titleDiv.appendChild(titleText);
    titleDiv.style.fontSize = "1.5em";
    titleDiv.style.fontWeight = "bold";
    titleDiv.style.padding = "5px 0px 5px 0";
    outputDiv.appendChild(labelDiv);
    outputDiv.appendChild(titleDiv);
    outputDiv.appendChild(notesText);
    // TODO : deploy more data from card to modal content.
    // TODO : make modal full card interative.

    return outputDiv; 
}

/*
* Returns a div containing the rendered labels of the card with supplied id.
*/
function GetLabels(cardId)
{

    // The data source for building the labels.
    const card = boardData.cards[cardId];
    const cardLabels = card.attributes.labels;

    const newLabelContainerDiv = document.createElement("div");
    newLabelContainerDiv.className = "labelContainer";
    newLabelContainerDiv.style.gridTemplateColumns = " auto ".repeat(cardLabels.length);
    cardLabels.forEach(label =>
    {
        const newLabelDiv = document.createElement("div");
        const labelText = document.createTextNode(label);
        newLabelDiv.appendChild(labelText);
        newLabelDiv.className = "label";
    
        newLabelContainerDiv.appendChild(newLabelDiv);
    });
    return newLabelContainerDiv;
}
