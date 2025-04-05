let history = JSON.parse(localStorage.getItem('calcHistory')) || [];

function loadHistory() {
    history.forEach(item => addHistoryItem(item));
}

// Get canvas and context
const canvas = document.getElementById('fireworksCanvas');
const ctx = canvas.getContext('2d');

// Resize canvas to cover the screen
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// Firework logic
function createFireworks(x, y) {
    let particles = []; // Make sure particles is defined within the function to avoid issues

    // Create particles with random movement in various directions
    for (let i = 0; i < 100; i++) {
        particles.push({
            x: x,
            y: y,
            speed: Math.random() * 6 + 3, // random speed between 3 and 9
            angle: Math.random() * Math.PI * 2, // random angle for spread
            radius: Math.random() * 3 + 1, // random size for each particle
            color: `hsl(${Math.random() * 360}, 100%, 60%)`, // random color
            life: 0, // Track the life of the particle
            maxLife: Math.random() * 20 + 30 // Random lifetime for each particle
        });
    }

    // Animate particles
    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear the canvas
        
        particles.forEach(p => {
            // Move particles outwards from the center
            p.x += p.speed * Math.cos(p.angle);
            p.y += p.speed * Math.sin(p.angle);

            p.life += 1;

            // Particle fading effect (smaller and transparent as they die)
            const alpha = 1 - p.life / p.maxLife;

            ctx.beginPath();
            ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
            ctx.fillStyle = p.color;
            ctx.globalAlpha = alpha; // Fade particles as they live longer
            ctx.fill();
        });

        // Remove dead particles
        particles = particles.filter(p => p.life < p.maxLife);
        
        // Continue animation until particles are gone
        if (particles.length > 0) {
            requestAnimationFrame(animate); // Continue animation if particles exist
        } else {
            canvas.style.display = 'none'; // Hide canvas when animation ends
        }
    }

    // Show canvas and start animation
    canvas.style.display = 'block';
    animate();
}

let display = document.getElementById('display');

const historyList = document.getElementById('historyList');

// Append value to display
function appendValue(value) {
    display.value += value;
}

// Clear display
function clearDisplay() {
    display.value = '';
    historyList.innerHTML = '';
    history = [];
    localStorage.removeItem('calcHistory');
}



// Delete last character
function deleteLast() {
    display.value = display.value.slice(0, -1);
}

// Calculate result
function calculate() {
    try {
        const expression = display.value;
        const result = eval(expression);
        display.value = result;

        const itemText = `${expression} = ${result}`;
        
        // Save in array and localStorage
        history.unshift(itemText);
        localStorage.setItem('calcHistory', JSON.stringify(history));

        // Create visual item
        addHistoryItem(itemText);
        
    } catch {
        display.value = 'Error';
    }
}

function addHistoryItem(text) {
    const li = document.createElement('li');

    const span = document.createElement('span');
    span.textContent = text;
    span.style.cursor = 'pointer';
    span.onclick = () => {
        const expression = text.split('=')[0].trim();
        display.value = expression;
    };

    const deleteBtn = document.createElement('button');
    deleteBtn.textContent = '×';
    deleteBtn.className = 'delete-btn';
    deleteBtn.onclick = () => {
        // Remove from visual list
        li.remove();

        // Remove from memory and localStorage
        history = history.filter(item => item !== text);
        localStorage.setItem('calcHistory', JSON.stringify(history));
    };

    li.appendChild(span);
    li.appendChild(deleteBtn);
    historyList.prepend(li);
}

// Toggle theme
const themeSwitcher = document.getElementById('themeSwitcher');
themeSwitcher.addEventListener('change', () => {
    document.body.classList.toggle('dark-theme');
    document.body.classList.toggle('light-theme');
});

// Update the keydown event listener
document.addEventListener('keydown', (event) => {
    const key = event.key;

    // Allow only valid calculator keys
    const validKeys = ['0','1','2','3','4','5','6','7','8','9',
                       '+','-','*','/','.', '(', ')'];

    if (validKeys.includes(key)) {
        display.value += key;
    }

    // Allow Backspace to delete
    if (key === 'Backspace') {
        display.value = display.value.slice(0, -1);
    }

    // Allow Enter to calculate and show fireworks
    if (key === 'Enter') {
        calculate();
        const x = canvas.width / 2;
        const y = canvas.height / 2;
        createFireworks(x, y); // trigger fireworks
    }

    // Optional: Clear with Escape
    if (key === 'Escape') {
        clearDisplay();
    }
});


loadHistory();