/**
 * @jest-environment jsdom
 */
import {describe, expect, test} from '@jest/globals';
const cloneDeep = require('lodash.clonedeep');
import BoardState from '../src/model';
import
{
    MoveCard,
    MoveList,
    AddCard,
    DeleteCard,
    AddList,
    DeleteList,
    RenameCard,
    RenameList,
    ChangeCardLabels,
    ChangeCardNotes,
    fillerStr
} from '../src/controller';

/*
* The object is wrapped in a function as a simple
* way of preventing mutation.
*/
function SampleBoardState(): BoardState
{
    const state: BoardState =
    {
        cardsTitles : ["apple", "orange", "banana", "pear", "peach", "apple", "dog", "cat", "bird"],
        cardsNotes : ["apple tasty", "orange tasty", "banana tasty", "pear ugh", "peach hairy", "apple gross", "dog fun", "cat ugly", "bird elegant"],
        cardsLabels :
        [
            ["red", "crunchy"],
            ["orange", "citrus"],
            ["yellow", "brown", "green"],
            ["green", "crunchy"],
            ["soft", "warm coloured"],
            ["green", "crunchy"],
            ["barking animal", "likable"],
            ["non-barking", "unable to fly"],
            ["capable of flight", "non-barking"]
        ],
        listsTitles : ["Left", "L Mid", "R Mid", "Right"],
        listsCards :
        [
            [0, 1],
            [2],
            [3, 4],
            [5, 6, 7]
        ],
        listsPositions : [0, 1, 2, 3]
    };
    return state;
};

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

    /*
    *   __Before__ moving rightmost list left by one position.
    *   [
    *       list id 0 : position 0
    *       list id 1 : position 1
    *       list id 2 : position 2
    *       list id 3 : position 3
    *   ]
    *
    *   __After__ moving rightmost list left by one position.
    *   [
    *       list id 0 : position 0
    *       list id 1 : position 1
    *       list id 2 : position 3
    *       list id 3 : position 2
    *   ]
    */
    expectedOutput.listsPositions = [0 ,1, 3, 2];
    const actualOutput: BoardState = MoveList(SampleBoardState(), 3, 'left');
    expect(actualOutput).toEqual(expectedOutput);
    
    // Case where list positions aren't mapped to by ids
    // equal to themselves.
    const inputBoard2: BoardState = SampleBoardState();
    inputBoard2.listsPositions = [1, 3, 0, 2]
    const actualOutput2: BoardState = MoveList(inputBoard2, 1, 'left');
    
    const expectedOutput2: BoardState = SampleBoardState();
    expectedOutput2.listsPositions = [1, 2, 0, 3];
    expect(actualOutput2).toEqual(expectedOutput2);

    // Case added based on steps to reproduce bug. 
    const inputBoard3: BoardState = SampleBoardState();
    inputBoard3.listsPositions = [1, 0, 2, 3]
    const actualOutput3: BoardState = MoveList(inputBoard3, 0, 'left');
    
    const expectedOutput3: BoardState = SampleBoardState();
    expectedOutput3.listsPositions = [0, 1, 2, 3];
    expect(actualOutput3).toEqual(expectedOutput3);
});
  
  test('Move list right', () => 
  {
    const expectedOutput: BoardState = SampleBoardState();
    expectedOutput.listsPositions = [0 ,1, 3, 2];
    const actualOutput: BoardState = MoveList(SampleBoardState(), 2, 'right');
    expect(actualOutput).toEqual(expectedOutput);
    
    // Case where list positions aren't mapped to by ids
    // equal to themselves.
    const inputBoard: BoardState = SampleBoardState();
    inputBoard.listsPositions = [1, 3, 0, 2]
    const actualOutput2: BoardState = MoveList(inputBoard, 2, 'right');
    
    const expectedOutput2: BoardState = SampleBoardState();
    expectedOutput2.listsPositions = [0, 3, 1, 2];
    expect(actualOutput2).toEqual(expectedOutput2);

    // Case added based on steps to reproduce bug. 
    const inputBoard3: BoardState = SampleBoardState();
    inputBoard3.listsPositions = [1, 0, 2, 3]
    const actualOutput3: BoardState = MoveList(inputBoard3, 1, 'right');
    
    const expectedOutput3: BoardState = SampleBoardState();
    expectedOutput3.listsPositions = [0, 1, 2, 3];
    expect(actualOutput3).toEqual(expectedOutput3);
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
    expectedOutput.cardsTitles = ["apple", "orange", "banana", "peach", "apple", "dog", "cat", "bird"];
    expectedOutput.cardsNotes = ["apple tasty", "orange tasty", "banana tasty", "peach hairy", "apple gross", "dog fun", "cat ugly", "bird elegant"];

    // Remove target label array by filtering instead of having 
    // a huge verbatim value cluttering this test code.
    const origLabels: string[][] = cloneDeep(expectedOutput.cardsLabels);
    expectedOutput.cardsLabels = origLabels.filter((elt, i) => i !== targetCardId);
    
    // Cards ids bigger than the deletee's should each be decremented by 1.
    expectedOutput.listsCards =        
    [
        [0, 1],
        [2],
        [3],
        [4, 5, 6]
    ];

    const actualOutput: BoardState = DeleteCard(SampleBoardState(), targetCardId);
    expect(actualOutput).toEqual(expectedOutput);
  });

  test('Deleting a non-existent card changes nothing', () => 
  {
    // Check id bigger than those existing.
    var nonExistentCardId: number = SampleBoardState().cardsTitles.length;
    const actualOutput1: BoardState = DeleteCard(SampleBoardState(), nonExistentCardId);

    // Check id smaller than those existing.
    nonExistentCardId = -1;
    const actualOutput2: BoardState = DeleteCard(SampleBoardState(), nonExistentCardId);

    expect(actualOutput1).toEqual(SampleBoardState());
    expect(actualOutput2).toEqual(SampleBoardState());
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
    const expectedOutput = SampleBoardState();

    // Contingent on value of sample board state.
    const nextListId: number = 4;
    const nextCardId: number = 9;

    // New list should come with a filler card.
    expectedOutput.cardsTitles.push(fillerStr);
    expectedOutput.cardsNotes.push(fillerStr);
    expectedOutput.cardsLabels.push([fillerStr]);

    expectedOutput.listsTitles.push(fillerStr);
    expectedOutput.listsCards.push([nextCardId]);
    expectedOutput.listsPositions.push(nextListId);
    
    const actualOutput = AddList(SampleBoardState());
    expect(actualOutput).toEqual(expectedOutput);
  });
 
  test('Deleting a list works', () => 
  {
    const listIdToTest: number = 2;
    const expectedOutput: BoardState = SampleBoardState();
    const deleteeCardsIndices: number[] = [...expectedOutput.listsCards[listIdToTest]];
    
    // Set expectation for cards.
    // Value used here are dependent on value of sample board.
    expectedOutput.cardsTitles = ["apple", "orange", "banana", "apple", "dog", "cat", "bird"];
    expectedOutput.cardsNotes = ["apple tasty", "orange tasty", "banana tasty", "apple gross", "dog fun", "cat ugly", "bird elegant"];
    expectedOutput.cardsLabels = expectedOutput.cardsLabels.filter((elt, i) => !(deleteeCardsIndices.includes(i)));

    // Set expectation for lists.
    // Value used here are dependent on value of sample board.
    expectedOutput.listsTitles = ["Left", "L Mid", "Right"];
    expectedOutput.listsCards = 
    [
        [0, 1],
        [2],
        [3, 4, 5]
    ];
    expectedOutput.listsPositions = [0, 1, 2];

    const actualOutput = DeleteList(SampleBoardState(), listIdToTest);
    expect(actualOutput).toEqual(expectedOutput);
  });

  test('Deleting a non-existent list changes nothing', () => 
  {
    // Check id bigger than those existing.
    var nonExistentListId = SampleBoardState().listsTitles.length;
    const actualOutput1: BoardState = DeleteList(SampleBoardState(), nonExistentListId);

    // Check id smaller than those existing.
    nonExistentListId = -1;
    const actualOutput2: BoardState = DeleteCard(SampleBoardState(), nonExistentListId);

    expect(actualOutput1).toEqual(SampleBoardState());
    expect(actualOutput2).toEqual(SampleBoardState());
  });

  test('No mutation from adding/deleting lists', () => 
  {
    const bs: BoardState = SampleBoardState();
    const expectedOutput: BoardState = SampleBoardState();

    // Both these functions should be pure.
    // So we expect this will not affect bs.
    AddList(bs);
    DeleteList(bs, 2);
    
    expect(bs).toEqual(expectedOutput);
  });
});

describe('Rename/change tests', () => 
{
  test('Card renaming', () => 
  {
    const expectedOutput = SampleBoardState();

    // Arbitrary.
    const targetCardId: number = 4;
    const newTitle: string = "My New Card Title";

    expectedOutput.cardsTitles[targetCardId] = newTitle;
    
    const actualOutput = RenameCard(SampleBoardState(), targetCardId, newTitle);
    expect(actualOutput).toEqual(expectedOutput);
  });

  test('List renaming', () => 
  {
    const expectedOutput = SampleBoardState();

    // Arbitrary.
    const targetListId: number = 2;
    const newTitle: string = "My New List Title";

    expectedOutput.listsTitles[targetListId] = newTitle;
    
    const actualOutput = RenameList(SampleBoardState(), targetListId, newTitle);
    expect(actualOutput).toEqual(expectedOutput);
  });

  test('Card label change', () => 
  {
    const expectedOutput = SampleBoardState();

    // Arbitrary.
    const targetCardId: number = 4;
    const newLabels: string[] = ["first new label", "second new label"];

    expectedOutput.cardsLabels[targetCardId] = newLabels;
    
    const actualOutput = ChangeCardLabels(SampleBoardState(), targetCardId, newLabels);
    expect(actualOutput).toEqual(expectedOutput);
  });

  test('Card note change', () => 
  {
    const expectedOutput = SampleBoardState();

    // Arbitrary.
    const targetCardId: number = 4;
    const newNote: string = "hello world, this is a new note";
    
    expectedOutput.cardsNotes[targetCardId] = newNote;
    
    const actualOutput = ChangeCardNotes(SampleBoardState(), targetCardId, newNote);
    expect(actualOutput).toEqual(expectedOutput);
  });
  
  test('No mutation', () => 
  {
    const arbitraryCardId: number = 4;
    const arbitraryListId: number = 2;
    const dummyStr: string = "hello";
    const dummyArr: string[] = [dummyStr, dummyStr];

    var actualOutput: BoardState = SampleBoardState();
    RenameCard(actualOutput, arbitraryCardId, dummyStr);
    RenameList(actualOutput, arbitraryListId, dummyStr);
    ChangeCardLabels(actualOutput, arbitraryCardId, dummyArr);
    ChangeCardNotes(actualOutput, arbitraryCardId, dummyStr);
    
    expect(actualOutput).toEqual(SampleBoardState());
  });
  
  test('Rename/change on invalid card/list', () => 
  {
    const nonExistentCardId: number = 9;
    const nonExistentListId: number = 4;
    const dummyStr: string = "hello";
    const dummyArr: string[] = [dummyStr, dummyStr];

    const actualOutput1: BoardState = RenameCard(SampleBoardState(), nonExistentCardId, dummyStr);
    const actualOutput2: BoardState = RenameList(SampleBoardState(), nonExistentListId, dummyStr);
    const actualOutput3: BoardState = ChangeCardLabels(SampleBoardState(), nonExistentCardId, dummyArr);
    const actualOutput4: BoardState = ChangeCardNotes(SampleBoardState(), nonExistentCardId, dummyStr);
    
    expect(actualOutput1).toEqual(SampleBoardState());
    expect(actualOutput2).toEqual(SampleBoardState());
    expect(actualOutput3).toEqual(SampleBoardState());
    expect(actualOutput4).toEqual(SampleBoardState());
  });
});
