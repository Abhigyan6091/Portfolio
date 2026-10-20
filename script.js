// script.js - Core Logic for A.Sharma Portfolio

document.addEventListener('DOMContentLoaded', () => {

    /* =========================================
       1. Matrix Loading Sequence
       ========================================= */
    const loadingScreen = document.querySelector('.loading-screen');
    const matrixEntryText = document.getElementById('matrix-entry-text');

    // Matrix Rain Effect mapping onto the intro
    const mCanvas = document.getElementById('matrix-canvas');
    const mCtx = mCanvas.getContext('2d');

    mCanvas.width = window.innerWidth;
    mCanvas.height = window.innerHeight;

    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%^&*()';
    const fontSize = 14;
    const columns = mCanvas.width / fontSize;
    const drops = Array.from({ length: columns }).fill(1);

    function drawMatrix() {
        mCtx.fillStyle = 'rgba(0, 0, 0, 0.05)';
        mCtx.fillRect(0, 0, mCanvas.width, mCanvas.height);

        mCtx.fillStyle = '#0F0';
        mCtx.font = fontSize + 'px monospace';

        for (let i = 0; i < drops.length; i++) {
            const text = chars.charAt(Math.floor(Math.random() * chars.length));
            mCtx.fillText(text, i * fontSize, drops[i] * fontSize);

            if (drops[i] * fontSize > mCanvas.height && Math.random() > 0.975) {
                drops[i] = 0;
            }
            drops[i]++;
        }
    }

    const matrixInterval = setInterval(drawMatrix, 33);

    // Exit loading screen
    setTimeout(() => {
        matrixEntryText.innerText = "ACCESS GRANTED";
        setTimeout(() => {
            clearInterval(matrixInterval);
            loadingScreen.classList.add('hidden');
            initTypingEffect(); // start terminal type
        }, 800);
    }, 2000);

    /* =========================================
       2. Three.js Interactive Neural Background
       ========================================= */
    const container = document.getElementById('three-container');
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });

    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    container.appendChild(renderer.domElement);

    // Create particles
    const particleGeometry = new THREE.BufferGeometry();
    const particleCount = 200;

    const posArray = new Float32Array(particleCount * 3);
    // Create random spread between -10...10
    for (let i = 0; i < particleCount * 3; i++) {
        posArray[i] = (Math.random() - 0.5) * 20;
    }

    particleGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
    const particleMaterial = new THREE.PointsMaterial({
        size: 0.05,
        color: 0x00E6CC,
        transparent: true,
        opacity: 0.8
    });

    const particlesVector = new THREE.Points(particleGeometry, particleMaterial);
    scene.add(particlesVector);

    camera.position.z = 5;

    // Mouse Interaction
    let mouseX = 0;
    let mouseY = 0;
    let targetX = 0;
    let targetY = 0;

    document.addEventListener('mousemove', (event) => {
        mouseX = (event.clientX - window.innerWidth / 2) / 2000;
        mouseY = (event.clientY - window.innerHeight / 2) / 2000;
    });

    const clock = new THREE.Clock();

    function animateThree() {
        requestAnimationFrame(animateThree);
        const elapsedTime = clock.getElapsedTime();

        targetX = mouseX * 0.5;
        targetY = mouseY * 0.5;

        // Gentle rotation
        particlesVector.rotation.y += 0.001;
        particlesVector.rotation.x += 0.0005;

        // Smooth mouse follow
        particlesVector.rotation.y += (targetX - particlesVector.rotation.y) * 0.05;
        particlesVector.rotation.x += (targetY - particlesVector.rotation.x) * 0.05;

        // Subtle breathing
        particlesVector.position.y = Math.sin(elapsedTime * 0.5) * 0.1;

        renderer.render(scene, camera);
    }
    animateThree();

    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });

    /* =========================================
       3. Terminal Tabs & Typing Effect
       ========================================= */
    function initTypingEffect() {
        const lines = [
            document.getElementById('profile-line-1'),
            document.getElementById('profile-line-2'),
            document.getElementById('profile-line-3'),
            document.getElementById('profile-line-4')
        ];

        // Hide them initially
        lines.forEach(line => line.style.opacity = '0');

        let delay = 500;
        lines.forEach((line, index) => {
            setTimeout(() => {
                line.style.opacity = '1';
                // Very basic typing simulation: we just reveal it block by block
                const text = line.innerText || line.textContent;
                line.textContent = '';
                let i = 0;
                let currentStr = '';
                const typeInterval = setInterval(() => {
                    if (i < text.length) {
                        currentStr += text.charAt(i);
                        line.textContent = currentStr;
                        i++;
                    } else {
                        clearInterval(typeInterval);
                    }
                }, 15);
            }, delay);
            delay += 1000;
        });
    }

    // Global func for tabs
    window.showTab = function (tabId, el) {
        // Toggle active button
        document.querySelectorAll('.matrix-tab-button').forEach(b => b.classList.remove('active'));
        el.classList.add('active');

        // Toggle active content
        document.querySelectorAll('.matrix-tab-content').forEach(c => c.classList.remove('active-content'));
        document.getElementById(tabId).classList.add('active-content');
    };

    /* =========================================
       4. Minimax AI: Dots & Boxes Engine
       ========================================= */
    const gCanvas = document.getElementById('game-canvas');
    if (gCanvas) {
        const gCtx = gCanvas.getContext('2d');
        const grid = 3; // 3x3 boxes
        const dotGap = 90;
        const offset = 65;
        const lineTol = 15;

        let gameLines = [];
        let boxes = [];
        let dots = [];
        let turn = 'user'; // 'user' or 'ai'
        let userScore = 0;
        let aiScore = 0;

        const colorUser = '#E2EAF2';
        const colorAI = '#00E6CC';
        const colorEmpty = '#2A3642';

        // Initialize Game
        function initGame() {
            gameLines = [];
            boxes = [];
            dots = [];
            userScore = 0;
            aiScore = 0;
            turn = 'user';
            document.getElementById('score-user').innerText = '0';
            document.getElementById('score-ai').innerText = '0';
            document.getElementById('game-status').innerText = 'Your Turn (Select a Line)';
            document.getElementById('game-status').style.color = colorUser;

            // Create dots
            for (let i = 0; i <= grid; i++) {
                for (let j = 0; j <= grid; j++) {
                    dots.push({ x: offset + j * dotGap, y: offset + i * dotGap });
                }
            }

            // Create horizontal lines
            for (let i = 0; i <= grid; i++) {
                for (let j = 0; j < grid; j++) {
                    gameLines.push({
                        type: 'h', row: i, col: j,
                        x1: offset + j * dotGap, y1: offset + i * dotGap,
                        x2: offset + (j + 1) * dotGap, y2: offset + i * dotGap,
                        owner: null
                    });
                }
            }
            // Create vertical lines
            for (let i = 0; i < grid; i++) {
                for (let j = 0; j <= grid; j++) {
                    gameLines.push({
                        type: 'v', row: i, col: j,
                        x1: offset + j * dotGap, y1: offset + i * dotGap,
                        x2: offset + j * dotGap, y2: offset + (i + 1) * dotGap,
                        owner: null
                    });
                }
            }

            // Create boxes
            for (let i = 0; i < grid; i++) {
                for (let j = 0; j < grid; j++) {
                    boxes.push({
                        row: i, col: j, owner: null,
                        lines: [
                            getLine('h', i, j), // top
                            getLine('h', i + 1, j), // bottom
                            getLine('v', i, j), // left
                            getLine('v', i, j + 1) // right
                        ]
                    });
                }
            }
            drawGame();
        }

        function getLine(type, r, c) {
            return gameLines.find(l => l.type === type && l.row === r && l.col === c);
        }

        function drawGame() {
            gCtx.clearRect(0, 0, gCanvas.width, gCanvas.height);
            // Draw boxes
            boxes.forEach(b => {
                if (b.owner) {
                    gCtx.fillStyle = b.owner === 'user' ? 'rgba(226, 234, 242, 0.2)' : 'rgba(0, 230, 204, 0.2)';
                    gCtx.fillRect(offset + b.col * dotGap, offset + b.row * dotGap, dotGap, dotGap);
                }
            });
            // Draw gameLines
            gameLines.forEach(l => {
                gCtx.beginPath();
                gCtx.moveTo(l.x1, l.y1);
                gCtx.lineTo(l.x2, l.y2);
                gCtx.lineWidth = 6;
                if (l.owner === 'user') gCtx.strokeStyle = colorUser;
                else if (l.owner === 'ai') gCtx.strokeStyle = colorAI;
                else gCtx.strokeStyle = colorEmpty;
                gCtx.stroke();
            });
            // Draw dots
            dots.forEach(d => {
                gCtx.beginPath();
                gCtx.arc(d.x, d.y, 6, 0, Math.PI * 2);
                gCtx.fillStyle = '#93A1B5';
                gCtx.fill();
            });
        }

        function checkBoxes(player) {
            let scored = false;
            boxes.forEach(b => {
                if (!b.owner && b.lines.every(l => l.owner !== null)) {
                    b.owner = player;
                    scored = true;
                    if (player === 'user') userScore++;
                    else aiScore++;
                }
            });
            document.getElementById('score-user').innerText = userScore;
            document.getElementById('score-ai').innerText = aiScore;
            return scored;
        }

        function isGameOver() {
            if (gameLines.every(l => l.owner !== null)) {
                let msg = userScore > aiScore ? 'YOU WIN!' : (userScore < aiScore ? 'SYS.AI WINS!' : 'DRAW!');
                document.getElementById('game-status').innerText = `GAME OVER - ${msg}`;
                return true;
            }
            return false;
        }

        gCanvas.addEventListener('click', (e) => {
            if (turn !== 'user' || isGameOver()) return;
            const rect = gCanvas.getBoundingClientRect();

            // Adjust for scale since CSS box sizes canvas differently than actual pixels sometimes
            const scaleX = gCanvas.width / rect.width;
            const scaleY = gCanvas.height / rect.height;
            const x = (e.clientX - rect.left) * scaleX;
            const y = (e.clientY - rect.top) * scaleY;

            // Find closest empty line clicked
            let clickedLine = null;
            let minDist = Infinity;

            gameLines.forEach(l => {
                if (l.owner !== null) return;
                let dist = 1000;
                if (l.type === 'h') {
                    if (x >= l.x1 - lineTol && x <= l.x2 + lineTol) {
                        dist = Math.abs(y - l.y1);
                    }
                } else {
                    if (y >= l.y1 - lineTol && y <= l.y2 + lineTol) {
                        dist = Math.abs(x - l.x1);
                    }
                }
                if (dist < minDist && dist < lineTol) {
                    minDist = dist;
                    clickedLine = l;
                }
            });

            if (clickedLine) {
                clickedLine.owner = 'user';
                if (checkBoxes('user')) {
                    drawGame();
                    isGameOver();
                } else {
                    turn = 'ai';
                    document.getElementById('game-status').innerText = 'SYS.AI is computing...';
                    document.getElementById('game-status').style.color = colorAI;
                    drawGame();
                    setTimeout(aiMove, 600); // UI delay
                }
            }
        });

        function checkBoxesEval() {
            let s = 0;
            boxes.forEach(b => {
                if (!b.owner) {
                    let unownedCount = b.lines.filter(l => l.owner === null).length;
                    if (unownedCount === 0) s++; // would complete a box
                }
            });
            return s;
        }

        function aiMove() {
            if (isGameOver()) return;
            // Heuristic Evaluation wrapper
            // 1. Take any completing boxes
            let madeMove = false;
            let gaveBox = false;

            // Loop to take all available boxes in a chain
            while (true) {
                let tookBoxInLoop = false;
                for (let l of gameLines) {
                    if (!l.owner) {
                        l.owner = 'ai';
                        let scored = checkBoxesEval();
                        l.owner = null;
                        if (scored > 0) {
                            l.owner = 'ai';
                            checkBoxes('ai');
                            drawGame();
                            tookBoxInLoop = true;
                            madeMove = true;
                            break;
                        }
                    }
                }
                if (!tookBoxInLoop) break;
            }

            if (isGameOver()) return;

            // 2. If no completing boxes, pick a line that doesn't give a box to user
            if (!madeMove) {
                let safeLines = [];
                for (let l of gameLines) {
                    if (!l.owner) {
                        l.owner = 'ai';
                        let givesBox = false;
                        for (let b of boxes) {
                            if (!b.owner) {
                                let unownedCount = b.lines.filter(line => line.owner === null).length;
                                if (unownedCount === 1) { // User could take it
                                    givesBox = true;
                                    break;
                                }
                            }
                        }
                        if (!givesBox) safeLines.push(l);
                        l.owner = null;
                    }
                }

                if (safeLines.length > 0) {
                    let r = Math.floor(Math.random() * safeLines.length);
                    safeLines[r].owner = 'ai';
                } else {
                    // Forced to give a box, pick random empty
                    let empty = gameLines.filter(l => !l.owner);
                    let r = Math.floor(Math.random() * empty.length);
                    empty[r].owner = 'ai';
                    gaveBox = true;
                }
            }

            // Check if we scored on the final forced move or if AI just finished a move
            if (checkBoxes('ai') || madeMove && !gaveBox) {
                drawGame();
                if (!isGameOver()) {
                    setTimeout(aiMove, 600); // AI gets another turn
                }
            } else {
                turn = 'user';
                document.getElementById('game-status').innerText = 'Your Turn (Select a Line)';
                document.getElementById('game-status').style.color = colorUser;
                drawGame();
                isGameOver();
            }
        }

        document.getElementById('btn-restart').addEventListener('click', initGame);
        initGame();
    }

    /* =========================================
       5. Chatbot Interface
       ========================================= */
    const chatContainer = document.getElementById('chatbot-container');
    const chatToggle = document.getElementById('chatbot-toggle');
    const chatClose = document.getElementById('chatbot-close');
    const chatInput = document.getElementById('chatbot-input');
    const chatSend = document.getElementById('chatbot-send');
    const messagesBody = document.getElementById('chatbot-messages');

    let welcomeShown = false;
    chatToggle.addEventListener('click', () => {
        chatContainer.classList.remove('chatbot-hidden');
        if (!welcomeShown) {
            welcomeShown = true;
            setTimeout(() => {
                const welcomeText = "Agent_Sharma_Core online. Systems synchronized. I am an interactive intelligence agent for Abhigyan Sharma — Agentic AI & ML Enthusiast, IIT Bhilai. I have indexed all 18 project databanks, 11 technical capability domains, competitive achievements, and research systems. Query me or select a protocol chip below.";
                appendMessage('bot', welcomeText, true);
            }, 300);
        }
    });

    chatClose.addEventListener('click', () => {
        chatContainer.classList.add('chatbot-hidden');
    });

    function appendMessage(sender, text, typewriter = false) {
        const div = document.createElement('div');
        div.className = `message ${sender}-message`;
        const prefix = sender === 'user' ? '[USER]:' : '[SYS.AI]:';

        if (sender === 'user' || !typewriter) {
            div.innerHTML = `<span class="message-prefix">${prefix}</span><span class="message-text">${text}</span>`;
            messagesBody.appendChild(div);
        } else {
            // Typewriter effect for bot
            div.innerHTML = `<span class="message-prefix">${prefix}</span><span class="message-text"></span><span class="typing-cursor"></span>`;
            messagesBody.appendChild(div);
            const textSpan = div.querySelector('.message-text');
            const cursor = div.querySelector('.typing-cursor');
            let i = 0;
            // Strip HTML tags for clean typewriter display, then render complete HTML at end
            const plainText = text.replace(/<[^>]*>/g, '');
            const interval = setInterval(() => {
                if (i < plainText.length) {
                    textSpan.textContent += plainText.charAt(i);
                    i++;
                    messagesBody.scrollTop = messagesBody.scrollHeight;
                } else {
                    clearInterval(interval);
                    cursor.remove();
                    if (text.includes('<')) {
                        textSpan.innerHTML = text;
                    }
                }
            }, 10);
        }
        messagesBody.scrollTop = messagesBody.scrollHeight;
    }

    function processQuery(query) {
        appendMessage('user', query);
        chatInput.value = '';

        const statusText = document.getElementById('chatbot-status-text');
        const oldStatus = statusText.textContent;
        statusText.textContent = "Status: ANALYSING_QUERY...";
        statusText.style.color = "var(--accent-primary)";

        const q = query.toLowerCase().trim();
        let response = "";

        // =========================================================================
        // 1. SPECIFIC PROJECTS (Prioritized to avoid generic keyword collisions)
        // =========================================================================

        if (q.includes('sentinel') || q.includes('aegis') || q.includes('red team') || q.includes('red-team') || q.includes('jailbreak') || q.includes('prompt injection') || q.includes('context firewall') || q.includes('ai app security') || q.includes('ai security')) {
            response = "Sentinel Aegis is a local, portfolio-grade AI application security and red-teaming platform. It demonstrates practical controls for prompt injection detection, jailbreaks, PII redaction, context firewalls for RAG retrieval, policy-based tool authorization, adversarial attack campaigns, and automated CI security gates.";

        } else if (q.includes('aeip') || q.includes('autonomous engineering') || q.includes('sre agent') || q.includes('sre platform') || q.includes('root cause analysis') || q.includes('blast-radius') || q.includes('fast-loop')) {
            response = "The Autonomous Engineering Intelligence Platform (AEIP) is a full-lifecycle autonomous SRE agent platform for production software engineering and infrastructure management. Built with LangGraph, FastAPI, and Next.js, it features dual-loop architecture (fast-loop triage & slow-loop deep investigation), multi-agent investigation teams, root cause analysis, automated remediation plans with blast-radius analysis, and human approvals.";

        } else if (q.includes('toolforge') || q.includes('mcp') || q.includes('model context protocol') || q.includes('agent tool') || q.includes('governed code') || q.includes('tool execution')) {
            response = "ToolForge is a production-ready agent tool execution runtime and Model Context Protocol (MCP) server implementation. It features governed code execution, 26 standard tools across filesystem, system, and web APIs, hybrid capability-based security and RBAC, token-budgeted outputs, SQLite audit logging, and sustained throughput of 533+ ops/sec with sub-millisecond p95 latency.";

        } else if (q.includes('winguard') || q.includes('job object') || q.includes('restricted token') || q.includes('process isolation') || q.includes('cpu throttling') || q.includes('telemetry loop')) {
            response = "The WinGuard Framework is a zero-dependency C security framework leveraging native Win32 APIs (Job Objects, Restricted Security Tokens, IO Completion Ports) to implement an adaptive 3-tier containment system for untrusted Windows processes with a 25ms telemetry feedback loop, dynamic privilege stripping, memory limiting, and real-time CPU throttling.";

        } else if (q.includes('peerscribe') || q.includes('clinical') || (q.includes('p2p') && !q.includes('pix2pix')) || q.includes('mesh network') || q.includes('delay-tolerant') || q.includes('dtn') || q.includes('vector clock')) {
            response = "PeerScribe is an offline-first, peer-to-peer clinical documentation and disaster response mesh network. Built with Node.js, SQLite WAL mode, and CRDT vector clocks for conflict-free multi-medic synchronization, it features START disaster triage, voice memo queues, and a Delay-Tolerant Networking (DTN) epidemic protocol designed for zero-connectivity field operations.";

        } else if (q.includes('risk manager') || q.includes('fraud') || q.includes('merchant') || q.includes('expected loss') || q.includes('insult cost') || q.includes('cost-sensitive')) {
            response = "The AI Risk Manager is a real-time merchant fraud prevention engine processing 500,000+ transactions with expected loss decisioning that dynamically balances fraud losses against false-positive customer insult costs. It integrates XGBoost, LightGBM, and Isolation Forest models with SHAP reasoning and an interactive Streamlit simulation.";

        } else if (q.includes('strategic trade') || q.includes('trade analyzer') || q.includes('trading') || q.includes('backtest') || q.includes('lookahead') || q.includes('look-ahead') || q.includes('monte carlo') || q.includes('quant')) {
            response = "The Strategic Trade Analyzer is an algorithmic trading backtesting engine and risk gating pipeline with strict anti-lookahead guarantees, realistic transaction costs, and portfolio constraints. Features event-driven backtesting across technical strategies, ML trade validation via XGBoost probability scoring, Monte Carlo stress testing, and a comprehensive 609-test test suite.";

        } else if (q.includes('thz') || q.includes('terahertz') || q.includes('ap deployment') || q.includes('human mobility') || q.includes('pulp') || q.includes('highs') || q.includes('beamwidth') || q.includes('molecular absorption')) {
            response = "The Volumetric THz AP Deployment project is an optimization engine and 3D propagation physics simulator for deploying directional Terahertz Access Points in indoor spaces. Powered by Mixed-Integer Linear Programming (MILP via PuLP and HiGHS), it models molecular absorption, hardware beamwidth trade-offs, and dynamic human blockage resilience using real-world pedestrian trajectory data.";

        } else if (q.includes('village pond') || (q.includes('pond') && !q.includes('poetry')) || q.includes('hydrological') || q.includes('runoff') || q.includes('catchment') || (q.includes('dem') && !q.includes('demo'))) {
            response = "The Village Pond Planning System is an automated geospatial and hydrological planning platform to optimize village pond site selection and catchment management. It combines DEM terrain analysis, multi-criteria land suitability modeling, Open-Meteo runoff calculations, and interactive 3D visualizations to promote sustainable rural water conservation.";

        } else if (q.includes('shiksha') || q.includes('siksha') || q.includes('sarthi') || q.includes('edtech') || q.includes('school') || q.includes('classroom')) {
            response = "ShikshaSarthi is a full-stack, offline-first school learning platform built for classrooms with unreliable internet. Each school runs the entire app (React frontend, Node/Express API, MongoDB) on a local Docker server, while a small AWS cloud service handles versioned updates, checksum-verified installs, backups, and bidirectional data sync. It features role-based access, adaptive testing, quiz analytics, and Gemini AI hints.";

        } else if (q.includes('autograder') || q.includes('grading') || q.includes('grader') || q.includes('code grading')) {
            response = "AutoGrader is an end-to-end GenAI code-grading platform for CS education. It uses Docker-sandboxed multi-language execution (Python, C, Java), a Django/DRF + Celery/Redis backend for concurrent grading at scale, and a local LLM feedback pipeline (Ollama: Llama 3 / Mistral) that delivers rubric-aligned pedagogical feedback — achieving 85% evaluation accuracy on open-ended answers.";

        } else if (q.includes('deepfake') || q.includes('forgery') || q.includes('spatial-temporal') || (q.includes('vit') && q.includes('lstm'))) {
            response = "His Spatial-Temporal-Frequency Deepfake Detection model is a video detector fusing three branches: Facial Component Guidance attention on ViT-L/14 spatial features, a Bi-LSTM over per-frame CLS token sequences for temporal cues, and block-DCT spectral analysis for compression artifacts. Optimized with gradient checkpointing and layer pruning to train under constrained (6GB) GPU VRAM.";

        } else if (q.includes('pix2pix') || q.includes('patchgan') || (q.includes('gan') && !q.includes('agent'))) {
            response = "Abhigyan architected a Structure-Aware Multi-Scale Pix2Pix GAN in PyTorch. It uses U-Net generators and PatchGAN discriminators with multi-scale feature extraction plus perceptual and edge-consistency losses, trained on 12k image pairs to improve SSIM by 0.08 over the standard baseline.";

        } else if ((q.includes('sql') && q.includes('agent')) || q.includes('nl-to-sql') || q.includes('nl2sql') || q.includes('natural language to sql')) {
            response = "The Intelligent SQL Agent is an LLM-powered system (OpenAI/Mistral) that converts plain English into safe, schema-aware SQL queries — automatically identifying relevant tables, executing queries securely against a live database, and returning structured results via LLM-driven reasoning chains.";

        } else if (q.includes('b+ tree') || q.includes('b+tree') || q.includes('b-tree') || q.includes('dbms index') || q.includes('page management') || (q.includes('tree') && q.includes('disk'))) {
            response = "The Disk-Based B+ Tree Index is a persistent database index engine built from scratch in C++ using memory-mapped I/O. It delivers O(log n) lookups with automatic node splitting and 4096-byte page management, scaling to datasets larger than available RAM.";

        } else if (q.includes('poetry') || q.includes('verse') || q.includes('reciprocal')) {
            response = "The Reciprocal Contextual Poetry Generation model fuses contextual embeddings, sequence layers, and attention blocks with reinforcement learning from human feedback. It builds a reciprocal context-learning flow where each generated verse conditions the next for semantic coherence, trained on 5,000+ texts to model human-AI creative collaboration.";

        } else if (q.includes('hmm') || q.includes('hidden markov') || q.includes('penalized likelihood') || (q.includes('markov') && q.includes('synthetic'))) {
            response = "The HMM project validates an advanced model-order selection algorithm against synthetic sequence data, automatically computing the optimal number of hidden states via dynamic penalized likelihood scoring to recover underlying structural data dynamics.";

        } else if (q.includes('eadip') || (q.includes('enterprise') && q.includes('data')) || (q.includes('multi-agent') && q.includes('platform')) || (q.includes('langgraph') && q.includes('data'))) {
            response = "The Enterprise AI Data Intelligence Platform is a production-grade, local-first multi-agent system built on LangGraph. It lets data/ML engineers conversationally investigate ETL pipelines, Airflow DAGs, data lineage, and SQL warehouses — featuring dynamic fan-out routing, Self-RAG hallucination validation, hybrid dense+BM25 retrieval with cross-encoder reranking, and a Next.js observability UI.";

        // =========================================================================
        // 2. TECHNICAL CAPABILITIES (11 Specific Domains)
        // =========================================================================

        } else if (q.includes('agentic') || (q.includes('agent') && !q.includes('sql') && !q.includes('sre')) || q.includes('langgraph') || q.includes('tool calling') || q.includes('pydantic') || q.includes('human-in-the-loop') || q.includes('token budget')) {
            response = "Abhigyan's Generative AI & Agentic Systems competency covers LLM Fine-Tuning (LoRA & PEFT), LangChain & LangGraph multi-agent coordination, Hugging Face Transformers, Ollama & local deployment, Model Context Protocol (MCP), structured outputs via Pydantic & JSON Schema, prompt evaluation, token budgets, and human-in-the-loop governance (demonstrated in AEIP & ToolForge).";

        } else if (q.includes('rag') || q.includes('retrieval') || q.includes('qdrant') || q.includes('faiss') || q.includes('pinecone') || q.includes('llamaindex') || q.includes('vector search') || q.includes('rerank')) {
            response = "In RAG, Search & Knowledge Systems, Abhigyan architects hybrid dense + BM25 retrieval pipelines, vector search engines (Qdrant, FAISS, Pinecone), cross-encoder reranking, retrieval-grounded response validation, evidence provenance, and schema-aware NL-to-SQL generation.";

        } else if (q.includes('systems security') || (q.includes('systems') && q.includes('engineer')) || q.includes('process isolation') || q.includes('sandboxing') || q.includes('job objects') || q.includes('restricted tokens') || q.includes('least privilege') || q.includes('win32')) {
            response = "In Systems Engineering, Security & Reliability, Abhigyan specializes in native C/Win32 systems programming, Windows Job Objects, restricted token sandboxing, 25ms telemetry monitoring loops, capability-based least privilege, async concurrency, exponential backoff retries, and fault recovery (proven in WinGuard and ToolForge).";

        } else if (q.includes('computer vision') || q.includes('vision') || q.includes('vit') || q.includes('clip') || q.includes('cnn') || q.includes('deep learning') || q.includes('image processing')) {
            response = "In Machine Learning & Computer Vision, Abhigyan designs CNNs, Vision Transformers (ViT-L/14), CLIP cross-modal attention, GANs (Multi-Scale Pix2Pix), LSTMs/Bi-LSTMs, gradient-checkpointed memory optimization, and explainable AI with SHAP.";

        } else if (q.includes('backend') || q.includes('full-stack') || q.includes('full stack') || q.includes('fastapi') || q.includes('django') || q.includes('flask') || q.includes('react') || q.includes('next.js') || q.includes('rest api')) {
            response = "His backend & full-stack engineering toolkit includes FastAPI, Flask, Django/DRF, Node.js & Express, React, Next.js, Server-Sent Events (SSE), JWT authentication, RBAC, Celery & Redis task queues, PostgreSQL, MongoDB, and offline-first web architecture.";

        } else if (q.includes('data engineering') || q.includes('spark') || q.includes('kafka') || q.includes('airflow') || q.includes('etl') || q.includes('pipeline') || q.includes('data lineage') || q.includes('wal')) {
            response = "His data engineering toolkit spans Apache Spark, Kafka, Airflow, ETL/ELT pipeline design, data lineage & warehousing, async task queues (Celery, Redis), SQLite Write-Ahead Logging (WAL), DBMS indexing (B+ Trees), and memory-mapped I/O.";

        } else if (q.includes('distributed') || q.includes('offline-first') || q.includes('offline first') || q.includes('local-first') || q.includes('crdt') || q.includes('vector clock') || q.includes('p2p') || q.includes('mesh') || q.includes('nostr') || q.includes('dtn')) {
            response = "In Distributed & Offline-First Systems, Abhigyan builds resilient architectures with CRDTs, vector clocks, bidirectional synchronization, peer-to-peer replication (BLE, Wi-Fi Direct), Delay-Tolerant Networking (DTN), and Nostr relay-based propagation.";

        } else if (q.includes('mlops') || q.includes('docker') || q.includes('kubernetes') || q.includes('k8s') || q.includes('github actions') || q.includes('ci/cd') || q.includes('mlflow') || q.includes('prometheus') || q.includes('grafana') || q.includes('cloud')) {
            response = "In MLOps, Cloud & Observability, he works with Docker & Docker Compose, GitHub Actions CI/CD, AWS deployments & sync, ML model serving, MLflow experiment tracking, Prometheus & Grafana telemetry, structured logging, and Kubernetes fundamentals.";

        } else if (q.includes('fintech') || q.includes('fraud detection') || q.includes('risk analytics') || q.includes('expected-loss')) {
            response = "In FinTech, Fraud & Risk Analytics, Abhigyan develops transaction fraud detection, anomaly detection, cost-sensitive classification, expected-loss decisioning, look-ahead bias prevention, and Monte Carlo stress testing pipelines (modeling and simulation).";

        } else if (q.includes('geospatial') || q.includes('gis') || q.includes('optimization') || q.includes('milp') || q.includes('linear programming') || q.includes('hydrology') || q.includes('terrain')) {
            response = "In Geospatial & Mathematical Optimization, he works with DEM processing, terrain/slope/aspect analysis, watershed & hydrological runoff modeling, GeoJSON/KML, Delaunay triangulation, and Mixed-Integer Linear Programming (MILP via PuLP and HiGHS).";

        } else if (q.includes('programming') || q.includes('languages') || q.includes('c++') || q.includes('python') || q.includes('java') || q.includes('typescript') || q.includes('javascript') || q.includes('dsa') || q.includes('oop')) {
            response = "Abhigyan is proficient in Python, C++, C, Java, JavaScript, TypeScript, and SQL, with deep foundations in Data Structures & Algorithms, Object-Oriented Programming, Git, Linux, and Bash scripting.";

        } else if (q.includes('skill') || q.includes('tech') || q.includes('capabilities') || q.includes('stack') || q.includes('competenc') || q.includes('ai ') || q.includes('ml ')) {
            response = "Abhigyan's technical capabilities are structured across 11 key domains: 1. Programming & CS, 2. Machine Learning & CV, 3. Generative AI & Agentic Systems, 4. RAG & Knowledge Systems, 5. Backend & Full-Stack, 6. Data Engineering, 7. Systems Engineering & Security, 8. MLOps & Observability, 9. Distributed & Offline-First, 10. FinTech & Risk, and 11. Geospatial & Mathematical Optimization. Check the Technical Capabilities section above for the full breakdown!";

        // =========================================================================
        // 3. PROFILE, CREDENTIALS, RESUME & ACHIEVEMENTS
        // =========================================================================

        } else if (q.includes('resume') || q.includes('cv') || q.includes('download')) {
            response = "Abhigyan's verified resume is ready for download: <a href='https://drive.google.com/file/d/1G8MT8imqC3nZCGMup5xGNaiIwzagdiip/view?usp=drive_link' target='_blank' style='color:var(--accent-primary);text-decoration:underline;font-weight:bold;'>[Download Resume (PDF)]</a>. You can also trigger the secure terminal download button ('wget --secure Abhigyan_Sharma_Resume.pdf') in the Comm Link section below.";

        } else if (q.includes('who') || q.includes('about') || q.includes('abhigyan') || q.includes('himself') || q.includes('profile') || q.includes('bio')) {
            response = "Abhigyan Sharma is an Agentic AI and ML Enthusiast and Data Science & AI undergraduate at IIT Bhilai (CGPA 8.00/10, class of 2027). He specializes in multi-agent LLM systems (LangGraph, MCP), computer vision (ViT, CLIP, GANs), systems security & process isolation (Win32), and resilient data engineering pipelines. He has built 18 production-grade databanks ranging from autonomous SREs to P2P disaster mesh networks.";

        } else if (q.includes('amazon') || q.includes('codeforces') || q.includes('hackercup') || q.includes('rating') || q.includes('specialist') || q.includes('achievement') || q.includes('award') || q.includes('accomplish') || q.includes('contest') || q.includes('competitive') || q.includes(' cp')) {
            response = "Key achievements: All India Rank 7445 in JEE Advanced 2023; Specialist on Codeforces (Max Rating: 1436); Meta HackerCup'25 Round-2 Qualifier; Ranked 278th nationwide in Amazon ML Challenge 2025 (Score: 46.649); and NCC 'A' Certificate holder (A grade).";

        } else if (q.includes('rank') || q.includes('jee')) {
            response = "Abhigyan secured an All India Rank (AIR) of 7445 in the JEE Advanced 2023 examination, and is currently pursuing B.Tech in Data Science & AI at IIT Bhilai.";

        } else if (q.includes('education') || q.includes('college') || q.includes('degree') || q.includes('cgpa') || q.includes('study') || q.includes('iit') || q.includes('school')) {
            response = "Education: B.Tech in Data Science & Artificial Intelligence at IIT Bhilai (expected May 2027, CGPA 8.00/10). Completed Class XII from Sai RNS Academy (AISSCE, 91.2%) and Class X from Sainik School Goalpara (AISSE, 96.2%).";

        } else if (q.includes('leadership') || q.includes('lead') || q.includes('e-cell') || q.includes('committee') || q.includes('organiz') || q.includes('meraz') || q.includes('mun')) {
            response = "Leadership & Activities: Core Member of the Entrepreneurship Cell at IIT Bhilai (organized TED-style talks & pitching events); Logistics Organizer for Meraz 6.0 (2000+ attendees); Chair of IIT Bhilai MUN'24; Mess Coordinator; and placement cell support volunteer.";

        } else if (q.includes('intern') || q.includes('available') || q.includes('hire') || q.includes('hiring') || q.includes('opportunit') || q.includes('job') || q.includes('recruit') || q.includes('contact') || q.includes('email') || q.includes('reach') || q.includes('linkedin') || q.includes('connect')) {
            response = "Abhigyan is actively exploring AI/ML opportunities, data science internships, and systems engineering collaborations. Connect via email at <a href='mailto:abhigyan.sharma6091@gmail.com' style='color:var(--accent-primary);text-decoration:underline;'>abhigyan.sharma6091@gmail.com</a>, LinkedIn (<a href='https://www.linkedin.com/in/abhigyan-sharma-6091' target='_blank' style='color:var(--accent-primary);text-decoration:underline;'>in/abhigyan-sharma-6091</a>), or inspect his code on GitHub (<a href='https://github.com/Abhigyan6091' target='_blank' style='color:var(--accent-primary);text-decoration:underline;'>@Abhigyan6091</a>).";

        } else if (q.includes('game') || q.includes('dots') || q.includes('boxes') || q.includes('minimax') || q.includes('alpha-beta') || q.includes('alpha beta')) {
            response = "Challenge Abhigyan's Minimax AI with Alpha-Beta Pruning in the Dots & Boxes section on this page! It computes optimal moves across custom grid dimensions and preset configurations.";

        } else if (q.includes('project') || q.includes('work') || q.includes('portfolio') || q.includes('databank') || q.includes('carousel') || q.includes('built') || q.includes('repo')) {
            response = "Abhigyan's portfolio features 18 databanks in an interactive 3D circular carousel above, including Sentinel Aegis (AI App Security), Volumetric THz AP Deployment, Autonomous Engineering Intelligence Platform (AEIP), ToolForge (MCP), AI Risk Manager, Strategic Trade Analyzer, Village Pond Planning, WinGuard, PeerScribe, ShikshaSarthi, AutoGrader, Pix2Pix GAN, Deepfake Detection, and more. Drag horizontally or use the arrows on the carousel to inspect them!";

        } else if (q.includes('hello') || q.includes('hi ') || q === 'hi' || q.includes('hey') || q.includes('greet') || q.includes('help') || q.includes('commands') || q.includes('menu')) {
            response = "Agent_Sharma_Core ready. You can query me on: 1. Specific projects ('AEIP', 'ToolForge', 'Sentinel Aegis', 'WinGuard'), 2. Technical capabilities ('Agentic AI', 'RAG', 'Systems Security'), 3. Achievements ('Codeforces', 'Amazon ML Challenge', 'JEE'), 4. Credentials ('Education', 'Resume', 'Contact').";

        } else {
            response = "Query parameters outside direct index. You can ask about:\n• 18 Project Databanks (e.g. 'AEIP', 'ToolForge', 'Sentinel Aegis', 'WinGuard', 'PeerScribe')\n• 11 Capability Domains (e.g. 'Agentic AI', 'Computer Vision', 'Systems Security', 'RAG')\n• Academic & Contest Credentials ('Education', 'JEE Rank', 'Codeforces', 'Amazon ML Challenge')\n• Direct Links ('Resume', 'GitHub', 'Contact')";
        }

        setTimeout(() => {
            statusText.textContent = "Status: ACCESSING_ARCHIVES...";
            setTimeout(() => {
                appendMessage('bot', response, true);
                statusText.textContent = oldStatus;
                statusText.style.color = "";
            }, 350);
        }, 400);
    }

    chatSend.addEventListener('click', () => {
        if (chatInput.value.trim() !== '') processQuery(chatInput.value);
    });

    chatInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && chatInput.value.trim() !== '') processQuery(chatInput.value);
    });

    document.querySelectorAll('.suggestion-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            processQuery(e.target.getAttribute('data-question'));
        });
    });

    /* =========================================
       6. 3D Circular Project Carousel Engine
       ========================================= */
    function init3DProjectCarousel() {
        const stageContainer = document.getElementById('project-carousel-container');
        const stage = document.getElementById('carousel-stage');
        const ring = document.getElementById('carousel-ring');
        if (!stageContainer || !stage || !ring) return;

        const cards = Array.from(ring.querySelectorAll('.carousel-card'));
        const totalCards = cards.length;
        if (totalCards === 0) return;

        const prevBtn = document.getElementById('carousel-prev');
        const nextBtn = document.getElementById('carousel-next');
        const currentCounter = document.getElementById('carousel-current');
        const totalCounter = document.getElementById('carousel-total');
        const dotsContainer = document.getElementById('carousel-dots');

        // Dynamic 3D Geometry calculation
        const angleStep = 360 / totalCards;
        let radius = 800; // dynamically calculated based on card width
        let currentRotation = 0; // in degrees
        let targetRotation = 0;
        let activeIndex = 0;

        // Interaction state
        let isPointerDown = false;
        let startX = 0;
        let startY = 0;
        let startRotation = 0;
        let lastX = 0;
        let lastTime = 0;
        let velocity = 0;
        let hasDragged = false;
        let suppressLinkClick = false;
        let suppressTimeout = null;

        // Update total counter in HUD
        if (totalCounter) {
            totalCounter.textContent = String(totalCards).padStart(2, '0');
        }

        // Build pagination dots dynamically
        if (dotsContainer) {
            dotsContainer.innerHTML = '';
            cards.forEach((card, i) => {
                const dot = document.createElement('button');
                dot.className = 'carousel-dot' + (i === 0 ? ' active' : '');
                const titleText = card.querySelector('h3')?.textContent || `Project ${i + 1}`;
                dot.setAttribute('aria-label', `Navigate to project ${i + 1}: ${titleText}`);
                dot.setAttribute('role', 'tab');
                dot.setAttribute('aria-selected', i === 0 ? 'true' : 'false');
                dot.setAttribute('tabindex', '0');
                dot.addEventListener('click', (e) => {
                    e.stopPropagation();
                    rotateToCard(i);
                });
                dotsContainer.appendChild(dot);
            });
        }

        const dots = dotsContainer ? Array.from(dotsContainer.querySelectorAll('.carousel-dot')) : [];

        // Compute geometry based on actual DOM measurements
        function computeRadius() {
            // Read width of a card (or fallback to 350)
            const cardWidth = cards[0].offsetWidth || 350;
            // Radius of regular N-gon: R = (W / 2) / tan(PI / N)
            const calculatedRadius = Math.round((cardWidth / 2) / Math.tan(Math.PI / totalCards));
            // Add margin for clear separation and aesthetic arc curvature
            radius = Math.max(calculatedRadius + 30, 480);

            // Position each card on the 3D ring
            cards.forEach((card, index) => {
                const cardAngle = index * angleStep;
                card.style.transform = `rotateY(${cardAngle}deg) translateZ(${radius}px)`;
            });

            // Update ring position and visual depth classes
            applyRingTransform(currentRotation, false);
            updateCardVisualStates(currentRotation);
        }

        // Apply transform to virtual ring
        function applyRingTransform(deg, withTransition = true) {
            if (withTransition) {
                ring.style.transition = 'transform 0.5s cubic-bezier(0.16, 1, 0.3, 1)';
            } else {
                ring.style.transition = 'none';
            }
            ring.style.transform = `translateZ(-${radius}px) rotateY(${deg}deg)`;
        }

        // Normalize angle to [-180, 180]
        function normalizeAngle(deg) {
            return ((((deg % 360) + 540) % 360) - 180);
        }

        // Update card visual prominence (active vs neighbor vs hidden)
        function updateCardVisualStates(deg) {
            // Find active index based on rotation
            const rawIndex = Math.round(-deg / angleStep);
            activeIndex = (((rawIndex % totalCards) + totalCards) % totalCards);

            // Update HUD counter
            if (currentCounter) {
                currentCounter.textContent = String(activeIndex + 1).padStart(2, '0');
            }

            // Update dots
            dots.forEach((dot, i) => {
                const isActive = (i === activeIndex);
                dot.classList.toggle('active', isActive);
                dot.setAttribute('aria-selected', isActive ? 'true' : 'false');
            });

            // Update each card depth & classes
            cards.forEach((card, i) => {
                const cardAngle = i * angleStep;
                const relativeAngle = Math.abs(normalizeAngle(cardAngle + deg));

                card.classList.remove('is-active-card', 'is-neighbor-card', 'is-far-card', 'is-hidden-card');

                if (i === activeIndex) {
                    card.classList.add('is-active-card');
                    card.setAttribute('aria-hidden', 'false');
                    card.tabIndex = 0;
                } else if (relativeAngle < angleStep * 1.5) {
                    card.classList.add('is-neighbor-card');
                    card.setAttribute('aria-hidden', 'false');
                    card.tabIndex = -1;
                } else if (relativeAngle < 85) {
                    card.classList.add('is-far-card');
                    card.setAttribute('aria-hidden', 'false');
                    card.tabIndex = -1;
                } else {
                    card.classList.add('is-hidden-card');
                    card.setAttribute('aria-hidden', 'true');
                    card.tabIndex = -1;
                }
            });
        }

        // Navigate to a specific card index by shortest path
        function rotateToCard(targetIdx) {
            const normalizedTarget = (((targetIdx % totalCards) + totalCards) % totalCards);
            const currentNorm = (((activeIndex % totalCards) + totalCards) % totalCards);
            let diff = normalizedTarget - currentNorm;

            // Shortest rotational path around circle
            if (diff > totalCards / 2) diff -= totalCards;
            if (diff < -totalCards / 2) diff += totalCards;

            const steps = diff;
            const newTargetRotation = targetRotation - steps * angleStep;
            
            targetRotation = newTargetRotation;
            currentRotation = targetRotation;
            applyRingTransform(currentRotation, true);
            updateCardVisualStates(currentRotation);
        }

        function rotateToPrev() {
            targetRotation += angleStep;
            currentRotation = targetRotation;
            applyRingTransform(currentRotation, true);
            updateCardVisualStates(currentRotation);
        }

        function rotateToNext() {
            targetRotation -= angleStep;
            currentRotation = targetRotation;
            applyRingTransform(currentRotation, true);
            updateCardVisualStates(currentRotation);
        }

        // Pointer event handlers (mouse + touch unified)
        function onPointerDown(e) {
            // Ignore if secondary mouse button
            if (e.pointerType === 'mouse' && e.button !== 0) return;

            isPointerDown = true;
            hasDragged = false;
            startX = e.clientX;
            startY = e.clientY;
            startRotation = currentRotation;
            lastX = e.clientX;
            lastTime = performance.now();
            velocity = 0;

            stage.classList.add('is-dragging');
            ring.style.transition = 'none';

            // Capture pointer for smooth dragging even outside container
            if (stage.setPointerCapture) {
                try { stage.setPointerCapture(e.pointerId); } catch (_) {}
            }
        }

        function onPointerMove(e) {
            if (!isPointerDown) return;

            const deltaX = e.clientX - startX;
            const deltaY = e.clientY - startY;
            const dist = Math.hypot(deltaX, deltaY);

            if (dist > 7) {
                hasDragged = true;
            }

            // Calculate velocity
            const now = performance.now();
            const dt = Math.max(now - lastTime, 1);
            velocity = (e.clientX - lastX) / dt;
            lastX = e.clientX;
            lastTime = now;

            // Tangential sensitivity: ~0.18 deg/px
            const sensitivity = 0.18;
            currentRotation = startRotation + deltaX * sensitivity;

            applyRingTransform(currentRotation, false);
            updateCardVisualStates(currentRotation);
        }

        function onPointerUp(e) {
            if (!isPointerDown) return;
            isPointerDown = false;
            stage.classList.remove('is-dragging');

            if (stage.releasePointerCapture) {
                try { stage.releasePointerCapture(e.pointerId); } catch (_) {}
            }

            if (hasDragged) {
                suppressLinkClick = true;
                clearTimeout(suppressTimeout);
                suppressTimeout = setTimeout(() => {
                    suppressLinkClick = false;
                }, 150);

                // Inertia & Snap to nearest card
                let snapIndex = Math.round(-currentRotation / angleStep);
                if (velocity > 0.45) {
                    snapIndex = Math.floor(-currentRotation / angleStep);
                } else if (velocity < -0.45) {
                    snapIndex = Math.ceil(-currentRotation / angleStep);
                }

                targetRotation = -snapIndex * angleStep;
                currentRotation = targetRotation;
                applyRingTransform(currentRotation, true);
                updateCardVisualStates(currentRotation);
            }
        }

        function onPointerCancel(e) {
            if (!isPointerDown) return;
            onPointerUp(e);
        }

        // Attach pointer listeners to stage
        stage.addEventListener('pointerdown', onPointerDown);
        stage.addEventListener('pointermove', onPointerMove);
        stage.addEventListener('pointerup', onPointerUp);
        stage.addEventListener('pointercancel', onPointerCancel);

        // Prevent accidental link activation during drag and handle card click
        cards.forEach((card, idx) => {
            card.addEventListener('click', (e) => {
                if (hasDragged || suppressLinkClick) {
                    e.preventDefault();
                    e.stopPropagation();
                    return;
                }

                const link = e.target.closest('a');
                if (idx !== activeIndex) {
                    // Clicking non-active card brings it to the front
                    e.preventDefault();
                    rotateToCard(idx);
                } else {
                    // On active card, clicking link is allowed
                    if (!link) {
                        // Card is already active
                    }
                }
            });

            // If card gains focus via Tab key, rotate to it
            card.addEventListener('focusin', () => {
                if (idx !== activeIndex && !isPointerDown) {
                    rotateToCard(idx);
                }
            });
        });

        // Arrow button listeners
        if (prevBtn) prevBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            rotateToPrev();
        });

        if (nextBtn) nextBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            rotateToNext();
        });

        // Keyboard navigation on container
        stageContainer.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowLeft') {
                e.preventDefault();
                rotateToPrev();
            } else if (e.key === 'ArrowRight') {
                e.preventDefault();
                rotateToNext();
            }
        });

        // Window resize handling (debounced)
        let resizeTimer;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimer);
            resizeTimer = setTimeout(() => {
                computeRadius();
            }, 100);
        });

        // Initial compute and setup
        computeRadius();
    }

    // Initialize 3D Project Carousel
    init3DProjectCarousel();
});

