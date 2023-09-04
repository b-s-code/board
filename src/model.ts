/*
* For each board, the user's data is stored in a JSON file.
* The file just stores one object, satisfying this interface.
*/

/*
* Two collections of parallel arrays.  One for cards' properties.
* One for lists' properties.
*/
export default interface BoardState
{
    // Elts are respective cards' details.
    // Clients of this interface requiring a reference
    // to a "card" just need the index of said card in
    // these arrays.
    // Parallelness of these arrays must be maintained 
    // by any functions which modify them.
    cardsTitles : string[],
    cardsNotes  : string[],
    cardsLabels : string[][],
    
    // Elts are respective lists' details.
    // Clients of this interface requiring a reference
    // to a "list" just need the index of said list in
    // these arrays.
    // Parallelness of these arrays must be maintained 
    // by any functions which modify them.
    listsTitles    : string[],
    // One array of card ids (which are indices
    // into other card arrays, and need to be
    // created/deleted/updated here as cards are
    // added/removed/moved between lists) per list.
    listsCards     : number[][],
    // listPositions[i] evaluates to the position index
    // of list with list id i.
    listsPositions : number[]
};