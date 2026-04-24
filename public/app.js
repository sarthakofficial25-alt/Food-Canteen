const API_BASE = '/api';
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

    initAuth();
});

async function fetchMenu() {
    try {
        const response = await fetch(`${API_BASE}/menu`);
        const result = await response.json();
        
        const bengaliItems = result.data.filter(i => i.cuisine === 'bengali');
        const chineseItems = result.data.filter(i => i.cuisine === 'chinese');
        const southIndianItems = result.data.filter(i => i.cuisine === 'south_indian');
        const beveragesItems = result.data.filter(i => i.cuisine === 'beverages');
        
        // Pass the container that holds the grid
        renderGrid(bengaliItems, document.querySelector('#menu-bengali .menu-grid'));
        renderGrid(chineseItems, document.querySelector('#menu-chinese .menu-grid'));
        renderGrid(southIndianItems, document.querySelector('#menu-south-indian .menu-grid'));
        renderGrid(beveragesItems, document.querySelector('#menu-beverages .menu-grid'));
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
            fetchAiInsight(result.data[0], goal);
        } else {
            document.getElementById('ai-text').innerText = "No items found to provide insight on.";
        }
        
        // Scroll to results
        resultsSection.scrollIntoView({ behavior: 'smooth' });
    } catch (error) {
        console.error('Error fetching recommendations:', error);
    }
}

async function fetchAiInsight(topItem, goal) {
    const aiText = document.getElementById('ai-text');
    const aiLoading = document.getElementById('ai-loading');
    
    // Show loading state
    aiText.classList.add('hidden');
    aiLoading.classList.remove('hidden');

    try {
        const payload = {
            name: topItem.name,
            calories: topItem.calories,
            protein: topItem.protein,
            fat: topItem.fat,
            goal: goal
        };

        const response = await fetch(`${API_BASE}/ai-insight`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        const result = await response.json();
        
        // Hide loading, show text
        aiLoading.classList.add('hidden');
        aiText.innerText = result.insight;
        aiText.classList.remove('hidden');
    } catch (error) {
        console.error("AI Insight Error:", error);
        aiLoading.classList.add('hidden');
        aiText.innerText = "Our AI Chef is taking a nap. Enjoy your meal!";
        aiText.classList.remove('hidden');
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

// Authentication Logic
let isLoginMode = true;

function initAuth() {
    const loginBtn = document.getElementById('login-btn');
    const modal = document.getElementById('auth-modal');
    const closeBtn = document.getElementById('close-modal');
    const authForm = document.getElementById('auth-form');
    const toggleLink = document.getElementById('auth-toggle-link');
    const toggleText = document.getElementById('auth-toggle-text');
    const authTitle = document.getElementById('auth-title');
    const submitBtn = document.getElementById('auth-submit-btn');
    const errorMsg = document.getElementById('auth-error');

    // Check existing session
    const currentUser = localStorage.getItem('username');
    if (currentUser) {
        updateNavbarLoggedIn(currentUser);
    }

    // Modal toggling
    loginBtn.addEventListener('click', (e) => {
        e.preventDefault();
        if (localStorage.getItem('username')) {
            // Logout
            localStorage.removeItem('username');
            loginBtn.textContent = 'Login';
        } else {
            // Open Modal
            modal.classList.remove('hidden');
            errorMsg.classList.add('hidden');
        }
    });

    closeBtn.addEventListener('click', () => {
        modal.classList.add('hidden');
    });

    // Toggle Login/Register
    toggleLink.addEventListener('click', (e) => {
        e.preventDefault();
        isLoginMode = !isLoginMode;
        errorMsg.classList.add('hidden');
        
        if (isLoginMode) {
            authTitle.textContent = 'Login';
            submitBtn.textContent = 'Login';
            toggleText.textContent = "Don't have an account?";
            toggleLink.textContent = 'Register';
        } else {
            authTitle.textContent = 'Create Account';
            submitBtn.textContent = 'Register';
            toggleText.textContent = "Already have an account?";
            toggleLink.textContent = 'Login';
        }
    });

    // Form Submission
    authForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const username = document.getElementById('username').value.trim();
        const password = document.getElementById('password').value.trim();
        const endpoint = isLoginMode ? '/login' : '/register';

        submitBtn.disabled = true;
        errorMsg.classList.add('hidden');

        try {
            const response = await fetch(`${API_BASE}${endpoint}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password })
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.error || 'Authentication failed');
            }

            if (isLoginMode) {
                // Success Login
                localStorage.setItem('username', result.username);
                updateNavbarLoggedIn(result.username);
                modal.classList.add('hidden');
                authForm.reset();
            } else {
                // Success Register -> auto switch to login
                isLoginMode = true;
                authTitle.textContent = 'Login';
                submitBtn.textContent = 'Login';
                toggleText.textContent = "Don't have an account?";
                toggleLink.textContent = 'Register';
                errorMsg.textContent = "Registration successful! Please login.";
                errorMsg.style.color = "var(--success)";
                errorMsg.classList.remove('hidden');
                setTimeout(() => {
                    errorMsg.style.color = "#ff6b6b";
                }, 3000);
            }
        } catch (error) {
            errorMsg.textContent = error.message;
            errorMsg.classList.remove('hidden');
        } finally {
            submitBtn.disabled = false;
        }
    });
}

function updateNavbarLoggedIn(username) {
    const loginBtn = document.getElementById('login-btn');
    loginBtn.innerHTML = `Hi, ${username} <span style="font-size:0.8em; margin-left:5px; color:var(--danger);">(Logout)</span>`;
}
