/**
 * @jest-environment jsdom
 */
import {describe, expect, test} from '@jest/globals';
const cloneDeep = require('lodash.clonedeep');
import
{
    BoardState,
    SampleBoardState,
    MoveCard,
    MoveList,
    AddCard,
    DeleteCard,
    AddList,
    DeleteList,
    fillerStr
} from './script';

describe('Card movement', () => 
{
  test('Invalid horiz. movement does no harm', () => 
  {
    const expectedOutput: BoardState = SampleBoardState();
    expect(MoveCard(SampleBoardState(), 0, "left")).toEqual(expectedOutput);
    expect(MoveCard(SampleBoardState(), 5, "right")).toEqual(expectedOutput);
  });
  
  test('Invalid vert. movement does no harm', () => 
  {
    const expectedOutput: BoardState = SampleBoardState();
    expect(MoveCard(SampleBoardState(), 0, "up")).toEqual(expectedOutput);
    expect(MoveCard(SampleBoardState(), 1, "down")).toEqual(expectedOutput);
  });
  
  test('Move left', () => 
  {
    const expectedOutput: BoardState = SampleBoardState();

    // This approach is only valid because
    // SampleBoardState has an ascending
    // sequnce as the value of listPositions...
    expectedOutput.listsCards = 
    [
        /*
        * When a card is moved
        * to a new list, it should be moved
        * to same vert. pos. if possible, else
        * made the final card.
        */
        [0, 1],
        [2], 
        [3, 6, 4],
        [5, 7]
    ];
    const actualOutput: BoardState = MoveCard(SampleBoardState(), 6, "left");
    expect(actualOutput).toEqual(expectedOutput);
  });
  
  test('Move right', () => 
  {
    const expectedOutput: BoardState = SampleBoardState();
    expectedOutput.listsCards = 
    [
        [0],
        [2, 1],
        [3, 4],
        [5, 6, 7]
    ];
    const actualOutput: BoardState = MoveCard(SampleBoardState(), 1, "right");
    expect(actualOutput).toEqual(expectedOutput);
  });
  
  test('Move up', () => 
  {
    const expectedOutput: BoardState = SampleBoardState();
    expectedOutput.listsCards = 
    [
        [0, 1],
        [2],
        [3, 4],
        [6, 5, 7]
    ];
    const actualOutput: BoardState = MoveCard(SampleBoardState(), 6, "up");
    expect(actualOutput).toEqual(expectedOutput);
  });
  
  test('Move down', () => 
  {
    const expectedOutput: BoardState = SampleBoardState();
    expectedOutput.listsCards = 
    [
        [0, 1],
        [2],
        [3, 4],
        [5, 7, 6]
    ];
    const actualOutput: BoardState = MoveCard(SampleBoardState(), 6, "down");
    expect(actualOutput).toEqual(expectedOutput);
  });

  test('No mutation', () => 
  {
    const bs: BoardState = SampleBoardState();
    const expectedOutput: BoardState = SampleBoardState();

    // MoveCard should be pure.
    // So we expect this will not affect bs.
    MoveCard(bs, 6, "down");
    MoveCard(bs, 6, "left");
    MoveCard(bs, 6, "left");
    
    expect(bs).toEqual(expectedOutput);
  });
});

describe('List movement', () => 
{
  test('Invalid left list move does no harm', () => 
  {
    const expectedOutput: BoardState = SampleBoardState();
    const actualOutput: BoardState = MoveList(SampleBoardState(), 0, 'left');
    expect(actualOutput).toEqual(expectedOutput);
  });

  test('Invalid right list move does no harm', () => 
  {
    const expectedOutput: BoardState = SampleBoardState();
    const actualOutput: BoardState = MoveList(SampleBoardState(), 3, 'right');
    expect(actualOutput).toEqual(expectedOutput);
  });

  test('Move list left', () => 
  {
    const expectedOutput: BoardState = SampleBoardState();
    expectedOutput.listsPositions = [0 ,1, 3, 2];
    const actualOutput: BoardState = MoveList(SampleBoardState(), 3, 'left');
    expect(actualOutput).toEqual(expectedOutput);
  });
  
  test('Move list right', () => 
  {
    const expectedOutput: BoardState = SampleBoardState();
    expectedOutput.listsPositions = [0 ,1, 3, 2];
    const actualOutput: BoardState = MoveList(SampleBoardState(), 2, 'right');
    expect(actualOutput).toEqual(expectedOutput);
  });
  
  test('No mutation', () => 
  {
    const bs: BoardState = SampleBoardState();
    const expectedOutput: BoardState = SampleBoardState();

    // MoveList should be pure.
    // So we expect this will not affect bs.
    MoveList(bs, 3, "left");
    MoveList(bs, 1, "right");
    
    expect(bs).toEqual(expectedOutput);
  });
});

describe('Card creation/destruction', () => 
{
  test('Adding a card works', () => 
  {
    const listIdToTest: number = 2;
    const nextCardId: number = 9;

    const expectedOutput: BoardState = SampleBoardState();
    expectedOutput.cardsIds.push(nextCardId);
    expectedOutput.cardsTitles.push(fillerStr);
    expectedOutput.cardsNotes.push(fillerStr);
    expectedOutput.cardsLabels.push([fillerStr]);
    expectedOutput.listsCards[listIdToTest].push(nextCardId);

    const actualOutput: BoardState = AddCard(SampleBoardState(), listIdToTest);
    expect(actualOutput).toEqual(expectedOutput);
  });
  
  test('Deleting a card works', () => 
  {
    const targetCardId: number = 3;

    const expectedOutput: BoardState = SampleBoardState();
    expectedOutput.cardsIds = expectedOutput.cardsIds.filter((x) => x !== targetCardId);
    expectedOutput.cardsTitles = ["apple", "orange", "banana", "peach", "apple", "dog", "cat", "bird"];
    expectedOutput.cardsNotes = ["apple tasty", "orange tasty", "banana tasty", "peach hairy", "apple gross", "dog fun", "cat ugly", "bird elegant"];
    
    // filter() uses a shallow copy and here,
    // we're dealing with nested arrays.
    const origLabels: string[][] = cloneDeep(SampleBoardState().cardsLabels);
    expectedOutput.cardsLabels = origLabels.filter((elt, i) => i !== targetCardId);
    
    expectedOutput.listsCards =        
    [
        [0, 1],
        [2],
        [4],
        [5, 6, 7]
    ];

    const actualOutput: BoardState = DeleteCard(SampleBoardState(), targetCardId);
    expect(actualOutput).toEqual(expectedOutput);
  });

  test('Deleting a non-existent card changes nothing', () => 
  {
    // Check id bigger than those existing.
    var nonExistentCardId = Math.max(...SampleBoardState().cardsIds) + 1;
    const actualOutput1: BoardState = DeleteCard(SampleBoardState(), nonExistentCardId);

    // Check id smaller than those existing.
    nonExistentCardId = Math.min(...SampleBoardState().cardsIds) - 1;
    const actualOutput2: BoardState = DeleteCard(SampleBoardState(), nonExistentCardId);

    expect(actualOutput1).toEqual(SampleBoardState());
    expect(actualOutput2).toEqual(SampleBoardState());
  });

  /*
  * We don't expect to a user to ever have so many cards at once
  * that ids overflow.
  * But we do expect many cards to be deleted and added over time.
  * This should be handled gracefully.
  */
  test('Deleting then adding a card re-uses id of deleted', () => 
  {
    const targetListId = 3;
    const targetCardId = 6;

    const expectedOutput = SampleBoardState();
    expectedOutput.cardsTitles[targetCardId] = fillerStr;
    expectedOutput.cardsNotes[targetCardId] = fillerStr;
    expectedOutput.cardsLabels[targetCardId] = [fillerStr];

    const actualOutput = AddCard(DeleteCard(SampleBoardState(), targetCardId), targetListId);

    expect(actualOutput.cardsIds).toEqual(expectedOutput.cardsIds);
    expect(actualOutput.cardsTitles).toEqual(expectedOutput.cardsTitles);
    expect(actualOutput.cardsNotes).toEqual(expectedOutput.cardsNotes);
    expect(actualOutput.cardsLabels).toEqual(expectedOutput.cardsLabels);
    expect(actualOutput.listsIds).toEqual(expectedOutput.listsIds);
    expect(actualOutput.listsTitles).toEqual(expectedOutput.listsTitles);
    expect(actualOutput.listsPositions).toEqual(expectedOutput.listsPositions);

    // Whilst card id should be re-used, this does not imply the same
    // position in the list should not necessarily be re-used.
    const actualOutputListsCardsSet: Set<number> = new Set(...actualOutput.listsCards);
    const expectedOutputListsCardsSet: Set<number> = new Set(...expectedOutput.listsCards);
    expect(actualOutputListsCardsSet).toEqual(expectedOutputListsCardsSet);
  });
  
  test('No mutation from adding/deleting cards', () => 
  {
    const bs: BoardState = SampleBoardState();
    const expectedOutput: BoardState = SampleBoardState();

    // Both these functions should be pure.
    // So we expect this will not affect bs.
    AddCard(bs, 0);
    DeleteCard(bs, 2);
    
    expect(bs).toEqual(expectedOutput);
  });
});

describe('List creation/destruction', () => 
{
  test('Adding a list works', () => 
  {
    // Somewhat trivial test case because everything just 
    // gets appended.  This is contingent on SampleBoardState()
    // returning a sample board with no gaps in lists' ids.
    // Thus we have another separate test for list id re-use.
    const expectedOutput = SampleBoardState();

    // New list should come with a filler card.
    expectedOutput.cardsIds.push(9);
    expectedOutput.cardsTitles.push(fillerStr);
    expectedOutput.cardsNotes.push(fillerStr);
    expectedOutput.cardsLabels.push([fillerStr]);

    expectedOutput.listsIds.push(4);
    expectedOutput.listsTitles.push(fillerStr);
    expectedOutput.listsPositions.push(4);
    
    const actualOutput = AddList(SampleBoardState());
    expect(actualOutput).toEqual(expectedOutput);
  });
 
  /*
  * Note that we don't expect list deletion
  * to fix up gaps in list positions array.
  * This has the effect that clients of list
  * addition and deletion functions will
  * need to be more careful if rendering to DOM.
  */
  test('Deleting a list works', () => 
  {
    const listIdToTest: number = 2;
    const expectedOutput: BoardState = SampleBoardState();
    const deleteeCardsIds: number[] = [...expectedOutput.listsCards[listIdToTest]];
    
    // Set expectation for cards.
    // Value used here are dependent on value of sample board.
    expectedOutput.cardsIds = [0, 1, 2, 5, 6, 7, 8];
    expectedOutput.cardsTitles = ["apple", "orange", "banana", "apple", "dog", "cat", "bird"];
    expectedOutput.cardsNotes = ["apple tasty", "orange tasty", "banana tasty", "apple gross", "dog fun", "cat ugly", "bird elegant"];
    expectedOutput.cardsLabels = expectedOutput.cardsLabels.filter((elt, i) => !(deleteeCardsIds.includes(i)));

    // Set expectation for lists.
    expectedOutput.listsIds = expectedOutput.listsIds.filter((elt) => elt !== listIdToTest);
    expectedOutput.listsTitles = expectedOutput.listsTitles.filter((elt, i) => i !== listIdToTest);
    expectedOutput.listsCards = expectedOutput.listsCards.filter((elt, i) => i !== listIdToTest);
    expectedOutput.listsPositions = expectedOutput.listsPositions.filter((elt, i) => i !== listIdToTest);

    const actualOutput = DeleteList(SampleBoardState(), 2);
    expect(actualOutput).toEqual(expectedOutput);
  });

//  test('Deleting a non-existent list changes nothing', () => 
//  {
//    // TODO
//  });
//
//  /*
//  * We don't expect to a user to ever have so many lists at once
//  * that ids overflow.
//  * But we do expect many lists to be deleted and added over time.
//  * This should be handled gracefully.
//  */
//  test('Deleting then adding a list re-uses id of deleted', () => 
//  {
//    // TODO
//    
//    // Whilst list id should be re-used, this does not imply the same
//    // position on the board should not necessarily be re-used.
//  });
//
//  test('No mutation from adding/deleting lists', () => 
//  {
//    // TODO
//  });
});
