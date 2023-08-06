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
    expect(MoveCard(SampleBoardState, 0, "up")).toEqual(SampleBoardState);
  });
  test('Move left', () => 
  {
    // Need to use spread operator to get a copy of
    // SampleBoardState, else it's vulnerable to
    // mutation since objects are references in JS.
    var expectedOutput: BoardState = {...SampleBoardState};
    expectedOutput.listsCards = 
    [
        [0, 1],
        [2, 3], /* Have decided when a card is moved
                   to a new list, it should be made
                   the final card. */
        [4],
        [5, 6, 7]
    ];
    expect(MoveCard(SampleBoardState, 3, "left")).toEqual(expectedOutput);
  });
});
