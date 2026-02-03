'use strict';

class Game {
  constructor(initialState = null) {
    this.size = 4;

    this.initialState = initialState
      ? this.cloneBoard(initialState)
      : this.createEmptyBoard();

    this.restart();
  }

  /* =======================
     Required public API
  ======================= */

  moveLeft() {
    return this.makeMove(board => board.map(row => this.mergeRow(row)));
  }

  moveRight() {
    return this.makeMove(board =>
      board.map(row => this.mergeRow([...row].reverse()).reverse())
    );
  }

  moveUp() {
    return this.makeMove(board => {
      const rotated = this.rotateLeft(board);
      const moved = rotated.map(row => this.mergeRow(row));
      return this.rotateRight(moved);
    });
  }

  moveDown() {
    return this.makeMove(board => {
      const rotated = this.rotateLeft(board);
      const moved = rotated.map(row =>
        this.mergeRow([...row].reverse()).reverse()
      );
      return this.rotateRight(moved);
    });
  }

  getScore() {
    return this.score;
  }

  getState() {
    return this.cloneBoard(this.board);
  }

  getStatus() {
    return this.status;
  }

  start() {
    if (this.status !== 'idle') return;

    this.status = 'playing';
    this.spawnTile();
    this.spawnTile();
  }

  restart() {
    this.board = this.cloneBoard(this.initialState);
    this.score = 0;
    this.status = 'idle';
  }

  /* =======================
     Game engine internals
  ======================= */

  makeMove(transformFn) {
    if (this.status !== 'playing') return false;

    const newBoard = transformFn(this.cloneBoard(this.board));

    if (!this.boardsEqual(this.board, newBoard)) {
      this.board = newBoard;
      this.spawnTile();
      this.updateStatus();
      return true;
    }

    return false;
  }

  mergeRow(row) {
    const filtered = row.filter(v => v !== 0);
    const result = [];

    for (let i = 0; i < filtered.length; i++) {
      if (filtered[i] === filtered[i + 1]) {
        const merged = filtered[i] * 2;
        result.push(merged);
        this.score += merged;
        i++;
      } else {
        result.push(filtered[i]);
      }
    }

    while (result.length < this.size) {
      result.push(0);
    }

    return result;
  }

  /* =======================
     Board utilities
  ======================= */

  createEmptyBoard() {
    return Array.from({ length: this.size }, () =>
      Array(this.size).fill(0)
    );
  }

  cloneBoard(board) {
    return board.map(row => [...row]);
  }

  boardsEqual(a, b) {
    return a.every((row, i) =>
      row.every((cell, j) => cell === b[i][j])
    );
  }

  rotateLeft(board) {
    return board[0].map((_, i) =>
      board.map(row => row[i]).reverse()
    );
  }

  rotateRight(board) {
    return board[0].map((_, i) =>
      board.map(row => row[row.length - 1 - i])
    );
  }

  /* =======================
     Game state checks
  ======================= */

  spawnTile() {
    const empty = [];

    this.board.forEach((row, i) => {
      row.forEach((cell, j) => {
        if (cell === 0) empty.push([i, j]);
      });
    });

    if (!empty.length) return;

    const [x, y] = empty[Math.floor(Math.random() * empty.length)];
    this.board[x][y] = Math.random() < 0.9 ? 2 : 4;
  }

  updateStatus() {
    if (this.board.flat().includes(2048)) {
      this.status = 'win';
      return;
    }

    if (!this.hasMoves()) {
      this.status = 'lose';
    }
  }

  hasMoves() {
    for (let i = 0; i < this.size; i++) {
      for (let j = 0; j < this.size; j++) {
        if (this.board[i][j] === 0) return true;
        if (j < 3 && this.board[i][j] === this.board[i][j + 1]) return true;
        if (i < 3 && this.board[i][j] === this.board[i + 1][j]) return true;
      }
    }
    return false;
  }
}

module.exports = Game;
