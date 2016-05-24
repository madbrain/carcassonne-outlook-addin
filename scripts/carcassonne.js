
function Cell(x, y, rot, tile) {
	this.x = x;
	this.y = y;
	this.rot = rot;
	this.tile = tile;
	this.follower = null;
}

Cell.prototype.setFollower = function(zone, player) {
	this.follower = { zone: zone, color: player.color };
};

Cell.prototype.hasFollowerIn = function(zone) {
	return this.follower != undefined && this.follower.zone === zone;
};

Cell.prototype.distance = function(x, y) {
	return Math.abs(this.x - x) + Math.abs(this.y - y);
};

Cell.prototype.rotate = function(angle) {
	this.rot = (this.rot + angle + 4) % 4;
};

Cell.prototype.getEdge = function(dir) {
	var index = (dir - this.rot + 4) % 4;
	return TileDescs[this.tile].edges[index];
};

function Board() {
	this.players = [];
	this.cells = [
		new Cell(1, 1, 0, Constants.START_TILE),
	];
}

Board.prototype.load = function(persistedState) {
	var json = JSON.parse(persistedState);
	this.players = json.players;
	this.cells = _.map(json.cells, function(jc) {
		var cell = new Cell(jc.x, jc.y, jc.rot, jc.tile);
		cell.follower = jc.follower;
		return cell;
	});
};

Board.prototype.findRemainingTilesCount = function() {
	var tiles = {};
	_.each(TileDescs, function(tile, i) {
		tiles[i] = { index: i, count: tile.count };
	});

	_.each(this.cells, function(cell) {
		tiles[cell.tile].count -= 1;
	});
	return _.filter(_.values(tiles), function(tile) {
		return tile.count > 0;
	});
};

Board.prototype.findAt = function(x, y) {
	return _.find(this.cells, function(cell) {
		return cell.x === x && cell.y === y;
	});
};

Board.prototype.addNewCell = function(newCell) {
	this.cells.push(newCell);
	var horz = _.map(this.cells, function(cell) { return cell.x; });
	var vert = _.map(this.cells, function(cell) { return cell.y; });
	var minX = _.min(horz);
	var minY = _.min(vert);
	if (minX === 0 || minY === 0) {
		this.translate(minX === 0 ? 1 : 0, minY === 0 ? 1: 0);
	}
	return { width: _.max(horz) + 2, height: _.max(vert) + 2 };
};

Board.prototype.translate = function(dx, dy) {
	_.each(this.cells, function(cell) {
		cell.x += dx;
		cell.y += dy;
	});
};

Board.prototype.testCell = function(cell) {
	var self = this;
	return _.every(Direction.ALL, function(testDir) {
		var other = self.findAt(cell.x + testDir.dx, cell.y + testDir.dy);
		if (other != undefined) {
			var thisCellEdge = cell.getEdge(testDir.toEdgeIndex());
			var otherCellEdge = other.getEdge(testDir.opposite().toEdgeIndex());
			return thisCellEdge[0] === otherCellEdge[0];
		} else {
			return true;
		}
	});
};

Board.prototype.pickNew = function() {
	var self = this;
	var remainings = self.findRemainingTilesCount();
	if (remainings.length > 0) {
		while (true) {
			// XXX abstract random to be tested
			var newTile = remainings[Math.floor(Math.random() * remainings.length)];
			var newCell = null;
			var isOk = _.some(self.cells, function(cell) {
				return _.some(Direction.ALL, function(testDir) {
					var neighbour = self.findAt(
						cell.x + testDir.dx,
						cell.y + testDir.dy);
					return neighbour == undefined
						&& _.some([0, 1, 2, 3], function(angle) {
							newCell = new Cell(
								cell.x + testDir.dx,
								cell.y + testDir.dy,
								angle, newTile.index);
							return self.testCell(newCell);
						});
				});
			});
			if (isOk) {
				return newCell;
			}
		}
	}
	return null;
};

Board.prototype.isValidNewPosition = function(x, y) {
	var isOnExisting = _.some(this.cells, function(cell) {
		return cell.x == x && cell.y == y;
	});
	if (! isOnExisting) {
		var neighbours = _.filter(this.cells, function(cell) {
			return cell.distance(x, y) == 1;
		});
		if (neighbours.length > 0) {
			return true;
		}
	}
	return false;
};

Board.prototype.expandZone = function(cell, zone) {
	var self = this;

	var zoneConnections = [];
	var completed = true;
	var type = null;

	var newZoneConnections = [ { cell: cell, zone: zone } ];

	while (_.size(newZoneConnections) > 0) {
		var connection = newZoneConnections[0];
		zoneConnections.push(connection);
		newZoneConnections = _.tail(newZoneConnections);
		var zoneLabel = connection.zone.toString();

		_.each(Direction.ALL, function(dir) {
			var edge = connection.cell.getEdge(dir.toEdgeIndex());
			var otherZoneIndex = -1;
			if (edge[0] === 'F' && edge[1] === zoneLabel) {
				type = 'F';
				otherZoneIndex = 1;
			} else if (edge[0] === 'T' && edge[1] === zoneLabel) {
				type = 'T';
				otherZoneIndex = 1;
			} else if (edge[0] === 'P' && edge[2] === zoneLabel) {
				type = 'P';
				otherZoneIndex = 2;
			} else if (edge[0] === 'P' && edge[1] === zoneLabel) {
				type = 'F';
				otherZoneIndex = 3;
			} else if (edge[0] === 'P' && edge[3] === zoneLabel) {
				type = 'F';
				otherZoneIndex = 1;
			}
			if (otherZoneIndex >= 0) {
				var other = self.findAt(connection.cell.x + dir.dx,
									connection.cell.y + dir.dy);
				if (other != undefined) {
					var otherCellEdge = other.getEdge(dir.opposite().toEdgeIndex());
					var otherZone = parseInt(otherCellEdge[otherZoneIndex]);
					if (! _.some(zoneConnections, function(x) {
								return x.cell === other; })) {
						newZoneConnections.push({ cell: other, zone: otherZone });
					}
				} else {
					completed = false;
				}
			}
		});
	}
	return new Expansion(zoneConnections, type, completed);
};

Board.prototype.canPlaceFollower = function(player) {
	var cellsWithPlayerFollower = _.filter(this.cells, function(cell) {
		return cell.follower != null && cell.follower.color === player.color;
	});
	return _.size(cellsWithPlayerFollower) < 8;
};

Board.prototype.completeExpansion = function(expansion) {
	var self = this;
	var followers = expansion.findFollowers();
	if (! _.isEmpty(followers)) {
		var winners = [];
		var max = _.max(_.values(followers));
		// XXX parseInt because of bad javascript object map
		var winners = _.map(_.filter(_.keys(followers), function(key) {
			return followers[key] === max; }), function(x) { return parseInt(x); });
		var points = _.size(expansion.elements);
		if (expansion.type === 'T') {
			points += _.size(_.filter(expansion.elements, function(element) {
				return TileDescs[element.cell.tile].pennant;
			}));
			points *= 2;
		}
		_.chain(expansion.elements)
			.filter(function(element) { return element.cell.hasFollowerIn(element.zone); })
			.each(function (element) { element.cell.follower = null; });
		_.chain(this.players)
			.filter(function(player) { return _.contains(winners, player.color); })
			.each(function(player) { player.points += points; });
	}
};

Board.prototype.findSurroundings = function(cell) {
	var surroundings = [];
	for (var y = -1; y <= 1; ++y) {
		for (var x = -1; x <= 1; ++x) {
			if (x != 0 || y != 0) {
				var other = this.findAt(cell.x + x, cell.y + y);
				if (other != undefined) {
					surroundings.push(other);
				}
			}
		}
	}
	return surroundings;
}

Board.prototype.testCompletedFeatures = function(cell) {
	var self = this;
	// test Towns and Pathes
	var tileDesc = TileDescs[cell.tile];
	for (var zone = 0; zone < tileDesc.zones.length; ++zone) {
		if (tileDesc.cloister != zone) {
			var expansion = this.expandZone(cell, zone);
			if (expansion.completed) {
				this.completeExpansion(expansion);
			}
		}
	}
	// test Cloisters
	var surroundingCloistersWithFollower =
			_.filter(this.findSurroundings(cell), function(cell) {
		var cloisterZone = TileDescs[cell.tile].cloister;
		return cloisterZone >= 0
				&& cell.follower != undefined
				&& cell.follower.zone == cloisterZone;
	});
	_.each(surroundingCloistersWithFollower, function(cell) {
		if (_.size(self.findSurroundings(cell)) === 8) {
			var player = _.find(self.players, function(player) {
				return cell.follower.color === player.color;
			});
			player.points += 1 + 8;
			cell.follower = null;
		}
	});
};

function Expansion(elements, type, completed) {
	this.elements = elements;
	this.type = type;
	this.completed = completed;
}

Expansion.prototype.findFollowers = function() {
	// TODO transform map in something more appropriate
	var followers = {};
	_.each(this.elements, function(c) {
		if (c.cell.hasFollowerIn(c.zone)) {
			var count = 0;
			if (followers[c.cell.follower.color] != undefined) {
				count = followers[c.cell.follower.color];
			}
			followers[c.cell.follower.color] = count + 1;
		}
	});
	return followers;
};

