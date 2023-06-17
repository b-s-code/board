/*
* Holds state of the user's board.  Can be imported and exported as file.
*/
var boardData = '{}';

const uiOutdatedEvent = new Event("uiNeedsUpdate");
const fileSelector = document.getElementById("fileInputControlHidden");
const saveControls = document.getElementById("saveControls");
const fileExportControl = document.getElementById("fileExportControl");
const listContainer = document.getElementById("listContainer");

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
        // Intentionally working with DOM here instead of setting list container's
        // inner HTML to empty string.  Assuming that this is better
        // practice w.r.t. not messing up the DOM tree.
        let listNodes = document.getElementsByClassName("userList");
        const oldNumUserLists = listNodes.length;
        for (let i = 0; i < oldNumUserLists; i++)
        {
            listNodes[0].remove();
        }; 
        
        // TODO : change loop over id's because it doesn't respect position property
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

            // Add each relevant card to the list.
            cardsForThisList = userLists[id].cardIds.map(i => userCards[i]);
            cardsForThisList.forEach(AddCardNode);
            
            // Helper function.
            function AddCardNode(card)
            {
                // Get data needed to build the div for the new card.
                const newCardDiv = document.createElement("div");
                const cardTitle = document.createTextNode(card.title);
                const cardLabels = card.attributes.labels;
                
                // Build the div required for the new card.
                newCardDiv.className = "userCard rectDropButton";
                newCardDiv.appendChild(cardTitle);
               
                // The card's labels need to be shown too.
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
                newCardDiv.appendChild(newLabelContainerDiv);

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
        
        // Each card needs an event listener to display the same (shared) modal when clicked.
        // No need to clean these up manually at start of function, the listeners die
        // when the card element gets garbage collected.
        let cardNodes = document.getElementsByClassName("userCard");
        for (let i = 0; i < cardNodes.length; i++)
        {
            cardNodes[i].addEventListener("click", (e) =>
            {
                // TODO : deploy new contents to modal card content from this cardNode.
                document.getElementById("modalCardContainer").style.display = "block";
            });
        }; 
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
*/
let modalCloseButtons = document.getElementsByClassName("modalCloseButton");
for (let i = 0; i < modalCloseButtons.length; i++)
{
    modalCloseButtons[i].addEventListener("click", (e) =>
    {
        // TODO : See if can clean this up by modifying a parent element.

        // A user may change their mind about downloading their data.      
        document.getElementById("modalDownloadContainer").style.display = "none";
        
        // A user may wish to navigate away from looking at the modal for a card.      
        document.getElementById("modalCardContainer").style.display = "none";
    });
}
