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
    MoveList
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
    MoveCard(bs, 3, "left");
    MoveCard(bs, 1, "right");
    
    expect(bs).toEqual(expectedOutput);
  });
});
