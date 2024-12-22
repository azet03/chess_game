class ChessGame {
    constructor() {
        this.canvas = document.getElementById('chessboard');
        this.ctx = this.canvas.getContext('2d');
        this.squareSize = this.canvas.width / 8;
        this.selectedPiece = null;
        this.validMoves = [];
        this.currentTurn = 'white';
        this.board = this.createInitialBoard();
        
        this.canvas.addEventListener('click', (e) => this.handleClick(e));
        this.drawBoard();
        this.drawPieces();
    }

    createInitialBoard() {
        const board = Array(8).fill().map(() => Array(8).fill(null));
        
        // Set up pawns
        for (let col = 0; col < 8; col++) {
            board[1][col] = { type: 'pawn', color: 'black' };
            board[6][col] = { type: 'pawn', color: 'white' };
        }

        // Set up other pieces
        const pieceOrder = ['rook', 'knight', 'bishop', 'queen', 'king', 'bishop', 'knight', 'rook'];
        for (let col = 0; col < 8; col++) {
            board[0][col] = { type: pieceOrder[col], color: 'black' };
            board[7][col] = { type: pieceOrder[col], color: 'white' };
        }

        return board;
    }

    drawBoard() {
        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                const color = (row + col) % 2 === 0 ? '#ffffff' : '#808080';
                this.ctx.fillStyle = color;
                this.ctx.fillRect(col * this.squareSize, row * this.squareSize, 
                                this.squareSize, this.squareSize);
            }
        }
    }

    drawPieces() {
        const symbols = {
            'white': {
                'king': '♔', 'queen': '♕', 'rook': '♖',
                'bishop': '♗', 'knight': '♘', 'pawn': '♙'
            },
            'black': {
                'king': '♚', 'queen': '♛', 'rook': '♜',
                'bishop': '♝', 'knight': '♞', 'pawn': '♟'
            }
        };

        this.ctx.font = `${this.squareSize * 0.8}px Arial`;
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';

        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                const piece = this.board[row][col];
                if (piece) {
                    this.ctx.fillStyle = piece.color === 'white' ? '#DAA520' : '#000000';
                    const symbol = symbols[piece.color][piece.type];
                    this.ctx.fillText(symbol, 
                        (col + 0.5) * this.squareSize, 
                        (row + 0.5) * this.squareSize);
                }
            }
        }
    }

    handleClick(event) {
        const rect = this.canvas.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        
        const col = Math.floor(x / this.squareSize);
        const row = Math.floor(y / this.squareSize);

        if (this.selectedPiece) {
            // Move the piece
            const [selectedRow, selectedCol] = this.selectedPiece;
            if (this.isValidMove(selectedRow, selectedCol, row, col)) {
                this.movePiece(selectedRow, selectedCol, row, col);
                this.selectedPiece = null;
                this.validMoves = [];
                this.currentTurn = this.currentTurn === 'white' ? 'black' : 'white';
                document.getElementById('turn-display').textContent = `Current Turn: ${this.currentTurn.charAt(0).toUpperCase() + this.currentTurn.slice(1)}`;
            }
        } else {
            // Select the piece
            const piece = this.board[row][col];
            if (piece && piece.color === this.currentTurn) {
                this.selectedPiece = [row, col];
                this.validMoves = this.getValidMoves(row, col);
            }
        }

        this.drawBoard();
        this.drawValidMoves();
        this.drawPieces();
    }

    isValidMove(fromRow, fromCol, toRow, toCol) {
        return this.validMoves.some(move => move[0] === toRow && move[1] === toCol);
    }

    getValidMoves(row, col) {
        const piece = this.board[row][col];
        const moves = [];

        if (!piece) return moves;

        switch (piece.type) {
            case 'pawn':
                const direction = piece.color === 'white' ? -1 : 1;
                // Forward move
                if (row + direction >= 0 && row + direction < 8 && !this.board[row + direction][col]) {
                    moves.push([row + direction, col]);
                    // Initial two-square move
                    if ((piece.color === 'white' && row === 6) || (piece.color === 'black' && row === 1)) {
                        if (!this.board[row + 2 * direction][col]) {
                            moves.push([row + 2 * direction, col]);
                        }
                    }
                }
                // Captures
                for (const dcol of [-1, 1]) {
                    if (col + dcol >= 0 && col + dcol < 8 && row + direction >= 0 && row + direction < 8) {
                        const target = this.board[row + direction][col + dcol];
                        if (target && target.color !== piece.color) {
                            moves.push([row + direction, col + dcol]);
                        }
                    }
                }
                break;

            case 'rook':
                // Horizontal and vertical moves
                const rookDirections = [[0, 1], [0, -1], [1, 0], [-1, 0]];
                for (const [drow, dcol] of rookDirections) {
                    let newRow = row + drow;
                    let newCol = col + dcol;
                    while (newRow >= 0 && newRow < 8 && newCol >= 0 && newCol < 8) {
                        const target = this.board[newRow][newCol];
                        if (!target) {
                            moves.push([newRow, newCol]);
                        } else {
                            if (target.color !== piece.color) {
                                moves.push([newRow, newCol]);
                            }
                            break;
                        }
                        newRow += drow;
                        newCol += dcol;
                    }
                }
                break;

            case 'knight':
                // L-shaped moves
                const knightMoves = [
                    [-2, -1], [-2, 1], [-1, -2], [-1, 2],
                    [1, -2], [1, 2], [2, -1], [2, 1]
                ];
                for (const [drow, dcol] of knightMoves) {
                    const newRow = row + drow;
                    const newCol = col + dcol;
                    if (newRow >= 0 && newRow < 8 && newCol >= 0 && newCol < 8) {
                        const target = this.board[newRow][newCol];
                        if (!target || target.color !== piece.color) {
                            moves.push([newRow, newCol]);
                        }
                    }
                }
                break;

            case 'bishop':
                // Diagonal moves
                const bishopDirections = [[1, 1], [1, -1], [-1, 1], [-1, -1]];
                for (const [drow, dcol] of bishopDirections) {
                    let newRow = row + drow;
                    let newCol = col + dcol;
                    while (newRow >= 0 && newRow < 8 && newCol >= 0 && newCol < 8) {
                        const target = this.board[newRow][newCol];
                        if (!target) {
                            moves.push([newRow, newCol]);
                        } else {
                            if (target.color !== piece.color) {
                                moves.push([newRow, newCol]);
                            }
                            break;
                        }
                        newRow += drow;
                        newCol += dcol;
                    }
                }
                break;

            case 'queen':
                // Combination of rook and bishop moves
                const queenDirections = [
                    [0, 1], [0, -1], [1, 0], [-1, 0],
                    [1, 1], [1, -1], [-1, 1], [-1, -1]
                ];
                for (const [drow, dcol] of queenDirections) {
                    let newRow = row + drow;
                    let newCol = col + dcol;
                    while (newRow >= 0 && newRow < 8 && newCol >= 0 && newCol < 8) {
                        const target = this.board[newRow][newCol];
                        if (!target) {
                            moves.push([newRow, newCol]);
                        } else {
                            if (target.color !== piece.color) {
                                moves.push([newRow, newCol]);
                            }
                            break;
                        }
                        newRow += drow;
                        newCol += dcol;
                    }
                }
                break;

            case 'king':
                // One square in any direction
                const kingDirections = [
                    [0, 1], [0, -1], [1, 0], [-1, 0],
                    [1, 1], [1, -1], [-1, 1], [-1, -1]
                ];
                for (const [drow, dcol] of kingDirections) {
                    const newRow = row + drow;
                    const newCol = col + dcol;
                    if (newRow >= 0 && newRow < 8 && newCol >= 0 && newCol < 8) {
                        const target = this.board[newRow][newCol];
                        if (!target || target.color !== piece.color) {
                            moves.push([newRow, newCol]);
                        }
                    }
                }
                break;
        }

        return moves;
    }

    drawValidMoves() {
        this.ctx.fillStyle = 'rgba(0, 255, 0, 0.3)';
        for (const [row, col] of this.validMoves) {
            this.ctx.beginPath();
            this.ctx.arc(
                (col + 0.5) * this.squareSize,
                (row + 0.5) * this.squareSize,
                this.squareSize * 0.3,
                0,
                2 * Math.PI
            );
            this.ctx.fill();
        }
    }

    movePiece(fromRow, fromCol, toRow, toCol) {
        this.board[toRow][toCol] = this.board[fromRow][fromCol];
        this.board[fromRow][fromCol] = null;
    }
}

// Initialize the game when the page loads
window.onload = () => {
    new ChessGame();
};
