const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Use an in-memory database or a file
// For this app, let's use a file so data persists between restarts
const dbPath = path.resolve(__dirname, 'canteen.db');
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Error connecting to the database:', err.message);
    } else {
        console.log('Connected to the SQLite database.');
        initializeDatabase();
    }
});

function initializeDatabase() {
    db.serialize(() => {
        // Create the food table
        db.run(`
            CREATE TABLE IF NOT EXISTS menu (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                price REAL NOT NULL,
                calories INTEGER NOT NULL,
                protein REAL NOT NULL,
                fat REAL NOT NULL,
                category TEXT NOT NULL,
                diet TEXT NOT NULL,
                timeOfDay TEXT NOT NULL
            )
        `);

        // Check if the table is empty and seed data
        db.get("SELECT COUNT(*) AS count FROM menu", (err, row) => {
            if (err) {
                console.error("Error querying menu table:", err);
                return;
            }
            if (row.count === 0) {
                seedData();
            } else {
                console.log(`Database already has ${row.count} items.`);
            }
        });
    });
}

function seedData() {
    console.log("Seeding initial data...");
    const stmt = db.prepare(`
        INSERT INTO menu (name, price, calories, protein, fat, category, diet, timeOfDay) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const seedItems = [
        // Breakfast
        ['Oatmeal with Berries', 5.00, 250, 8, 4, 'healthy', 'veg', 'breakfast'],
        ['Egg White Omelette', 7.50, 180, 20, 5, 'healthy', 'non-veg', 'breakfast'],
        ['Pancakes with Syrup', 6.00, 450, 6, 15, 'junk', 'veg', 'breakfast'],
        ['Avocado Toast', 8.00, 320, 7, 22, 'healthy', 'veg', 'breakfast'],
        ['Sausage and Egg Muffin', 4.50, 480, 15, 25, 'junk', 'non-veg', 'breakfast'],
        ['Protein Shake', 6.50, 200, 25, 3, 'healthy', 'veg', 'breakfast'],

        // Lunch
        ['Grilled Chicken Salad', 12.00, 350, 35, 12, 'healthy', 'non-veg', 'lunch'],
        ['Quinoa Bowl with Tofu', 11.50, 420, 18, 15, 'healthy', 'veg', 'lunch'],
        ['Cheeseburger & Fries', 9.50, 850, 25, 45, 'junk', 'non-veg', 'lunch'],
        ['Lentil Soup', 6.00, 280, 14, 5, 'healthy', 'veg', 'lunch'],
        ['Turkey Sandwich', 8.50, 450, 22, 14, 'moderate', 'non-veg', 'lunch'],
        ['Macaroni and Cheese', 7.00, 600, 15, 30, 'junk', 'veg', 'lunch'],

        // Dinner
        ['Salmon with Asparagus', 15.00, 450, 38, 22, 'healthy', 'non-veg', 'dinner'],
        ['Vegetable Stir-Fry', 10.00, 300, 10, 8, 'healthy', 'veg', 'dinner'],
        ['Beef Steak & Mash', 18.00, 750, 45, 35, 'moderate', 'non-veg', 'dinner'],
        ['Pasta Carbonara', 13.00, 800, 20, 40, 'junk', 'non-veg', 'dinner'],
        ['Vegan Buddha Bowl', 12.50, 400, 15, 12, 'healthy', 'veg', 'dinner'],
        ['Fried Chicken Plate', 11.00, 950, 30, 55, 'junk', 'non-veg', 'dinner'],

        // Snacks
        ['Mixed Nuts', 4.00, 200, 5, 18, 'healthy', 'veg', 'snack'],
        ['Potato Chips', 2.50, 300, 2, 20, 'junk', 'veg', 'snack'],
        ['Greek Yogurt', 3.50, 120, 12, 0, 'healthy', 'veg', 'snack'],
        ['Chocolate Bar', 2.00, 250, 3, 14, 'junk', 'veg', 'snack'],
        ['Apple with Peanut Butter', 3.00, 220, 6, 12, 'healthy', 'veg', 'snack'],
        ['Beef Jerky', 5.50, 150, 20, 4, 'healthy', 'non-veg', 'snack']
    ];

    for (let item of seedItems) {
        stmt.run(item);
    }
    stmt.finalize();
    console.log("Database seeded successfully.");
}

module.exports = db;
