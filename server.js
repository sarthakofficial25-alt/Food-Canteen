const express = require('express');
const cors = require('cors');
const path = require('path');
const db = require('./database');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// /api/menu -> returns all food items
app.get('/api/menu', (req, res) => {
    db.all("SELECT * FROM menu", [], (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json({ data: rows });
    });
});

// /api/recommend -> returns filtered and sorted recommendations
app.get('/api/recommend', (req, res) => {
    let { budget, goal, timeOfDay, diet } = req.query;

    budget = parseFloat(budget) || 1000; // default high budget
    timeOfDay = timeOfDay || 'lunch';
    diet = diet || 'any';
    goal = goal || 'maintain';

    // Base query
    let query = "SELECT * FROM menu WHERE price <= ? AND timeOfDay = ?";
    let params = [budget, timeOfDay];

    if (diet !== 'any') {
        query += " AND diet = ?";
        params.push(diet);
    }

    db.all(query, params, (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }

        // Add health score for each item based on goal
        const scoredItems = rows.map(item => {
            let score = 0;

            // Base health points
            if (item.category === 'healthy') score += 10;
            if (item.category === 'moderate') score += 5;
            if (item.category === 'junk') score -= 5;

            switch (goal) {
                case 'loss':
                    // Weight loss favors low calorie, high protein
                    score -= (item.calories / 100); 
                    score += (item.protein / 2);
                    score -= (item.fat / 2);
                    break;
                case 'gain':
                    // Weight gain favors high calorie, high protein
                    score += (item.calories / 100);
                    score += (item.protein);
                    break;
                case 'maintain':
                default:
                    // Maintain favors balanced
                    score += (item.protein / 2);
                    break;
            }

            return { ...item, score };
        });

        // Sort descending by score
        scoredItems.sort((a, b) => b.score - a.score);

        // Top 3
        const top3 = scoredItems.slice(0, 3);
        res.json({ data: top3 });
    });
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
