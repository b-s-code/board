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
    const expectedOutput: BoardState = 
    {
        cardsIds : [0, 1, 2, 3, 4, 5, 6, 7, 8],
        cardsTitles : ["apple", "orange", "banana", "pear", "peach", "apple", "dog", "cat", "bird"],
        cardsNotes : ["apple tasty", "orange tasty", "banana tasty", "pear ugh", "peach hairy", "apple gross", "dog fun", "cat ugly", "bird elegant"],
        cardsLabels :
        [
            [
                "red",
                "crunchy"
            ],
            [
                "orange",
                "citrus"
            ],
            [
                "yellow",
                "brown",
                "green"
            ],
            [
                "green",
                "crunchy"
            ],
            [
                "soft",
                "warm coloured"
            ],
            [
                "green",
                "crunchy"
            ],
            [
                "barking animal",
                "likable"
            ],
            [
                "non-barking",
                "unable to fly"
            ],
            [
                "capable of flight",
                "non-barking"
            ]
        ],
        listsIds : [0, 1, 2, 3],
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
    expect(MoveCard(SampleBoardState, 0, "up")).toEqual(expectedOutput);
  });
});
