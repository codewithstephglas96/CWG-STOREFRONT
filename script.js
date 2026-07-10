// =========================================
// CWG Scriptable Store - Main Script
// =========================================

document.addEventListener('DOMContentLoaded', function() {

    // =========================================
    // 1. LIVE DATE/TIME CLOCK
    // =========================================
    function updateDateTime() {
        const now = new Date();
        const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
        const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        const day = days[now.getDay()];
        const month = months[now.getMonth()];
        const date = now.getDate();
        const year = now.getFullYear();
        const time = now.toLocaleTimeString('en-US', { hour12: true, hour: '2-digit', minute: '2-digit', second: '2-digit' });
        const dateTimeStr = day + ' ' + date + ' ' + month + ' ' + year + ' ' + time;
        
        const dtElement = document.getElementById('liveDateTime');
        if (dtElement) {
            dtElement.textContent = dateTimeStr;
        }
        
        // Also update widget preview date
        const widgetDate = document.querySelector('.widget-date');
        if (widgetDate) {
            widgetDate.textContent = dateTimeStr;
        }
    }
    
    updateDateTime();
    setInterval(updateDateTime, 1000);

    // =========================================
    // 2. DICE ROLLING ANIMATION
    // =========================================
    function makeFace(num) {
        const face = document.createElement('div');
        face.className = 'face face--' + num;
        
        const dot = '<div class="dot"></div>';
        const dotsConfig = {
            1: dot,
            2: '<div class="dots" style="grid-template-columns:1fr; gap:3px;">' + dot + '<div></div>' + dot + '</div>',
            3: '<div class="dots" style="grid-template-columns:1fr; gap:3px;">' + dot + '<div></div><div></div><div></div>' + dot + '</div>',
            4: '<div class="dots" style="grid-template-columns:repeat(2,1fr); gap:3px;">' + dot + '<div></div><div></div><div></div>' + dot + '</div>',
            5: '<div class="dots" style="grid-template-columns:repeat(2,1fr); gap:3px;">' + dot + '<div></div>' + dot + '<div></div>' + dot + '<div></div>' + dot + '</div>',
            6: '<div class="dots" style="grid-template-columns:repeat(2,1fr); gap:3px;">' + dot + dot + dot + dot + dot + dot + '</div>'
        };
        face.innerHTML = dotsConfig[num] || '';
        return face;
    }

    function initDice(cubeId) {
        const cube = document.getElementById(cubeId);
        if (!cube) return;
        cube.innerHTML = '';
        for (let i = 1; i <= 6; i++) {
            cube.appendChild(makeFace(i));
        }
        cube.classList.add('cube-continuous');
    }

    initDice('cube1');
    initDice('cube2');

    // =========================================
    // 3. LOADER STEP ANIMATION
    // =========================================
    function animateLoaderSteps() {
        const steps = document.querySelectorAll('.loader-step');
        const totalSteps = steps.length;
        let currentStep = 0;
        
        function updateStep(index) {
            // Reset all steps
            steps.forEach((step, i) => {
                step.classList.remove('active', 'done', 'pending');
                const statusEl = step.querySelector('.loader-status');
                if (i < index) {
                    step.classList.add('done');
                    if (statusEl) statusEl.textContent = '✅';
                } else if (i === index) {
                    step.classList.add('active');
                    if (statusEl) statusEl.textContent = '⏳';
                } else {
                    step.classList.add('pending');
                    if (statusEl) statusEl.textContent = '○';
                }
            });
        }
        
        // Start animation
        updateStep(0);
        
        // Progress through steps with realistic timing
        const stepTimings = [3000, 5000, 8000, 6000, 10000, 4000]; // milliseconds per step
        
        function nextStep() {
            if (currentStep < totalSteps - 1) {
                currentStep++;
                updateStep(currentStep);
                setTimeout(nextStep, stepTimings[currentStep] || 4000);
            }
        }
        
        // Start the sequence after a short delay
        setTimeout(nextStep, stepTimings[0] || 3000);
        
        // Auto-restart when complete
        setTimeout(function() {
            // Reset and start over
            setTimeout(function() {
                currentStep = 0;
                updateStep(0);
                setTimeout(nextStep, stepTimings[0] || 3000);
            }, 3000);
        }, stepTimings.reduce((a, b) => a + b, 0) + 2000);
    }
    
    animateLoaderSteps();

    // =========================================
    // 4. INSTALL WIDGET BUTTON
    // =========================================
    document.getElementById('installWidgetBtn').addEventListener('click', function() {
        // Use Scriptable URL scheme to open Scriptable with the loader code
        // This opens Scriptable with a pre-filled script
        const loaderCode = `// CWG PW•PK2•PK4 LOADER
const CONFIG = {
  repoUrl: "https://raw.githubusercontent.com/codewithstephglas96/CWG-Dashboard/main/CWG_Dashboard.js"
};

async function loadMainScript() {
  const fm = FileManager.local();
  const cachePath = fm.documentsDirectory() + "/cwg_dashboard_cached.js";
  
  try {
    console.log("📦 Loading CWG Dashboard...");
    const mainReq = new Request(CONFIG.repoUrl);
    mainReq.headers = {
      "User-Agent": "Scriptable-CWG-Dashboard"
    };
    const scriptCode = await mainReq.loadString();
    
    if (!scriptCode || scriptCode.length < 100) {
      throw new Error("Invalid response from GitHub");
    }
    
    fm.writeString(cachePath, scriptCode);
    
    const AsyncFunction = Object.getPrototypeOf(async function(){}).constructor;
    const asyncFn = new AsyncFunction(scriptCode);
    await asyncFn();
    
    console.log("✅ Dashboard executed successfully");
  } catch (error) {
    console.log("⚠️ Error:", error.message);
  }
}

loadMainScript();`;
        
        // Encode the script for the URL
        const encodedScript = encodeURIComponent(loaderCode);
        const scriptName = 'CWG Loader';
        const url = `scriptable:///add?text=${encodedScript}&name=${encodeURIComponent(scriptName)}`;
        
        // Try to open Scriptable
        window.location.href = url;
        
        // Fallback if Scriptable isn't installed
        setTimeout(function() {
            // If the user is still on the page, offer to install Scriptable
            const alert = document.createElement('div');
            alert.style.cssText = `
                position: fixed; bottom: 20px; left: 50%; transform: translateX(-50%);
                background: #1e293b; color: white; padding: 16px 24px;
                border-radius: 12px; border: 1px solid #ff9d00;
                box-shadow: 0 4px 24px rgba(0,0,0,0.6); z-index: 9999;
                max-width: 90%; text-align: center;
            `;
            alert.innerHTML = `
                <p style="margin: 0 0 8px;">⚠️ Scriptable not detected.</p>
                <a href="https://apps.apple.com/app/scriptable/id1405459188" target="_blank" 
                   style="color: #ff9d00; font-weight: 700; text-decoration: none;">
                   📲 Install Scriptable from the App Store
                </a>
                <button onclick="this.parentElement.remove()" 
                        style="background: none; border: none; color: #64748b; font-size: 18px; cursor: pointer; margin-left: 12px;">✕</button>
            `;
            document.body.appendChild(alert);
        }, 2000);
    });

    // =========================================
    // 5. SMOOTH SCROLL FOR NAVIGATION
    // =========================================
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        });
    });

    // =========================================
    // 6. WIDGET PREVIEW - Update the demo widget
    // =========================================
    function updateWidgetPreview() {
        const widgetPreview = document.getElementById('widgetPreview');
        if (widgetPreview) {
            const now = new Date();
            const timeStr = now.toLocaleTimeString('en-US', { hour12: true, hour: '2-digit', minute: '2-digit' });
            const dateStr = now.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
            
            const content = widgetPreview.querySelector('.widget-preview-content');
            if (content) {
                const title = content.querySelector('.widget-title');
                const loading = content.querySelector('.widget-loading');
                const date = content.querySelector('.widget-date');
                const footer = content.querySelector('.widget-footer');
                
                if (title) title.textContent = '⏳ CWG Dashboard';
                if (loading) {
                    const loadingTexts = ['Loading dashboard...', 'Fetching data...', 'Analyzing charts...'];
                    const idx = Math.floor(Date.now() / 3000) % loadingTexts.length;
                    loading.textContent = loadingTexts[idx];
                }
                if (date) date.textContent = dateStr + ' ' + timeStr;
                if (footer) footer.textContent = 'CODEWITHGLASGOW';
            }
        }
    }
    
    // Update the widget preview every 3 seconds
    updateWidgetPreview();
    setInterval(updateWidgetPreview, 3000);
    
    console.log('🚀 CWG Scriptable Store loaded successfully!');
});