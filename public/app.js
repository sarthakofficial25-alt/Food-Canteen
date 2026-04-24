const API_BASE = 'http://localhost:3000/api';
let macroChart = null;

document.addEventListener('DOMContentLoaded', () => {
    fetchMenu();
    
    document.getElementById('recommend-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const budget = document.getElementById('budget').value;
        const goal = document.getElementById('goal').value;
        const timeOfDay = document.getElementById('timeOfDay').value;
        const diet = document.getElementById('diet').value;
        const cuisine = document.getElementById('cuisine').value;

        await fetchRecommendations(budget, goal, timeOfDay, diet, cuisine);
    });

    // Tab Logic
    const tabBtns = document.querySelectorAll('.tab-btn');
    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            // Remove active from all
            tabBtns.forEach(b => b.classList.remove('active'));
            document.querySelectorAll('.tab-content').forEach(c => c.classList.add('hidden'));
            
            // Add active to clicked
            btn.classList.add('active');
            const targetId = btn.getAttribute('data-target');
            document.getElementById(targetId).classList.remove('hidden');
        });
    });
});

async function fetchMenu() {
    try {
        const response = await fetch(`${API_BASE}/menu`);
        const result = await response.json();
        
        const bengaliItems = result.data.filter(i => i.cuisine === 'bengali');
        const chineseItems = result.data.filter(i => i.cuisine === 'chinese');
        const southIndianItems = result.data.filter(i => i.cuisine === 'south_indian');
        
        // Pass the container that holds the grid
        renderGrid(bengaliItems, document.querySelector('#menu-bengali .menu-grid'));
        renderGrid(chineseItems, document.querySelector('#menu-chinese .menu-grid'));
        renderGrid(southIndianItems, document.querySelector('#menu-south-indian .menu-grid'));
    } catch (error) {
        console.error('Error fetching menu:', error);
    }
}

async function fetchRecommendations(budget, goal, timeOfDay, diet, cuisine) {
    try {
        const queryParams = new URLSearchParams({ budget, goal, timeOfDay, diet, cuisine }).toString();
        const response = await fetch(`${API_BASE}/recommend?${queryParams}`);
        const result = await response.json();
        
        const resultsSection = document.getElementById('results-section');
        resultsSection.classList.remove('hidden');
        
        renderGrid(result.data, document.getElementById('recommendations-grid'));

        if (result.data.length > 0) {
            updateChart(result.data[0]); // Chart for top pick
        }
        
        // Scroll to results
        resultsSection.scrollIntoView({ behavior: 'smooth' });
    } catch (error) {
        console.error('Error fetching recommendations:', error);
    }
}

function renderGrid(items, container) {
    if (typeof container === 'string') {
        container = document.getElementById(container);
    }
    
    container.innerHTML = '';

    if (!items || items.length === 0) {
        container.innerHTML = '<p>No items found matching your criteria.</p>';
        return;
    }

    items.forEach(item => {
        const card = document.createElement('div');
        card.className = 'food-card glass';
        
        const categoryLabel = item.category.charAt(0).toUpperCase() + item.category.slice(1);
        const dietLabel = item.diet === 'veg' ? 'Veg' : 'Non-Veg';
        
        // Emoji for timeOfDay
        let timeEmoji = '☀️';
        if (item.timeOfDay === 'breakfast') timeEmoji = '🌅';
        if (item.timeOfDay === 'dinner') timeEmoji = '🌙';
        if (item.timeOfDay === 'snack') timeEmoji = '🍪';

        card.innerHTML = `
            <div class="food-header">
                <div class="food-title">${item.name}</div>
                <div class="food-price">₹${item.price.toFixed(2)}</div>
            </div>
            <div class="food-tags">
                <span class="tag ${item.category}">${categoryLabel}</span>
                <span class="tag">${dietLabel}</span>
                <span class="tag time-tag" title="${item.timeOfDay}">${timeEmoji}</span>
            </div>
            <div class="food-stats">
                <div>
                    <div class="stat-val">${item.calories}</div>
                    <div class="stat-label">Cals</div>
                </div>
                <div>
                    <div class="stat-val">${item.protein}g</div>
                    <div class="stat-label">Protein</div>
                </div>
                <div>
                    <div class="stat-val">${item.fat}g</div>
                    <div class="stat-label">Fat</div>
                </div>
            </div>
        `;
        container.appendChild(card);
    });
}

function updateChart(topItem) {
    const ctx = document.getElementById('macroChart').getContext('2d');
    
    // Destroy previous chart instance if it exists
    if (macroChart) {
        macroChart.destroy();
    }

    // Chart text color based on dark mode aesthetics
    Chart.defaults.color = '#94a3b8';

    macroChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Protein (g)', 'Fat (g)', 'Carbs (Est. g)'],
            datasets: [{
                data: [
                    topItem.protein, 
                    topItem.fat, 
                    // Rough carb estimate: (total cals - (protein*4 + fat*9)) / 4
                    Math.max(0, Math.round((topItem.calories - (topItem.protein * 4 + topItem.fat * 9)) / 4))
                ],
                backgroundColor: [
                    '#6366f1', // Primary
                    '#ec4899', // Secondary
                    '#8b5cf6'  // Purple
                ],
                borderWidth: 0,
                hoverOffset: 4
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'bottom',
                },
                title: {
                    display: true,
                    text: `Macros for ${topItem.name}`,
                    color: '#f8fafc',
                    font: {
                        size: 16,
                        family: "'Outfit', sans-serif"
                    }
                }
            }
        }
    });
}
