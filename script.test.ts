/**
 * @jest-environment jsdom
 */
import {describe, expect, test} from '@jest/globals';
import
{
    BoardState,
    SampleBoardState,
    MoveCard 
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
    // Need to deep copy
    // SampleBoardState(), else it's vulnerable to
    // mutation since objects are reference types in JS.
    var expectedOutput: BoardState = SampleBoardState();

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
    var expectedOutput: BoardState = SampleBoardState();

    // This approach is only valid because
    // SampleBoardState has an ascending
    // sequnce as the value of listPositions...
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
    var expectedOutput: BoardState = SampleBoardState();
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
    var expectedOutput: BoardState = SampleBoardState();
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
});
