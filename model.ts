export default interface BoardState
{
    // Elts are indices of respective cards details
    // into the card arrays below.  So this array must 
    // rep. an increasing consecutive sequence starting at 0.
    cardsIds : number[],

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