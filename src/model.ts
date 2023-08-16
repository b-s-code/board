export default interface BoardState
{
    // Parallel arrays.
    // Elts are respective cards details.
    // Clients of this interface requiring a reference
    // to a "card" just need the index of said card in
    // these arrays.
    // Parallelness of these arrays must be maintained 
    // by any functions which modify them.
    cardsTitles : string[],
    cardsNotes  : string[],
    cardsLabels : string[][],
    
    // Elts are indices of respective lists details
    // into the list arrays below.  So this array must 
    // rep. an increasing consecutive sequence starting at 0.
    listsIds : number[],
    
        listsTitles    : string[],

        // One array of card ids (which are indices
        // into other card arrays, and need to be
        // created/deleted/updated here as cards are
        // added/removed/moved between lists) per list.
        listsCards     : number[][],
        
        listsPositions : number[]
};