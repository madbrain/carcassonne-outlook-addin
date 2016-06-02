
describe('Board', function() {

var board;

beforeEach(function() {
  board = new Board();  
  board.load('{ "players": ['
    + '{ "name": "John", "email": "john@company.com", "points": 10, "color": 0},'
    + '{ "name": "Martin", "email": "martin@company.com", "points": 15, "color": 1}'
    + '], "cells": ['
    + '{"x": 1, "y": 1, "rot": 0, "tile": 0},'
    + '{"x": 2, "y": 1, "rot": 3, "tile": 1, "follower": {"color": 0, "zone": 1}} ]}');
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

it('should test correct cell position', function() {
  var result = board.testCell(new Cell(3, 1, 1, 2));
  expect(result).toBeTruthy();
});

it('should test bad cell position', function() {
  var result = board.testCell(new Cell(3, 1, 0, 2));
  expect(result).toBeFalsy();
});

it('should test bad cell position up', function() {
  var result = board.testCell(new Cell(2, 0, 0, 2));
  expect(result).toBeFalsy();
});

it('should test if on tile is not a valid position', function() {
  var result = board.isValidNewPosition(1, 1);
  expect(result).toBeFalsy();
});

it('should test if not touching is not a valid position', function() {
  var result = board.isValidNewPosition(0, 0);
  expect(result).toBeFalsy();
});

it('should test if touching is a valid position', function() {
  var result = board.isValidNewPosition(0, 1);
  expect(result).toBeTruthy();
});

it('should test if can place follower', function() {
  var result = board.canPlaceFollower(board.players[0]);
  expect(result).toBeTruthy();
});

it('should test if cannot place more than height followers', function() {
  board = new Board();  
  board.load('{ "players": ['
    + '{ "name": "John", "email": "john@company.com", "points": 10, "color": 0},'
    + '{ "name": "Martin", "email": "martin@company.com", "points": 15, "color": 1}'
    + '], "cells": ['
    + '{"x": 1, "y": 1, "rot": 0, "tile": 0, "follower": {"color": 0, "zone": 0}},'
    + '{"x": 2, "y": 1, "rot": 0, "tile": 0, "follower": {"color": 0, "zone": 0}},'
    + '{"x": 3, "y": 1, "rot": 0, "tile": 0, "follower": {"color": 0, "zone": 0}},'
    + '{"x": 4, "y": 1, "rot": 0, "tile": 0, "follower": {"color": 0, "zone": 0}},'
    + '{"x": 5, "y": 1, "rot": 0, "tile": 0, "follower": {"color": 0, "zone": 0}},'
    + '{"x": 6, "y": 1, "rot": 0, "tile": 0, "follower": {"color": 0, "zone": 0}},'
    + '{"x": 7, "y": 1, "rot": 0, "tile": 0, "follower": {"color": 0, "zone": 0}},'
    + '{"x": 8, "y": 1, "rot": 3, "tile": 1, "follower": {"color": 0, "zone": 1}} ]}');
  var result = board.canPlaceFollower(board.players[0]);
  expect(result).toBeFalsy();
});

it('should expand town zone', function() {
  board = new Board();  
  board.load('{ "players": ['
    + '{ "name": "John", "email": "john@company.com", "points": 10, "color": 0},'
    + '{ "name": "Martin", "email": "martin@company.com", "points": 15, "color": 1}'
    + '], "cells": ['
    + '{"x": 1, "y": 1, "rot": 0, "tile": 2},'
    + '{"x": 2, "y": 1, "rot": 1, "tile": 2},'
    + '{"x": 0, "y": 1, "rot": 0, "tile": 7} ]}');
  var result = board.expandZone(board.findAt(1, 1), 0);
  expect(result.elements).toEqual([
		{ cell: board.findAt(1, 1), zone: 0 },
		{ cell: board.findAt(0, 1), zone: 0 } ]);
  expect(result.type).toEqual('T');
  expect(result.completed).toBeFalsy();
});

it('should expand completed path zone', function() {
  board = new Board();  
  board.load('{ "players": ['
    + '{ "name": "John", "email": "john@company.com", "points": 10, "color": 0},'
    + '{ "name": "Martin", "email": "martin@company.com", "points": 15, "color": 1}'
    + '], "cells": ['
    + '{"x": 0, "y": 1, "rot": 3, "tile": 0},'
    + '{"x": 1, "y": 1, "rot": 3, "tile": 1},'
    + '{"x": 2, "y": 1, "rot": 0, "tile": 14} ]}');
  var result = board.expandZone(board.findAt(1, 1), 2);
  expect(result.elements).toEqual([
		{ cell: board.findAt(1, 1), zone: 2 },
		{ cell: board.findAt(2, 1), zone: 2 } ]);
  expect(result.type).toEqual('P');
  expect(result.completed).toBeTruthy();
});

it('should expand field zone', function() {
  board = new Board();  
  board.load('{ "players": ['
    + '{ "name": "John", "email": "john@company.com", "points": 10, "color": 0},'
    + '{ "name": "Martin", "email": "martin@company.com", "points": 15, "color": 1}'
    + '], "cells": ['
    + '{"x": 1, "y": 1, "rot": 0, "tile": 2},'
    + '{"x": 1, "y": 2, "rot": 0, "tile": 6},'
    + '{"x": 0, "y": 2, "rot": 0, "tile": 0},'
    + '{"x": 2, "y": 2, "rot": 3, "tile": 15} ]}');
  var result = board.expandZone(board.findAt(1, 1), 1);
  expect(result.elements).toEqual([
		{ cell: board.findAt(1, 1), zone: 1 },
		{ cell: board.findAt(1, 2), zone: 0 },
		{ cell: board.findAt(0, 2), zone: 0 } ]);
  expect(result.type).toEqual('F');
  expect(result.completed).toBeFalsy();
});

it('should complete town zone', function() {
  board = new Board();  
  board.load('{ "players": ['
    + '{ "name": "John", "email": "john@company.com", "points": 10, "color": 0},'
    + '{ "name": "Martin", "email": "martin@company.com", "points": 15, "color": 1}'
    + '], "cells": ['
    + '{"x": 1, "y": 1, "rot": 0, "tile": 2},'
    + '{"x": 0, "y": 1, "rot": 1, "tile": 15, "follower": {"color": 0, "zone": 1}},'
    + '{"x": 1, "y": 0, "rot": 2, "tile": 15, "follower": {"color": 1, "zone": 1}} ]}');
  var expansion = board.expandZone(board.findAt(1, 1), 0);

  expect(expansion.elements).toEqual([
		{ cell: board.findAt(1, 1), zone: 0 },
		{ cell: board.findAt(1, 0), zone: 1 },
		{ cell: board.findAt(0, 1), zone: 1 } ]);
  expect(expansion.type).toEqual('T');
  expect(expansion.completed).toBeTruthy();

  board.completeExpansion(expansion);
  expect(board.players[0].points).toEqual(16);
  expect(board.players[1].points).toEqual(21);
});

it('should complete path zone', function() {
  board = new Board();  
  board.load('{ "players": ['
    + '{ "name": "John", "email": "john@company.com", "points": 10, "color": 0},'
    + '{ "name": "Martin", "email": "martin@company.com", "points": 15, "color": 1}'
    + '], "cells": ['
    + '{"x": 0, "y": 1, "rot": 3, "tile": 0},'
    + '{"x": 1, "y": 1, "rot": 3, "tile": 1, "follower": {"color": 0, "zone": 2}},'
    + '{"x": 2, "y": 1, "rot": 0, "tile": 14} ]}');
  var expansion = board.expandZone(board.findAt(1, 1), 2);
  expect(expansion.elements).toEqual([
		{ cell: board.findAt(1, 1), zone: 2 },
		{ cell: board.findAt(2, 1), zone: 2 } ]);
  expect(expansion.type).toEqual('P');
  expect(expansion.completed).toBeTruthy();

  board.completeExpansion(expansion);
  expect(board.players[0].points).toEqual(12);
  expect(board.players[1].points).toEqual(15);
});

it('should find surroundings', function() {
  board = new Board();  
  board.load('{ "players": ['
    + '{ "name": "John", "email": "john@company.com", "points": 10, "color": 0},'
    + '{ "name": "Martin", "email": "martin@company.com", "points": 15, "color": 1}'
    + '], "cells": ['
    + '{"x": 0, "y": 1, "rot": 0, "tile": 0},'
    + '{"x": 1, "y": 1, "rot": 0, "tile": 1},'
    + '{"x": 2, "y": 1, "rot": 0, "tile": 2},'
    + '{"x": 2, "y": 2, "rot": 0, "tile": 3},'
    + '{"x": 3, "y": 1, "rot": 0, "tile": 14} ]}');
  var result = board.findSurroundings(board.findAt(1, 1));
  expect(result.length).toEqual(3);
  expect(result).toContain(board.findAt(0, 1));
  expect(result).toContain(board.findAt(2, 1));
  expect(result).toContain(board.findAt(2, 2));
});

it('should complete cloister and town', function() {
  board = new Board();  
  board.load('{ "players": ['
    + '{ "name": "John", "email": "john@company.com", "points": 10, "color": 0},'
    + '{ "name": "Martin", "email": "martin@company.com", "points": 15, "color": 1}'
    + '], "cells": ['
    + '{"x": 0, "y": 0, "rot": 0, "tile": 1},'
    + '{"x": 1, "y": 0, "rot": 0, "tile": 0},'
    + '{"x": 2, "y": 0, "rot": 0, "tile": 0},'
    + '{"x": 0, "y": 1, "rot": 0, "tile": 6},'
    + '{"x": 1, "y": 1, "rot": 0, "tile": 0, "follower": {"color": 0, "zone": 1}},'
    + '{"x": 2, "y": 1, "rot": 2, "tile": 16,"follower": {"color": 1, "zone": 2}},'
    + '{"x": 0, "y": 2, "rot": 0, "tile": 18},'
    + '{"x": 1, "y": 2, "rot": 0, "tile": 12},'
    + '{"x": 2, "y": 2, "rot": 0, "tile": 15} ]}');
  board.testCompletedFeatures(board.findAt(2, 1));
  expect(board.players[0].points).toEqual(19);
  expect(board.findAt(1, 1).follower).toEqual(null);
  expect(board.players[1].points).toEqual(19);
  expect(board.findAt(2, 1).follower).toEqual(null);
});

it('should pick playable new tile', function() {
  var result = board.pickNew();
  var resultCount = _.find(board.findRemainingTilesCount(), function(r) {
		return r.index === result.tile; });
  expect(resultCount.count).toBeGreaterThan(0);
});

});

