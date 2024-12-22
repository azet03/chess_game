# Chess Game Web Application

A web-based chess game built with Flask and JavaScript.

## Local Development

1. Install dependencies:
   ```
   pip install -r requirements.txt
   ```

2. Run the development server:
   ```
   python app.py
   ```

3. Open your browser and visit: `http://localhost:5000`

## Deployment Options

### Heroku Deployment
1. Create a Heroku account at https://heroku.com
2. Install Heroku CLI
3. Login to Heroku:
   ```
   heroku login
   ```
4. Create a new Heroku app:
   ```
   heroku create your-chess-app-name
   ```
5. Deploy:
   ```
   git push heroku main
   ```

### Railway Deployment
1. Create an account at https://railway.app
2. Create a new project
3. Connect your GitHub repository
4. Railway will automatically detect the Python project and deploy it

### Render Deployment
1. Create an account at https://render.com
2. Create a new Web Service
3. Connect your GitHub repository
4. Render will automatically detect the Python project and deploy it

## Features
- Interactive chess board
- Legal move validation
- Turn-based gameplay
- Visual move indicators
- Responsive design
