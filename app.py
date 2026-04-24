from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import sqlite3
import os

app = Flask(__name__, static_folder='public', static_url_path='')
CORS(app)

DB_PATH = 'canteen.db'

def init_db():
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    c.execute('''
        CREATE TABLE IF NOT EXISTS menu (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            price REAL NOT NULL,
            calories INTEGER NOT NULL,
            protein REAL NOT NULL,
            fat REAL NOT NULL,
            category TEXT NOT NULL,
            diet TEXT NOT NULL,
            timeOfDay TEXT NOT NULL,
            cuisine TEXT NOT NULL
        )
    ''')
    
    c.execute("SELECT COUNT(*) FROM menu")
    count = c.fetchone()[0]
    if count == 0:
        seed_data = [
            # Bengali
            ('Luchi & Aloo Dum', 30.00, 350, 6, 15, 'moderate', 'veg', 'breakfast', 'bengali'),
            ('Kochuri & Chholar Dal', 25.00, 320, 8, 12, 'moderate', 'veg', 'breakfast', 'bengali'),
            ('Dim Toast', 20.00, 220, 10, 8, 'healthy', 'non-veg', 'breakfast', 'bengali'),
            ('Machher Jhol & Bhaat', 60.00, 450, 25, 12, 'healthy', 'non-veg', 'lunch', 'bengali'),
            ('Veg Thali', 40.00, 500, 12, 10, 'healthy', 'veg', 'lunch', 'bengali'),
            ('Chicken Kosha & Roti', 70.00, 520, 30, 20, 'moderate', 'non-veg', 'lunch', 'bengali'),
            ('Egg Roll', 35.00, 380, 12, 18, 'junk', 'non-veg', 'dinner', 'bengali'),
            ('Mughlai Paratha', 60.00, 600, 20, 35, 'junk', 'non-veg', 'dinner', 'bengali'),
            ('Chicken Bharta & Roti', 65.00, 480, 25, 15, 'moderate', 'non-veg', 'dinner', 'bengali'),
            ('Telebhaja (Alur Chop)', 10.00, 150, 2, 10, 'junk', 'veg', 'snack', 'bengali'),
            ('Jhal Muri', 15.00, 120, 4, 3, 'healthy', 'veg', 'snack', 'bengali'),
            ('Phuchka (6 pcs)', 20.00, 100, 2, 4, 'moderate', 'veg', 'snack', 'bengali'),

            # Chinese
            ('Veg Spring Roll', 25.00, 250, 4, 12, 'junk', 'veg', 'breakfast', 'chinese'),
            ('Veg Momo (6 pcs)', 30.00, 200, 6, 4, 'healthy', 'veg', 'breakfast', 'chinese'),
            ('Chicken Momo (6 pcs)', 40.00, 250, 15, 6, 'healthy', 'non-veg', 'breakfast', 'chinese'),
            ('Veg Hakka Noodles', 45.00, 400, 8, 14, 'moderate', 'veg', 'lunch', 'chinese'),
            ('Chicken Fried Rice', 60.00, 500, 20, 16, 'moderate', 'non-veg', 'lunch', 'chinese'),
            ('Chilli Chicken (Dry)', 70.00, 350, 25, 18, 'junk', 'non-veg', 'lunch', 'chinese'),
            ('Veg Manchurian & Rice', 55.00, 450, 10, 15, 'moderate', 'veg', 'dinner', 'chinese'),
            ('Garlic Chicken & Noodles', 75.00, 550, 22, 20, 'moderate', 'non-veg', 'dinner', 'chinese'),
            ('Chilli Paneer & Rice', 65.00, 480, 15, 22, 'junk', 'veg', 'dinner', 'chinese'),
            ('Prawn Crackers', 20.00, 150, 2, 8, 'junk', 'non-veg', 'snack', 'chinese'),
            ('Crispy Chilli Baby Corn', 40.00, 280, 4, 15, 'junk', 'veg', 'snack', 'chinese'),
            ('Manchow Soup', 30.00, 120, 4, 4, 'healthy', 'veg', 'snack', 'chinese'),

            # South Indian
            ('Idli Sambar', 25.00, 200, 8, 2, 'healthy', 'veg', 'breakfast', 'south_indian'),
            ('Masala Dosa', 35.00, 300, 6, 12, 'moderate', 'veg', 'breakfast', 'south_indian'),
            ('Upma', 20.00, 250, 5, 8, 'healthy', 'veg', 'breakfast', 'south_indian'),
            ('Lemon Rice', 35.00, 350, 6, 10, 'moderate', 'veg', 'lunch', 'south_indian'),
            ('South Indian Meals', 50.00, 550, 12, 8, 'healthy', 'veg', 'lunch', 'south_indian'),
            ('Bisi Bele Bath', 45.00, 450, 10, 12, 'moderate', 'veg', 'lunch', 'south_indian'),
            ('Onion Uttapam', 30.00, 280, 6, 10, 'healthy', 'veg', 'dinner', 'south_indian'),
            ('Appam & Veg Stew', 40.00, 320, 5, 14, 'healthy', 'veg', 'dinner', 'south_indian'),
            ('Malabar Parotta & Kurma', 50.00, 500, 8, 22, 'junk', 'veg', 'dinner', 'south_indian'),
            ('Medu Vada (2 pcs)', 20.00, 280, 6, 18, 'junk', 'veg', 'snack', 'south_indian'),
            ('Banana Chips', 15.00, 200, 1, 15, 'junk', 'veg', 'snack', 'south_indian'),
            ('Filter Coffee', 15.00, 80, 2, 2, 'healthy', 'veg', 'snack', 'south_indian')
        ]
        c.executemany('''
            INSERT INTO menu (name, price, calories, protein, fat, category, diet, timeOfDay, cuisine) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        ''', seed_data)

        extra_seed_data = [
            # 20 Bengali Items
            ('Alu Paratha & Dahi', 35.00, 300, 8, 12, 'moderate', 'veg', 'breakfast', 'bengali'),
            ('Puri Sabzi', 25.00, 350, 6, 15, 'junk', 'veg', 'breakfast', 'bengali'),
            ('Muri Ghonto', 50.00, 400, 15, 10, 'moderate', 'non-veg', 'lunch', 'bengali'),
            ('Shukto & Rice', 45.00, 350, 8, 8, 'healthy', 'veg', 'lunch', 'bengali'),
            ('Dhokar Dalna', 40.00, 300, 12, 10, 'healthy', 'veg', 'lunch', 'bengali'),
            ('Echorer Dalna', 35.00, 280, 5, 8, 'healthy', 'veg', 'lunch', 'bengali'),
            ('Kosha Mangsho', 75.00, 550, 35, 25, 'junk', 'non-veg', 'dinner', 'bengali'),
            ('Roti & Alu Posto', 35.00, 350, 6, 12, 'moderate', 'veg', 'dinner', 'bengali'),
            ('Roti & Chholar Dal', 25.00, 280, 10, 6, 'healthy', 'veg', 'dinner', 'bengali'),
            ('Fish Fry', 45.00, 350, 18, 20, 'junk', 'non-veg', 'snack', 'bengali'),
            ('Egg Devil', 20.00, 250, 10, 15, 'junk', 'non-veg', 'snack', 'bengali'),
            ('Mochar Chop', 15.00, 200, 3, 10, 'moderate', 'veg', 'snack', 'bengali'),
            ('Chicken Cutlet', 40.00, 380, 15, 22, 'junk', 'non-veg', 'snack', 'bengali'),
            ('Mutton Roll', 70.00, 550, 22, 28, 'junk', 'non-veg', 'dinner', 'bengali'),
            ('Double Egg Roll', 45.00, 450, 18, 22, 'junk', 'non-veg', 'dinner', 'bengali'),
            ('Churmur', 15.00, 150, 4, 6, 'moderate', 'veg', 'snack', 'bengali'),
            ('Ghugni Chaat', 20.00, 220, 10, 6, 'healthy', 'veg', 'snack', 'bengali'),
            ('Rosogolla (2 pcs)', 20.00, 300, 4, 2, 'junk', 'veg', 'snack', 'bengali'),
            ('Mishti Doi', 25.00, 250, 6, 8, 'moderate', 'veg', 'snack', 'bengali'),
            ('Lassi', 20.00, 180, 5, 4, 'healthy', 'veg', 'snack', 'bengali'),

            # 20 Chinese Items
            ('Sweet Corn Soup', 35.00, 150, 10, 4, 'healthy', 'non-veg', 'breakfast', 'chinese'),
            ('Hot & Sour Soup', 30.00, 120, 4, 3, 'healthy', 'veg', 'breakfast', 'chinese'),
            ('Paneer Momo', 35.00, 280, 12, 10, 'moderate', 'veg', 'breakfast', 'chinese'),
            ('Fried Momo (Veg)', 35.00, 350, 6, 18, 'junk', 'veg', 'snack', 'chinese'),
            ('Fried Momo (Chicken)', 45.00, 400, 15, 20, 'junk', 'non-veg', 'snack', 'chinese'),
            ('Mixed Fried Rice', 70.00, 550, 22, 18, 'moderate', 'non-veg', 'lunch', 'chinese'),
            ('Egg Fried Rice', 50.00, 450, 14, 15, 'moderate', 'non-veg', 'lunch', 'chinese'),
            ('Veg Chowmein (Gravy)', 35.00, 380, 8, 12, 'moderate', 'veg', 'lunch', 'chinese'),
            ('Chicken Chowmein', 50.00, 480, 20, 16, 'junk', 'non-veg', 'dinner', 'chinese'),
            ('Mixed Hakka Noodles', 75.00, 580, 24, 20, 'junk', 'non-veg', 'dinner', 'chinese'),
            ('Chilli Paneer (Dry)', 60.00, 420, 16, 25, 'junk', 'veg', 'snack', 'chinese'),
            ('Dragon Chicken', 80.00, 450, 28, 22, 'junk', 'non-veg', 'dinner', 'chinese'),
            ('Fried Rice & Manchurian', 65.00, 500, 12, 18, 'moderate', 'veg', 'lunch', 'chinese'),
            ('Egg Hakka Noodles', 45.00, 420, 14, 16, 'moderate', 'non-veg', 'lunch', 'chinese'),
            ('Honey Chilli Potato', 40.00, 380, 4, 18, 'junk', 'veg', 'snack', 'chinese'),
            ('Chicken Lollypop', 50.00, 350, 20, 22, 'junk', 'non-veg', 'snack', 'chinese'),
            ('Crispy Fried Chicken', 60.00, 450, 25, 28, 'junk', 'non-veg', 'dinner', 'chinese'),
            ('Chicken Clear Soup', 35.00, 100, 12, 2, 'healthy', 'non-veg', 'snack', 'chinese'),
            ('Chilli Garlic Noodles', 45.00, 400, 8, 14, 'moderate', 'veg', 'dinner', 'chinese'),
            ('Szechuan Chicken', 80.00, 600, 28, 25, 'junk', 'non-veg', 'dinner', 'chinese'),

            # 20 South Indian Items
            ('Rava Idli', 30.00, 220, 6, 4, 'healthy', 'veg', 'breakfast', 'south_indian'),
            ('Podi Idli', 35.00, 250, 8, 6, 'moderate', 'veg', 'breakfast', 'south_indian'),
            ('Mysore Masala Dosa', 45.00, 380, 8, 15, 'junk', 'veg', 'breakfast', 'south_indian'),
            ('Paper Dosa', 30.00, 250, 4, 10, 'moderate', 'veg', 'breakfast', 'south_indian'),
            ('Onion Rava Dosa', 40.00, 320, 6, 12, 'moderate', 'veg', 'breakfast', 'south_indian'),
            ('Tomato Uttapam', 35.00, 280, 5, 8, 'healthy', 'veg', 'lunch', 'south_indian'),
            ('Curd Rice', 35.00, 300, 6, 8, 'healthy', 'veg', 'lunch', 'south_indian'),
            ('Tamarind Rice', 40.00, 350, 5, 10, 'moderate', 'veg', 'lunch', 'south_indian'),
            ('Tomato Rice', 35.00, 320, 4, 10, 'moderate', 'veg', 'lunch', 'south_indian'),
            ('Sambar Rice', 40.00, 380, 10, 8, 'healthy', 'veg', 'lunch', 'south_indian'),
            ('Chettinad & Parotta', 80.00, 650, 30, 28, 'junk', 'non-veg', 'dinner', 'south_indian'),
            ('Egg Dosa', 45.00, 350, 14, 15, 'moderate', 'non-veg', 'dinner', 'south_indian'),
            ('Chicken Curry & Rice', 75.00, 550, 28, 20, 'moderate', 'non-veg', 'dinner', 'south_indian'),
            ('Ghee Roast Dosa', 50.00, 400, 6, 20, 'junk', 'veg', 'dinner', 'south_indian'),
            ('Pongal', 30.00, 320, 8, 12, 'moderate', 'veg', 'dinner', 'south_indian'),
            ('Medu Vada (Single)', 12.00, 150, 3, 9, 'junk', 'veg', 'snack', 'south_indian'),
            ('Dal Vada', 15.00, 180, 6, 10, 'moderate', 'veg', 'snack', 'south_indian'),
            ('Bonda', 15.00, 200, 4, 12, 'junk', 'veg', 'snack', 'south_indian'),
            ('Payasam', 25.00, 250, 4, 8, 'moderate', 'veg', 'snack', 'south_indian'),
            ('Buttermilk', 10.00, 50, 2, 1, 'healthy', 'veg', 'snack', 'south_indian')
        ]
        c.executemany('''
            INSERT INTO menu (name, price, calories, protein, fat, category, diet, timeOfDay, cuisine) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        ''', extra_seed_data)
        conn.commit()
    conn.close()

init_db()

def dict_factory(cursor, row):
    d = {}
    for idx, col in enumerate(cursor.description):
        d[col[0]] = row[idx]
    return d

@app.route('/')
def serve_index():
    return send_from_directory(app.static_folder, 'index.html')

@app.route('/api/menu', methods=['GET'])
def get_menu():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = dict_factory
    c = conn.cursor()
    c.execute("SELECT * FROM menu")
    rows = c.fetchall()
    conn.close()
    return jsonify({"data": rows})

@app.route('/api/recommend', methods=['GET'])
def recommend():
    try:
        budget = float(request.args.get('budget', 1000))
    except ValueError:
        budget = 1000.0
        
    goal = request.args.get('goal', 'maintain')
    timeOfDay = request.args.get('timeOfDay', 'lunch')
    diet = request.args.get('diet', 'any')
    cuisine = request.args.get('cuisine', 'any')

    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = dict_factory
    c = conn.cursor()

    query = "SELECT * FROM menu WHERE price <= ? AND timeOfDay = ?"
    params = [budget, timeOfDay]

    if diet != 'any':
        query += " AND diet = ?"
        params.append(diet)
        
    if cuisine != 'any':
        query += " AND cuisine = ?"
        params.append(cuisine)

    c.execute(query, params)
    rows = c.fetchall()
    conn.close()

    for item in rows:
        score = 0
        if item['category'] == 'healthy': score += 10
        if item['category'] == 'moderate': score += 5
        if item['category'] == 'junk': score -= 5

        if goal == 'loss':
            score -= (item['calories'] / 100)
            score += (item['protein'] / 2)
            score -= (item['fat'] / 2)
        elif goal == 'gain':
            score += (item['calories'] / 100)
            score += item['protein']
        else:
            score += (item['protein'] / 2)

        item['score'] = score

    rows.sort(key=lambda x: x['score'], reverse=True)
    return jsonify({"data": rows[:3]})

if __name__ == '__main__':
    app.run(port=3000)
