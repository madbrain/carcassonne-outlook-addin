
describe('Board', function() {

var board;

beforeEach(function() {
  board = new Board();  
  board.load('{ "players": ['
    + '{ "name": "John", "email": "john@company.com", "points": 10, "color": 0},'
    + '{ "name": "Martin", "email": "martin@company.com", "points": 15, "color": 1}'
    + '], "cells": ['
    + '{"x": 1, "y": 1, "rot": 0, "tile": 0},'
    + '{"x": 2, "y": 1, "rot": 1, "tile": 1, "follower": {"color": 0, "zone": 1}} ]}');
});

it('should load from json', function() {

  expect(board.players.length).toEqual(2);
  expect(board.players[0].name).toEqual('John');
  expect(board.cells.length).toEqual(2);
  expect(board.cells[1].follower.color).toEqual(Player.Color.RED);
});

it('should find the remaining tile counts', function() {

  var remainings = board.findRemainingTilesCount();

  expect(remainings.slice(0, 6)).toEqual([
    {index: 0, count: TileDescs[0].count - 1},
    {index: 1, count: TileDescs[1].count - 1},
    {index: 2, count: TileDescs[2].count },
    {index: 3, count: TileDescs[3].count },
    {index: 4, count: TileDescs[4].count },
    {index: 5, count: TileDescs[5].count },
  ]);

});

it('should find cell at position', function() {
  var cell = board.findAt(1, 1);
  expect(cell.rot).toEqual(0);
  expect(cell.tile).toEqual(0);
  expect(cell.follower).toBeUndefined();
});

it('should add a new cell', function() {
  board.addNewCell(new Cell(3, 1, 0, 10));
  expect(board.cells.length).toBe(3);
  
  var newCell = board.findAt(3, 1);
  expect(newCell.tile).toEqual(10);
});

it('should translate all cells', function() {
  board.translate(1, 1);
  
  var newCell = board.findAt(3, 2);
  expect(newCell.tile).toEqual(1);
});

it('should test correct cell', function() {
  var result = board.testCell(new Cell(3, 1, 0, 2));
  expect(result).toBeTruthy();
});

it('should test correct cell', function() {
  var result = board.testCell(new Cell(3, 1, 1, 2));
  expect(result).toBeFalsy();
});

});

