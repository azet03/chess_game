import pygame
import sys
from pygame.locals import *

# Initialize Pygame
pygame.init()

# Constants
WINDOW_SIZE = 800
BOARD_SIZE = 8
SQUARE_SIZE = WINDOW_SIZE // BOARD_SIZE
WHITE = (255, 255, 255)
BLACK = (128, 128, 128)
HIGHLIGHT = (0, 255, 0, 50)
PIECE_WHITE = (218, 165, 32)  # Golden color for white pieces
PIECE_BLACK = (0, 0, 0)      # Black color for black pieces

# Set up the display
screen = pygame.display.set_mode((WINDOW_SIZE, WINDOW_SIZE))
pygame.display.set_caption('Chess Game')

class Piece:
    def __init__(self, color, piece_type, position):
        self.color = color
        self.piece_type = piece_type
        self.position = position
        self.has_moved = False
        self.image = None
        self.load_image()

    def load_image(self):
        self.image = pygame.Surface((SQUARE_SIZE, SQUARE_SIZE), pygame.SRCALPHA)
        color = PIECE_WHITE if self.color == 'white' else PIECE_BLACK
        
        # Unicode chess symbols
        symbols = {
            'king': '♔' if self.color == 'white' else '♚',
            'queen': '♕' if self.color == 'white' else '♛',
            'rook': '♖' if self.color == 'white' else '♜',
            'bishop': '♗' if self.color == 'white' else '♝',
            'knight': '♘' if self.color == 'white' else '♞',
            'pawn': '♙' if self.color == 'white' else '♟'
        }
        
        # Create font
        font_size = int(SQUARE_SIZE * 0.8)
        font = pygame.font.SysFont('segoe ui symbol', font_size)
        
        # Render the chess piece
        text = font.render(symbols[self.piece_type], True, color)
        text_rect = text.get_rect(center=(SQUARE_SIZE/2, SQUARE_SIZE/2))
        self.image.blit(text, text_rect)

    def get_valid_moves(self, board):
        moves = []
        row, col = self.position

        if self.piece_type == 'pawn':
            direction = -1 if self.color == 'white' else 1
            # Forward move
            if 0 <= row + direction < 8:
                if not board[row + direction][col]:
                    moves.append((row + direction, col))
                    # Initial two-square move
                    if not self.has_moved and 0 <= row + 2*direction < 8:
                        if not board[row + 2*direction][col]:
                            moves.append((row + 2*direction, col))
            
            # Captures
            for dcol in [-1, 1]:
                new_col = col + dcol
                if 0 <= row + direction < 8 and 0 <= new_col < 8:
                    if board[row + direction][new_col]:
                        if board[row + direction][new_col].color != self.color:
                            moves.append((row + direction, new_col))

        elif self.piece_type == 'rook':
            directions = [(0, 1), (0, -1), (1, 0), (-1, 0)]
            for drow, dcol in directions:
                for i in range(1, 8):
                    new_row, new_col = row + drow * i, col + dcol * i
                    if not (0 <= new_row < 8 and 0 <= new_col < 8):
                        break
                    if board[new_row][new_col]:
                        if board[new_row][new_col].color != self.color:
                            moves.append((new_row, new_col))
                        break
                    moves.append((new_row, new_col))

        elif self.piece_type == 'knight':
            knight_moves = [
                (-2, -1), (-2, 1), (-1, -2), (-1, 2),
                (1, -2), (1, 2), (2, -1), (2, 1)
            ]
            for drow, dcol in knight_moves:
                new_row, new_col = row + drow, col + dcol
                if 0 <= new_row < 8 and 0 <= new_col < 8:
                    if not board[new_row][new_col] or board[new_row][new_col].color != self.color:
                        moves.append((new_row, new_col))

        elif self.piece_type == 'bishop':
            directions = [(1, 1), (1, -1), (-1, 1), (-1, -1)]
            for drow, dcol in directions:
                for i in range(1, 8):
                    new_row, new_col = row + drow * i, col + dcol * i
                    if not (0 <= new_row < 8 and 0 <= new_col < 8):
                        break
                    if board[new_row][new_col]:
                        if board[new_row][new_col].color != self.color:
                            moves.append((new_row, new_col))
                        break
                    moves.append((new_row, new_col))

        elif self.piece_type == 'queen':
            directions = [
                (0, 1), (0, -1), (1, 0), (-1, 0),
                (1, 1), (1, -1), (-1, 1), (-1, -1)
            ]
            for drow, dcol in directions:
                for i in range(1, 8):
                    new_row, new_col = row + drow * i, col + dcol * i
                    if not (0 <= new_row < 8 and 0 <= new_col < 8):
                        break
                    if board[new_row][new_col]:
                        if board[new_row][new_col].color != self.color:
                            moves.append((new_row, new_col))
                        break
                    moves.append((new_row, new_col))

        elif self.piece_type == 'king':
            directions = [
                (0, 1), (0, -1), (1, 0), (-1, 0),
                (1, 1), (1, -1), (-1, 1), (-1, -1)
            ]
            for drow, dcol in directions:
                new_row, new_col = row + drow, col + dcol
                if 0 <= new_row < 8 and 0 <= new_col < 8:
                    if not board[new_row][new_col] or board[new_row][new_col].color != self.color:
                        moves.append((new_row, new_col))

        return moves

class ChessGame:
    def __init__(self):
        self.board = [[None for _ in range(BOARD_SIZE)] for _ in range(BOARD_SIZE)]
        self.selected_piece = None
        self.valid_moves = []
        self.current_turn = 'white'
        self.setup_board()

    def setup_board(self):
        # Set up pawns
        for col in range(BOARD_SIZE):
            self.board[1][col] = Piece('black', 'pawn', (1, col))
            self.board[6][col] = Piece('white', 'pawn', (6, col))

        # Set up other pieces
        piece_order = ['rook', 'knight', 'bishop', 'queen', 'king', 'bishop', 'knight', 'rook']
        for col in range(BOARD_SIZE):
            self.board[0][col] = Piece('black', piece_order[col], (0, col))
            self.board[7][col] = Piece('white', piece_order[col], (7, col))

    def handle_click(self, pos):
        col = pos[0] // SQUARE_SIZE
        row = pos[1] // SQUARE_SIZE
        
        if self.selected_piece:
            if (row, col) in self.valid_moves:
                # Move the piece
                old_row, old_col = self.selected_piece.position
                self.board[row][col] = self.selected_piece
                self.board[old_row][old_col] = None
                self.selected_piece.position = (row, col)
                self.selected_piece.has_moved = True
                self.selected_piece = None
                self.valid_moves = []
                self.current_turn = 'black' if self.current_turn == 'white' else 'white'
            else:
                self.selected_piece = None
                self.valid_moves = []
        else:
            piece = self.board[row][col]
            if piece and piece.color == self.current_turn:
                self.selected_piece = piece
                self.valid_moves = piece.get_valid_moves(self.board)

    def draw(self, screen):
        # Draw board
        for row in range(BOARD_SIZE):
            for col in range(BOARD_SIZE):
                color = WHITE if (row + col) % 2 == 0 else BLACK
                pygame.draw.rect(screen, color, 
                               (col * SQUARE_SIZE, row * SQUARE_SIZE, SQUARE_SIZE, SQUARE_SIZE))

        # Draw valid moves
        for row, col in self.valid_moves:
            highlight_surface = pygame.Surface((SQUARE_SIZE, SQUARE_SIZE), pygame.SRCALPHA)
            pygame.draw.rect(highlight_surface, HIGHLIGHT, 
                           (0, 0, SQUARE_SIZE, SQUARE_SIZE))
            screen.blit(highlight_surface, (col * SQUARE_SIZE, row * SQUARE_SIZE))

        # Draw pieces
        for row in range(BOARD_SIZE):
            for col in range(BOARD_SIZE):
                piece = self.board[row][col]
                if piece:
                    screen.blit(piece.image, 
                              (col * SQUARE_SIZE, row * SQUARE_SIZE))

def main():
    clock = pygame.time.Clock()
    game = ChessGame()

    while True:
        for event in pygame.event.get():
            if event.type == QUIT:
                pygame.quit()
                sys.exit()
            elif event.type == MOUSEBUTTONDOWN:
                game.handle_click(event.pos)

        screen.fill(WHITE)
        game.draw(screen)
        pygame.display.flip()
        clock.tick(60)

if __name__ == '__main__':
    main()
