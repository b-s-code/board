// Can use require() despite targeting browser,
// only since Browserify is used to build.
const cloneDeep = require('lodash.clonedeep');
import BoardState from "./model";

/*
* Used by regular code and test code.
*/
export const fillerStr = "...";

/*
* Pure function.
* Returns a new board, with card moved one unit in direction dir.
* Return input board if dir is not possible direction movement,
* given card's current position.
* dir can be "up", "down", "left", or "right".
*/
export function MoveCard(board: BoardState, cardId: number, dir: string): BoardState
{
    const boardCopy: BoardState = cloneDeep(board);

    // Need some details about the list that the card comes from.
    const parentListsCards: number[] = boardCopy.listsCards.filter((listCards, i) => listCards.includes(cardId))[0];
    const sourceListId: number = boardCopy.listsCards.indexOf(parentListsCards);
    const sourceListCards: number[] = boardCopy.listsCards[sourceListId];
    const sourceListPosOnBoard: number = boardCopy.listsPositions[sourceListId];
    
    // Need to know where the card is in its original list.
    const cardPosInSourceList: number = boardCopy.listsCards[sourceListId].indexOf(cardId);
    
    // First check move is possible.
    // If not, just return the supplied board.
    var isPoss: boolean = true;
    switch (dir)
    {
        case "up":
            if (cardPosInSourceList === 0)
            {
                // Then card is already at top of its list.
                isPoss = false;
            }
            break;
        case "down":
            const bottom: number = boardCopy.listsCards[sourceListId].length - 1;
            if (cardPosInSourceList === bottom)
            {
                // Then card is already at bottom of its list.
                isPoss = false;
            }
            break;
        case "left":
            const leftmostListPosition: number = Math.min(...boardCopy.listsPositions);
            if (sourceListPosOnBoard === leftmostListPosition)
            {
                // Then card is already in leftmost list.
                isPoss = false;
            }
            break;
        case "right":
            const rightmostListPosition: number = Math.max(...boardCopy.listsPositions);
            if (sourceListPosOnBoard === rightmostListPosition)
            {
                // Then card is already in rightmost list.
                isPoss = false;
            }
            break;
    }
    if (!isPoss)
    {
        return board;
    }

    // Assume now that move is indeed possible.
    const resultBoard: BoardState = cloneDeep(boardCopy);
    switch (dir)
    {
        // Source list === destination list when moving vertically.

        case "up":
            { // Scopes used so sourcePos, destPos can be redefined.
                const sourcePos: number = cardPosInSourceList;
                const destPos: number = cardPosInSourceList - 1;

                // Swap card with supplied id with the card above it.
                const tempCardId: number = resultBoard.listsCards[sourceListId][destPos];
                resultBoard.listsCards[sourceListId][destPos] = cardId;
                resultBoard.listsCards[sourceListId][sourcePos] = tempCardId;
            }
            break;

        case "down":
            {
                const sourcePos: number = cardPosInSourceList;
                const destPos: number = cardPosInSourceList + 1;

                // Swap card with supplied id with the card above it.
                const tempCardId: number = resultBoard.listsCards[sourceListId][destPos];
                resultBoard.listsCards[sourceListId][destPos] = cardId;
                resultBoard.listsCards[sourceListId][sourcePos] = tempCardId;
            }
            break;
        
        // Source list !== destination list when moving horizontally.
    
         case "left":
            {
                // Need to determine id of destination list.
                const destListPos: number = sourceListPosOnBoard - 1;
                const destListId: number = boardCopy.listsPositions.indexOf(destListPos);
                
                // Remove supplied card id from source list.
                resultBoard.listsCards[sourceListId].splice(cardPosInSourceList, 1);

                // Insert supplied card id into destination list.
                const destPos: number = Math.min(boardCopy.listsCards[destListId].length, cardPosInSourceList);
                resultBoard.listsCards[destListId].splice(destPos, 0, cardId);
            }
            break;
        case "right":
            {
                // Need to determine id of destination list.
                const destListPos = sourceListPosOnBoard + 1;
                const destListId: number = boardCopy.listsPositions.indexOf(destListPos);
                
                // Remove supplied card id from source list.
                resultBoard.listsCards[sourceListId].splice(cardPosInSourceList, 1);

                // Insert supplied card id into destination list.
                const destPos: number = Math.min(boardCopy.listsCards[destListId].length, cardPosInSourceList);
                resultBoard.listsCards[destListId].splice(destPos, 0, cardId);
            }
            break;
    }

    return resultBoard;
}

/*
* Pure function.
* Returns a new board, with list moved one unit in direction dir.
* Return input board if dir is not possible direction movement,
* given list's current position.
* dir can be "left" or "right".
*/
export function MoveList(board: BoardState, listId: number, dir: string): BoardState
{
    const resultBoard: BoardState = cloneDeep(board);
    const origPos: number = board.listsPositions[listId];

    // Don't modify board state if rightmost list is being moved right.
    if (dir === "right" && origPos === board.listsTitles.length - 1)
    {
        return resultBoard;
    }
    
    // Don't modify board state if leftmost list is being moved left.
    if (dir === "left" && origPos === 0)
    {
        return resultBoard;
    }

    // Can assume now that a valid movement has been specified.
    switch (dir)
    {
        case "left":
            {
                // Prepare for swap.
                const otherSwappeePosition: number = origPos - 1;
                const otherSwappeeListId: number = board.listsPositions
                                                   .filter(listId =>
                                                    {
                                                        return board.listsPositions[listId] === otherSwappeePosition;
                                                    })[0];

                // Execute swap.
                resultBoard.listsPositions[listId] = otherSwappeePosition;
                resultBoard.listsPositions[otherSwappeeListId] = origPos;
            }
            break;
        case "right":
            {
                // Prepare for swap.
                const otherSwappeePosition: number = origPos + 1;
                const otherSwappeeListId: number = board.listsPositions
                                                   .filter(listId =>
                                                    {
                                                        return board.listsPositions[listId] === otherSwappeePosition;
                                                    })[0];

                // Execute swap.
                resultBoard.listsPositions[listId] = otherSwappeePosition;
                resultBoard.listsPositions[otherSwappeeListId] = origPos;
            }
            break;
    }
    return resultBoard;
}

/*
* Pure function.
* Returns a new board, with one new card at the end of the list with given listId.
* Sets filler values for the card's properties.
* Expects no gaps in card ids in input board.
*/
export function AddCard(board: BoardState, listId: number): BoardState
{
    const resultBoard: BoardState = cloneDeep(board);
    
    const indexForNewCard: number = resultBoard.cardsTitles.length;

    resultBoard.cardsTitles.push(fillerStr);
    resultBoard.cardsNotes.push(fillerStr);
    resultBoard.cardsLabels.push([fillerStr]);
    resultBoard.listsCards[listId].push(indexForNewCard);

    return resultBoard;
}

/*
* Pure function.
* Returns a new board, with one new list in rightmost position.
* New board contains one filler card, with filler values for its properties.
* Expects no gaps in list ids in input board.
*/
export function AddList(board: BoardState): BoardState
{
    const resultBoard: BoardState = cloneDeep(board);

    const newListPos: number = resultBoard.listsPositions.length;
    
    resultBoard.listsTitles.push(fillerStr);
    resultBoard.listsCards.push([]);
    resultBoard.listsPositions.push(newListPos);
    
    return resultBoard;
}

/*
* Pure function.
* Returns a new board, with the card with given cardId removed.
* Expects no gaps in card ids in input board.
* Leaves no gaps in card ids in output board.
*/
export function DeleteCard(board: BoardState, cardId: number): BoardState
{
    const resultBoard: BoardState = cloneDeep(board);

    const cardFound: boolean = IsBetween(cardId, 0, resultBoard.cardsTitles.length - 1);
    if (!cardFound)
    { // Then no card with supplied id exists.
        return resultBoard;
    }

    // Use index of deletee to clean up parallel card data arrays.
    resultBoard.cardsTitles.splice(cardId, 1); 
    resultBoard.cardsNotes.splice(cardId, 1); 
    resultBoard.cardsLabels.splice(cardId, 1); 
    
    // Remove card from its list.  Brute force to find it...
    resultBoard.listsCards.forEach((elt, i) =>
    {
        resultBoard.listsCards[i] = elt.filter((id) => id !== cardId);
    });

    // Decrement required lists' pointers to some cards, as required.
    resultBoard.listsCards.forEach((elt, i) =>
    {
        resultBoard.listsCards[i] = elt.map((id) => id < cardId ? id : id - 1);
    });

    return resultBoard;
}

/*
* Pure function.
* Returns a new board, with the list with given listId removed.
* Cards belonging to that list also get removed from board.
* Responsible for leaving no gaps in list ids.
*/
export function DeleteList(board: BoardState, listId: number): BoardState
{
    var resultBoard: BoardState = cloneDeep(board);

    const listFound: boolean = IsBetween(listId, 0, resultBoard.listsTitles.length - 1);
    if (!listFound)
    { // Then no list with supplied id exists.
        return resultBoard;
    }

    // Find all cards belonging to the list.  Delete each.
    // We iterate backwards to avoid a card deletion
    // interfering with subsequent card deletions.
    var idsOfCardsToDelete: number[] = [...resultBoard.listsCards[listId]];
    idsOfCardsToDelete.sort();
    var i: number = idsOfCardsToDelete.length - 1;
    for (; i > -1; i--)
    {
        const deleteeCardId: number = idsOfCardsToDelete[i];
        resultBoard = DeleteCard(resultBoard, deleteeCardId);
    }
    
    // Now we're ready to get rid of the list itself.
    resultBoard.listsTitles.splice(listId, 1);
    resultBoard.listsCards.splice(listId, 1);

    // Shuffle list positions down too.
    const removedPos = resultBoard.listsPositions[listId];
    resultBoard.listsPositions.splice(listId, 1);
    resultBoard.listsPositions = resultBoard.listsPositions.map((pos) => pos < removedPos ? pos : pos - 1);

    return resultBoard;
}

/*
* Pure function.
* Returns a new board, where the card with supplied cardId is assigned
* the new title newTitle.
*/
export function RenameCard(board: BoardState, cardId: number, newTitle: string)
{
    const boardCopy: BoardState = cloneDeep(board);
    const cardFound: boolean = IsBetween(cardId, 0, boardCopy.cardsTitles.length - 1);
    if (!cardFound)
    {
        return boardCopy;
    }
    boardCopy.cardsTitles[cardId] = newTitle;
    return boardCopy;
}

/*
* Pure function.
* Returns a new board, where the list with supplied listId is assigned
* the new title newTitle.
*/
export function RenameList(board: BoardState, listId: number, newTitle: string)
{
    const boardCopy: BoardState = cloneDeep(board);
    const listFound: boolean = IsBetween(listId, 0, boardCopy.listsTitles.length - 1);
    if (!listFound)
    {
        return boardCopy;
    }
    boardCopy.listsTitles[listId] = newTitle;
    return boardCopy;
}

/*
* Pure function.
* Returns a new board, where the card with supplied cardId is assigned
* the new string array of labels newLabels.
* Can be used for (manually) adding/deleting/renaming a label.
*/
export function ChangeCardLabels(board: BoardState, cardId: number, newLabels: string[])
{
    const boardCopy: BoardState = cloneDeep(board);
    const cardFound: boolean = IsBetween(cardId, 0, boardCopy.cardsTitles.length - 1);
    if (!cardFound)
    {
        return boardCopy;
    }
    boardCopy.cardsLabels[cardId] = newLabels;
    return boardCopy;
}

/*
* Pure function.
* Returns a new board, where the card with supplied cardId is assigned
* the new notes string newNote.
*/
export function ChangeCardNotes(board: BoardState, cardId: number, newNotes: string)
{
    const boardCopy: BoardState = cloneDeep(board);
    const cardFound: boolean = IsBetween(cardId, 0, boardCopy.cardsTitles.length - 1);
    if (!cardFound)
    {
        return boardCopy;
    }
    boardCopy.cardsNotes[cardId] = newNotes;
    return boardCopy;
}

/*
* Helper function to check whether a given number reprensents an integer
* in a given closed interval.
*/
function IsBetween(numToCheck: number, lowerBound: number, upperBound: number): boolean
{
    if (!Number.isInteger(numToCheck))
    {
        return false;
    }
    return (numToCheck >= lowerBound) && (numToCheck <= upperBound);
} 