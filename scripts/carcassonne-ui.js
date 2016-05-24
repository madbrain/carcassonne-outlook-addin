
function Drawer(ctx, tilesImage, meeplesImage, width, height) {
	this.ctx = ctx;
	this.tilesImage = tilesImage;
	this.meeplesImage = meeplesImage;
	this.width = width;
	this.height = height;
}

Drawer.prototype.drawCell = function(cell) {
	var desc = TileDescs[cell.tile];
	this.ctx.save();
	this.ctx.translate(cell.x*90 + 45, cell.y*90 + 45);
	this.ctx.rotate(cell.rot * Math.PI / 2);
	this.ctx.drawImage(this.tilesImage,
		desc.x * 90, desc.y * 90, 90, 90,
		-45, -45, 90, 90);
	if (cell.follower != undefined) {
		var descZone = desc.zones[cell.follower.zone];
		this.ctx.drawImage(this.meeplesImage,
			cell.follower.color * 25, 0, 25, 25,
			descZone.x - 45 - 12, descZone.y - 45 - 12, 25, 25);
	}
	this.ctx.restore();
};

Drawer.prototype.highlight = function(cell, isValid) {
	this.ctx.strokeStyle = isValid ? "#0000ff" : "#ff0000";
	this.ctx.lineWidth = 2;
	this.ctx.strokeRect(cell.x*90 + 1, cell.y*90 + 1, 90-2, 90-2);
};

Drawer.prototype.clear = function(x, y) {
	this.ctx.clearRect(x * 90, y * 90, 90, 90);
};

Drawer.prototype.clearAll = function() {
	this.ctx.clearRect(0, 0, this.width, this.height);
};

function GameState(drawer, zoneDetector) {
	this.drawer = drawer;
	this.zoneDetector = zoneDetector;

	this.board = new Board();
	this.newCell = null;

	this.state = new PlaceTileState(this);
}

GameState.prototype.setCurrentPlayer = function(email) {
	this.currentPlayer = _.find(this.board.players, function(player) {
		return player.email === email;
	});
};

GameState.prototype.pickNew = function() {
	this.newCell = this.board.pickNew();
	if (this.newCell != undefined) {
		// reset angle
		this.newCell.rot  = 0;
		this.newCellValid = this.board.testCell(this.newCell);
	} else {
		// TODO compute final points
		alert("game ended");
	}
};

GameState.prototype.updateNewTilePosition = function(x, y) {
	this.drawer.clear(this.newCell.x, this.newCell.y);
	this.newCell.x = x;
	this.newCell.y = y;
	this.updateNewTile();
};

GameState.prototype.updateNewTile = function() {
	this.newCellValid = this.board.testCell(this.newCell);
	$("#action").prop('disabled', !this.newCellValid);
	this.drawNewTile();
};

GameState.prototype.drawAll = function() {
	var self = this;
	this.drawer.clearAll();
	_.each(self.board.cells, function(cell) {
		self.drawer.drawCell(cell);
	});
	this.drawNewTile();
	var playersElement = $("#players");
	playersElement.empty();
	_.each(this.board.players, function(player) {
		playersElement.append("<li>" + player.name + " " + player.points + "</li>")
	});
};

GameState.prototype.drawNewTile = function() {
	if (this.newCell != undefined) {
		this.drawer.drawCell(this.newCell);
		this.drawer.highlight(this.newCell, this.newCellValid);
	}
};

GameState.prototype.rotate = function(angle) {
	this.state.rotate(angle);
};

GameState.prototype.onClick = function(ev) {
	this.state.onClick(ev);
};

GameState.prototype.nextAction = function() {
	this.state = this.state.nextAction();
};

function PlaceTileState(gameState) {
	this.gameState = gameState;
	$("#actionLabel").text('Place Tile');
}

PlaceTileState.prototype.onClick = function(ev) {
	if (this.gameState.board.isValidNewPosition(ev.x, ev.y)) {
		this.gameState.updateNewTilePosition(ev.x, ev.y);
	}
};

PlaceTileState.prototype.rotate = function(angle) {
	this.gameState.newCell.rotate(angle);
	this.gameState.updateNewTile();
};

PlaceTileState.prototype.nextAction = function() {
	if (this.gameState.newCellValid) {
		var size = this.gameState.board.addNewCell(this.gameState.newCell);
		$("#canvas")
			.attr('width', Math.max(size.width * 90, 800) + "px")
			.attr('height', Math.max(size.height * 90, 800) + "px");
		$("#inner")
			.width(Math.max(size.width * 90, 800))
			.height(Math.max(size.height * 90, 800));
		this.gameState.drawAll();
		if (this.gameState.board.canPlaceFollower(this.gameState.currentPlayer)) {
			return new PlaceFollowerState(this.gameState);
		}
		return new NextPlayerState(this.gameState);
	}
	return this;
};

function PlaceFollowerState(gameState) {
	this.gameState = gameState;
	$("#action").prop('disabled', false);
	$("#actionLabel").text('Place Follower');
}

PlaceFollowerState.prototype.onClick = function(ev) {
	var cell = this.gameState.board.findAt(ev.x, ev.y);
	if (cell === this.gameState.newCell) {
		if (cell.follower != undefined) {
			cell.follower = null;
		} else {
			var zone = this.gameState.zoneDetector.detect(cell, ev.dx, ev.dy);
			if (zone === TileDescs[cell.tile].cloister) {
				cell.setFollower(zone, this.gameState.currentPlayer);
			} else {
				var followers = this.gameState.board.expandZone(cell, zone).findFollowers();
				if (_.size(followers) === 0) {
					cell.setFollower(zone, this.gameState.currentPlayer);
				} else {
					// TODO message to explain why it's not possible
				}
			}
		}
		this.gameState.drawAll();
	}
};

PlaceFollowerState.prototype.rotate = function(angle) {
	// nothing
};

PlaceFollowerState.prototype.nextAction = function() {
	return new NextPlayerState(this.gameState);
};

function NextPlayerState(gameState) {
	this.gameState = gameState;
	$("#action").prop('disabled', true);
	$("#actionLabel").text('Next Player');

	var board = this.gameState.board;
	board.testCompletedFeatures(this.gameState.newCell);
	var index = _.indexOf(board.players, this.currentPlayer);
	this.gameState.currentPlayer = board.players[(index + 1)
			% board.players.length];

	//this.gameState.pickNew();
	this.gameState.drawAll();

	var json = JSON.stringify(board);
	this.gameState.onNextPlayer(this.gameState.currentPlayer.email, json);
}

NextPlayerState.prototype.onClick = function(ev) {
};

NextPlayerState.prototype.rotate = function(angle) {
};

NextPlayerState.prototype.nextAction = function() {
	return this;
};

function ZoneDetector() {
	this.ColorToZone = {
		0xFF0000: 0,
		0xFF00FF: 1,
		0x0000FF: 2,
		0x00FFFF: 3,
		0x00FF00: 4,
		0xFFFF00: 5,
		0x7F0000: 6,
		0x666666: 7
	};
}

ZoneDetector.prototype.initialize = function(masksImage) {
	var canvas = document.createElement("canvas");
	canvas.width = 90*6;
	canvas.height = 90*4;
	var ctx = canvas.getContext('2d');
	ctx.drawImage(masksImage, 0, 0);
	this.data = ctx.getImageData(0, 0, 90 * 6, 90 * 4);
};

ZoneDetector.prototype.detect = function(cell, x, y) {
	var tileDesc = TileDescs[cell.tile];
	var p = this.rotate(x, y, cell.rot);
	var offset = ((tileDesc.y * 90 + p.y) * 90 * 6 + tileDesc.x * 90 + p.x) * 4;

	var color = this.data.data[offset + 0]<<16
		| this.data.data[offset + 1]<<8
		| this.data.data[offset + 2];
	return this.ColorToZone[color];
}

ZoneDetector.prototype.rotate = function(x, y, angle) {
	angle = 4 - angle;
	while (angle > 0 ) {
		var t = 90 - y;
		y = x;
		x = t;
		angle -= 1;
	}
	return { x: x, y: y };
};

function initializeUI(baseDir, currentPlayerEmail, state, onNextPlayer) {

	var canvas = $("#canvas");
	var ctx = canvas[0].getContext('2d');
	var tilesImage = new Image();
	var masksImage = new Image();
	var meeplesImage = new Image();

	var drawer = new Drawer(ctx, tilesImage, meeplesImage, canvas[0].width, canvas[0].height);
	var zoneDetector = new ZoneDetector();
	var gameState = new GameState(drawer, zoneDetector);

	gameState.onNextPlayer = onNextPlayer;
	gameState.board.load(state);

	gameState.setCurrentPlayer(currentPlayerEmail);

	gameState.pickNew();

	canvas.click(function(ev) {
		var x = Math.floor(ev.offsetX / 90);
		var y = Math.floor(ev.offsetY / 90);
		var dx = ev.offsetX % 90;
		var dy = ev.offsetY % 90;
		gameState.onClick({x: x, y: y, dx: dx, dy: dy});
	});

	tilesImage.onload = function() {
		gameState.drawAll();
	};
	tilesImage.src = baseDir + "/images/carcassonne-tiles.png";

	masksImage.onload = function() {
		zoneDetector.initialize(masksImage);
	};
	masksImage.src = baseDir + "/images/carcassonne-masks.png";

	//meeplesImage.onload = function() {
	//	zoneDetector.initialize(masksImage);
	//};
	meeplesImage.src = baseDir + "/images/meeples.png";

	$("#left").click(function() {
		gameState.rotate(-1);
	});

	$("#right").click(function() {
		gameState.rotate(1);
	});

	$("#action").click(function() {
		gameState.nextAction();
	});

}
