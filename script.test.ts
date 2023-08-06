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
  test('Invalid movement does no harm', () => 
  {
    var expectedOutput: BoardState = {...SampleBoardState};
    expect(MoveCard(SampleBoardState, 0, "up")).toEqual(expectedOutput);
  });
  test('Move left', () => 
  {
    // Need to use spread operator to get a copy of
    // SampleBoardState, else it's vulnerable to
    // mutation since objects are reference types in JS.
    var expectedOutput: BoardState = {...SampleBoardState};

    // This approach is only valid because
    // SampleBoardState has an ascending
    // sequnce as the value of listPositions...
    expectedOutput.listsCards = 
    [
        [0, 1],
        [2, 3], /* Have decided when a card is moved
                   to a new list, it should be moved
                   to same vert. pos. if possible, else
                   made the final card. */
        [4],
        [5, 6, 7]
    ];
    expect(MoveCard(SampleBoardState, 3, "left")).toEqual(expectedOutput);
  });
});
