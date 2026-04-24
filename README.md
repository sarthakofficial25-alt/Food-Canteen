# 🥗 Smart Canteen Recommendation System

Welcome to the **Smart Canteen Recommendation System**, a beautiful, modern, and highly personalized full-stack web application designed for a college campus. 

The system helps students find affordable meals across different cuisines (Bengali, Chinese, South Indian, and Beverages) based on their budget, dietary preferences, and fitness goals.

![Demo](public/screenshot.png) *(You can add a screenshot here later)*

## ✨ Features
* **Multi-Cuisine Menus**: A diverse menu featuring 106 authentic dishes and drinks broken down into four tabbed sections: 🍛 Bengali, 🥡 Chinese, 🥥 South Indian, and 🥤 Beverages.
* **Smart Recommendation Engine**: A custom algorithm that calculates a "health score" for each dish based on its macros (protein, fat, calories), user fitness goals (Weight Loss, Gain, Maintain), and time of day.
* **🤖 AI Chef Insight**: Integrates the Google Gemini API to dynamically generate personalized, engaging explanations for why the top recommended meal perfectly suits your specific fitness goal.
* **🔐 Secure Authentication**: Includes a fully functional login and registration modal with a beautiful glassmorphism design. User data is strictly separated into its own `users.db` database for maximum organization, and passwords are encrypted using `werkzeug.security`.
* **Affordable Pricing**: Built for students, the meals range from ₹10 to ₹80.
* **Premium UI/UX**: Designed with a stunning "glassmorphism" aesthetic, mesh gradient backgrounds, interactive hover states, and dynamic time-of-day badges.
* **Macro Visualization**: Includes real-time donut charts (powered by Chart.js) breaking down the nutritional profile of your top recommended meal.

## 🛠️ Technology Stack
* **Frontend**: HTML5, Vanilla CSS3 (Custom Glassmorphism), Vanilla JavaScript, Chart.js.
* **Backend**: Python, Flask, Flask-CORS, Google Generative AI (Gemini).
* **Database**: SQLite (Auto-seeding upon initialization). Separated architecture (`canteen.db` for menu, `users.db` for accounts).

## 🚀 Getting Started

### Prerequisites
Make sure you have [Python 3.x](https://www.python.org/downloads/) installed on your machine.

### Installation
1. Clone the repository:
   ```bash
   git clone https://github.com/sarthakofficial25-alt/Food-Canteen.git
   cd Food-Canteen
   ```

2. Install the required Python packages:
   ```bash
   pip install flask flask-cors google-generativeai python-dotenv werkzeug
   ```

3. Create a `.env` file in the root directory and add your Google Gemini API key:
   ```env
   GEMINI_API_KEY="your_api_key_here"
   ```

4. Run the backend server (this will automatically generate and seed the `canteen.db` and `users.db` SQLite databases):
   ```bash
   python app.py
   ```

5. The application will be running at `http://127.0.0.1:3000`. Open this URL in your browser to experience the Smart Canteen!

## 📂 Project Structure
* `app.py`: The Flask server, recommendation algorithm, and database initialization logic.
* `public/index.html`: The structure of the application, including the recommendation form and tabbed cuisine views.
* `public/style.css`: All the styling, including animations, responsive grids, and the mesh gradient.
* `public/app.js`: The frontend logic that fetches the menu, submits form data, switches tabs, and renders the macro charts.

## 🤝 Contributing
Feel free to fork the repository, make enhancements, and submit a pull request!

---
*Built with ❤️ for better campus dining.*