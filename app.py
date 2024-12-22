from flask import Flask, render_template, jsonify, request
import os

app = Flask(__name__)

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/api/move', methods=['POST'])
def make_move():
    # Handle chess moves from client
    move_data = request.get_json()
    # Add game logic here if needed
    return jsonify({"status": "success"})

if __name__ == '__main__':
    app.run(debug=True)
