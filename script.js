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
        const numUserLists = listNodes.length;
        for (let i = 0; i < numUserLists; i++)
        {
            listNodes[0].remove();
        }; 

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
                
                // Build the div required for the new card.
                newCardDiv.className = "userCard rectDropButton";
                newCardDiv.appendChild(cardTitle);
                
                // TODO : add more than just title from each card

                // Card div is good to go.
                newListDiv.appendChild(newCardDiv);
            }
            
            // List div is good to go.
            listContainer.appendChild(newListDiv);
        });
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
* A user might change their mind about downloading their data.
*/
document.getElementById("modalDownloadCloseButton").addEventListener("click", (e) =>
{
    document.getElementById("modalDownloadContainer").style.display = "none";
});

/*
* Download controls not needed once download starts.
*/
document.getElementById("downloadLink").addEventListener("click", (e) =>
{
    document.getElementById("modalDownloadContainer").style.display = "none";
});

// TODO : make lists display horizontally such that num columns in listContainer is determined by number of lists
// may consider using flexbox
