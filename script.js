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
                const welcomeText = "Greetings user. I am Agent_Sharma_Core—an AI representation of Abhigyan's profile. I can recount research on deepfake detection, HMM flight dynamics, SQL agents, and more. Query me.";
                appendMessage('bot', welcomeText, true);
            }, 500);
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
            const interval = setInterval(() => {
                if (i < text.length) {
                    textSpan.textContent += text.charAt(i);
                    i++;
                    messagesBody.scrollTop = messagesBody.scrollHeight;
                } else {
                    clearInterval(interval);
                    cursor.remove();
                }
            }, 20);
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

        // Knowledge Base
        const q = query.toLowerCase();
        let response = "Error: Input parameters not recognized in the current dataset. Try the suggestion chips below, or query: Projects, Skills, Achievements, Education, or Contact.";

        // Comprehensive response logic
        // NOTE: order matters — more specific keywords are matched before generic ones.
        if (q.includes('shiksha') || q.includes('siksha') || q.includes('sarthi') || q.includes('edtech') || q.includes('offline-first') || q.includes('offline first') || q.includes('learning platform') || q.includes('school')) {
            response = "ShikshaSarthi is a full-stack, offline-first school learning platform built for classrooms with unreliable internet. Each school runs the entire app (React frontend, Node/Express API, MongoDB) on a local Docker server, while a small AWS cloud service handles versioned updates, checksum-verified installs, backups, and bidirectional data sync. It features role-based access (Super Admin, School Admin, Teacher, Student), adaptive testing, quiz analytics, and Gemini AI hints — schools never depend on the cloud to keep teaching day to day.";
        } else if (q.includes('enterprise') || q.includes('multi-agent') || q.includes('multi agent') || q.includes('langgraph') || q.includes('data intelligence') || q.includes('data platform')) {
            response = "The Enterprise AI Data Intelligence Platform is a production-grade, local-first multi-agent system built on LangGraph. It lets data/ML engineers conversationally investigate ETL pipelines, Airflow DAGs, data lineage, and SQL warehouses — featuring dynamic fan-out routing, Self-RAG hallucination validation, hybrid dense+BM25 retrieval with cross-encoder reranking, and a Next.js observability UI. Runs fully local via Ollama and Qdrant with zero API cost.";
        } else if (q.includes('autograder') || q.includes('grading') || q.includes('grader')) {
            response = "AutoGrader is an end-to-end GenAI code-grading platform for CS education. It uses Docker-sandboxed multi-language execution (Python, C, Java), a Django/DRF + Celery/Redis backend for concurrent grading at scale, and a local LLM feedback pipeline (Ollama: Llama 3 / Mistral) that delivers rubric-aligned pedagogical feedback — achieving 85% evaluation accuracy on open-ended answers.";
        } else if (q.includes('deepfake') || q.includes('clip') || q.includes('forgery')) {
            response = "His Spatial-Temporal-Frequency Deepfake Detection model is a state-of-the-art video detector fusing three branches: Facial Component Guidance attention on ViT-L/14 spatial features, a Bi-LSTM over per-frame CLS token sequences for temporal cues, and block-DCT spectral analysis for compression artifacts. It's optimized with gradient checkpointing and layer pruning to train under constrained (6GB) GPU VRAM.";
        } else if (q.includes('pix2pix') || q.includes('gan') || q.includes('image translation')) {
            response = "Abhigyan architected a Structure-Aware Multi-Scale Pix2Pix GAN in PyTorch. It uses U-Net generators and PatchGAN discriminators with multi-scale feature extraction plus perceptual and edge-consistency losses, trained on 12k image pairs to improve SSIM by 0.08 over the baseline.";
        } else if (q.includes('sql') || (q.includes('agent') && !q.includes('multi'))) {
            response = "The Intelligent SQL Agent is an LLM-powered system (OpenAI/Mistral) that converts plain English into safe, schema-aware SQL. It automatically identifies relevant tables, executes queries securely against a live database, and returns structured results via LLM-driven reasoning chains.";
        } else if (q.includes('hmm') || q.includes('hidden') || q.includes('markov')) {
            response = "The HMM project validates an advanced model-order selection algorithm against synthetic sequence data, automatically computing the optimal number of hidden states via dynamic penalized likelihood scoring to recover underlying structural data dynamics.";
        } else if (q.includes('tree') || q.includes('dbms') || q.includes('index') || q.includes('b+')) {
            response = "The Disk-Based B+ Tree Index is a persistent database index engine built from scratch in C++ using memory-mapped I/O. It delivers O(log n) lookups with automatic node splitting and 4096-byte page management, scaling to datasets larger than available RAM.";
        } else if (q.includes('poetry') || q.includes('nlp')) {
            response = "The Reciprocal Contextual Poetry Generation model fuses contextual embeddings, sequence layers, and attention blocks with reinforcement learning from human feedback. It builds a reciprocal context-learning flow where each generated verse conditions the next for semantic coherence, trained on 5,000+ texts to model human-AI creative collaboration.";
        } else if (q.includes('llm') || q.includes('genai') || q.includes('gen ai') || q.includes('rag') || q.includes('generative')) {
            response = "In Generative AI & LLMs, Abhigyan works with LLM fine-tuning (LoRA/PEFT), RAG and hybrid retrieval pipelines, multi-agent systems (LangGraph), prompt engineering & evaluation, LangChain/LlamaIndex/Ollama, and vector search (Qdrant, FAISS, Pinecone).";
        } else if (q.includes('mlops') || q.includes('cloud') || q.includes('docker') || q.includes('kubernetes') || q.includes('deploy')) {
            response = "On the MLOps & Cloud side, he works with Docker & containerization, CI/CD pipelines (GitHub Actions), AWS/GCP fundamentals, MLflow experiment tracking, model serving & deployment, and Kubernetes fundamentals.";
        } else if (q.includes('data engineering') || q.includes('spark') || q.includes('kafka') || q.includes('airflow') || q.includes('etl') || q.includes('pipeline')) {
            response = "His data engineering toolkit spans Apache Spark, Kafka, and Airflow, ETL/ELT pipeline design, data lineage & warehousing, async task queues (Celery, Redis), PostgreSQL/MySQL/MongoDB, and feature engineering at scale.";
        } else if (q.includes('skill') || q.includes('tech') || q.includes('capabilities') || q.includes('competenc') || q.includes('stack') || q.includes('ml ') || q.includes('machine learning') || q.includes('ai ')) {
            response = "Abhigyan's core stack covers Machine & Deep Learning, Generative AI & GANs, Computer Vision (ViT, CLIP, CNNs), Transformers & RLHF; Python/C++/Java/SQL with PyTorch, TensorFlow, and Hugging Face; FastAPI/Django and React/Next.js; plus data engineering, MLOps, and strong CS fundamentals. Ask about 'LLM', 'MLOps', or 'data engineering' for details.";
        } else if (q.includes('amazon')) {
            response = "He ranked 278th nationwide in the Amazon ML Challenge 2025, achieving a scoring metric of 46.649.";
        } else if (q.includes('meta') || q.includes('hackercup')) {
            response = "Abhigyan is a Meta HackerCup'25 Round-2 Qualifier, demonstrating strong algorithmic problem-solving skills.";
        } else if (q.includes('codeforces') || q.includes('rating') || q.includes('competitive') || q.includes(' cp')) {
            response = "Abhigyan is a 'Pupil' on Codeforces with a max rating of 1293, and actively competes in programming contests. He also qualified for Meta HackerCup'25 Round-2 and ranked 278th nationwide in the Amazon ML Challenge 2025.";
        } else if (q.includes('achievement') || q.includes('award') || q.includes('accomplish')) {
            response = "Key achievements: AIR 7445 in JEE Advanced 2023; Codeforces Pupil (max rating 1293); Meta HackerCup'25 Round-2 Qualifier; 278th nationwide in Amazon ML Challenge 2025 (score 46.649); and NCC 'A' Certificate holder (A grade).";
        } else if (q.includes('rank') || q.includes('jee')) {
            response = "Abhigyan secured an All India Rank (AIR) of 7445 in the JEE Advanced 2023 examination, and is currently a B.Tech student in Data Science & AI at IIT Bhilai.";
        } else if (q.includes('education') || q.includes('college') || q.includes('degree') || q.includes('cgpa') || q.includes('study') || q.includes('iit') || q.includes('school')) {
            response = "Education: B.Tech in Data Science & AI at IIT Bhilai (expected May 2027, CGPA 8.00/10). Class XII from Sai RNS Academy (AISSCE, 91.2%) and Class X from Sainik School Goalpara (AISSE, 96.2%).";
        } else if (q.includes('leadership') || q.includes('lead') || q.includes('e-cell') || q.includes('committee') || q.includes('organiz')) {
            response = "Leadership: Core Member of the Entrepreneurship Cell at IIT Bhilai (organized TED-style talks & pitching events); Meraz 6.0 organizer handling logistics for 2000+ attendees; chaired IIT Bhilai MUN'24; Mess Coordinator; and placement cell support volunteer.";
        } else if (q.includes('intern') || q.includes('available') || q.includes('hire') || q.includes('hiring') || q.includes('opportunit') || q.includes('job') || q.includes('recruit')) {
            response = "Yes — Abhigyan is actively seeking data science internships, open-source collaborations, and AI/ML opportunities. Reach out via LinkedIn or email abhigyan.sharma6091@gmail.com to start a conversation.";
        } else if (q.includes('contact') || q.includes('email') || q.includes('reach') || q.includes('linkedin') || q.includes('connect')) {
            response = "You can reach Abhigyan at abhigyan.sharma6091@gmail.com, or connect via LinkedIn, GitHub (@Abhigyan6091), WhatsApp, or Instagram — all linked in the 'Establish Comm Link' section above.";
        } else if (q.includes('resume') || q.includes('cv') || q.includes('download')) {
            response = "Abhigyan's resume is available in the 'Download Resume' terminal near the bottom of the page — it contains all DS/AI technical competencies and project deployments. Just click the 'wget --secure Abhigyan_Sharma_Resume.pdf' button.";
        } else if (q.includes('project') || q.includes('work') || q.includes('portfolio') || q.includes('built') || q.includes('repo')) {
            response = "Abhigyan has built 9+ projects: ShikshaSarthi (offline-first full-stack EdTech platform), an Enterprise AI Data Intelligence Platform (LangGraph multi-agent), AutoGrader (GenAI code grading), Spatial-Temporal-Frequency Deepfake Detection, a Multi-Scale Pix2Pix GAN, an Intelligent SQL Agent, a Disk-Based B+ Tree DBMS index, Reciprocal Poetry Generation (NLP), and an HMM state-discovery project. Ask about any of them by name!";
        } else if (q.includes('hello') || q.includes('hi ') || q === 'hi' || q.includes('hey') || q.includes('greet')) {
            response = "Agent_Sharma_Core online. Systems synchronized. I can recount Abhigyan's projects, technical skills, achievements, education, or contact details. Pick a suggestion chip below or type your query.";
        } else if (q.includes('who') || q.includes('about') || q.includes('abhigyan') || q.includes('himself')) {
            response = "Abhigyan Sharma is an AI & Data Science undergraduate at IIT Bhilai, specializing in Generative AI, multi-agent LLM systems, computer vision, and data engineering. He bridges cutting-edge deep learning research with production-ready system architecture. Ask me about his projects, skills, or achievements!";
        }

        setTimeout(() => {
            statusText.textContent = "Status: ACCESSING_ARCHIVES...";
            setTimeout(() => {
                appendMessage('bot', response, true);
                statusText.textContent = oldStatus;
                statusText.style.color = "";
            }, 600);
        }, 800);
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
});
