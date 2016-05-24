
function Direction(index, dx, dy) {
	this.index = index;
	this.dx = dx;
	this.dy = dy;
}

Direction.TOP = new Direction(0, 0, -1);
Direction.RIGHT = new Direction(1, 1, 0);
Direction.BOTTOM = new Direction(2, 0, 1);
Direction.LEFT = new Direction(3, -1, 0);

Direction.ALL = [
	Direction.TOP,
	Direction.RIGHT,
	Direction.BOTTOM,
	Direction.LEFT
];

Direction.prototype.toEdgeIndex = function() {
	return this.index;
}

Direction.prototype.opposite = function() {
	if (this === Direction.BOTTOM) { return Direction.TOP; }
	if (this === Direction.LEFT) { return Direction.RIGHT; }
	if (this === Direction.TOP) { return Direction.BOTTOM; }
	return Direction.LEFT;
}

Direction.prototype.toString = function() {
	return [ "TOP", "RIGHT", "BOTTOM", "LEFT" ][this.index];
}

var Player = {
	Color: {
		RED: 0,
		BLUE: 1,
		YELLOW: 2,
		GREEN: 3,
		BLACK: 4,
	},

	create: function(name, email, color) {
		return { name: name, email: email, color: color, points: 0 };
	},
};
