/*
* Holds state of the user's board.  Can be imported and exported as file.
*/
var boardData = '{}';

const uiOutdatedEvent = new Event("uiNeedsUpdate");
const fileSelector = document.getElementById("fileInputControl");
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
        listContainer.innerHTML = '';
        listIds.forEach(id =>
        {
            let listDivParts = ['<div class="userList">List ', id.toString(), '\n</br>'];
            listDivParts.push(userLists[id].name + '\n');
            
            
            console.log(typeof(listDivParts));
            listDivParts.push('</div>');
            listContainer.innerHTML += listDivParts.join('');
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