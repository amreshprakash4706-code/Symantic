        // Tailwind Config
        function initializeTailwind() {
            tailwind.config = {
                theme: {
                    extend: {
                        fontFamily: {
                            'display': ['Space Grotesk', 'Inter', 'system-ui', 'sans-serif']
                        }
                    }
                }
            };
        }

        // Global State
        let savedArticles = JSON.parse(localStorage.getItem('symantic_saved') || '[]');
        let currentLiveFilter = 'all';
        let accuracyChartInstance = null;
        let currentTheme = localStorage.getItem('symantic_theme') || 'dark';

        // Initialize Everything
        function init() {
            initializeTailwind();
            applyTheme();
            initLiveFeed();
            initNewsSection();
            initChat();
            initQuickPrompts();
            initAccuracyChart();
            initPredictions();
            initBackToTop();
            initScrollProgress();
            initTiltCards();
            initButtonRipples();
            updateSavedCount();
            initCommandPaletteKeyboard();
            
            // Random live updates
            setInterval(() => {
                if (Math.random() > 0.75) addLiveUpdate(true);
            }, 19500);
            
            // Subtle metric drift
            setInterval(() => {
                if (Math.random() > 0.88) {
                    const metrics = document.querySelectorAll('#intelligence .metric-card');
                    if (metrics.length > 0) {
                        const randomMetric = metrics[Math.floor(Math.random() * metrics.length)];
                        const numEl = randomMetric.querySelector('.metric-value');
                        if (numEl) {
                            let val = parseFloat(numEl.textContent.replace(/[^0-9.]/g, ''));
                            if (!isNaN(val) && val > 50) {
                                const newVal = val + (Math.random() > 0.5 ? 0.8 : -0.5);
                                if (numEl.textContent.includes('.')) {
                                    numEl.innerHTML = newVal.toFixed(1);
                                } else if (val > 1000) {
                                    numEl.innerHTML = Math.round(newVal).toLocaleString();
                                }
                            }
                        }
                    }
                }
            }, 24000);
            
            // Keyboard hint
            setTimeout(() => {
                const tip = document.createElement('div');
                tip.style.cssText = 'position:fixed;bottom:22px;right:22px;background:rgba(255,255,255,0.05);color:#64748b;font-size:10px;padding:5px 13px;border-radius:9999px;border:1px solid rgba(255,255,255,0.08);z-index:50';
                tip.innerHTML = `Press <span class="font-mono text-white/60">⌘K</span> for command palette`;
                document.body.appendChild(tip);
                setTimeout(() => tip.parentNode && tip.parentNode.removeChild(tip), 6200);
            }, 9800);
            
            console.log('%c[Symantic] Premium redesign initialized — billion-dollar feel achieved.', 'color:#64748b');
        }

        // Scroll Progress Bar
        function initScrollProgress() {
            const progress = document.getElementById('scroll-progress');
            window.addEventListener('scroll', () => {
                const scrollTop = window.scrollY;
                const docHeight = document.documentElement.scrollHeight - window.innerHeight;
                const scrollPercent = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
                progress.style.width = scrollPercent + '%';
            });
        }

        // Tilt Effect on Cards
        function initTiltCards() {
            const cards = document.querySelectorAll('.premium-card, .prediction-card, .news-card');
            cards.forEach(card => {
                card.addEventListener('mousemove', (e) => {
                    const rect = card.getBoundingClientRect();
                    const x = ((e.clientX - rect.left) / rect.width) * 100;
                    const y = ((e.clientY - rect.top) / rect.height) * 100;
                    const rotX = (50 - y) / 12;
                    const rotY = (x - 50) / 12;
                    card.style.transform = `perspective(1200px) rotateX(${rotX}deg) rotateY(${rotY}deg)`;
                });
                card.addEventListener('mouseleave', () => {
                    card.style.transition = 'transform 0.6s cubic-bezier(0.23, 1, 0.32, 1)';
                    card.style.transform = 'perspective(1200px) rotateX(0deg) rotateY(0deg)';
                    setTimeout(() => {
                        card.style.transition = 'transform 0.4s cubic-bezier(0.23, 1, 0.32, 1)';
                    }, 600);
                });
            });
        }

        // Button Ripple Effect
        function initButtonRipples() {
            const buttons = document.querySelectorAll('.gaming-btn, .premium-btn');
            buttons.forEach(btn => {
                btn.addEventListener('click', function(e) {
                    const circle = document.createElement('span');
                    const diameter = Math.max(btn.clientWidth, btn.clientHeight);
                    const radius = diameter / 2;
                    
                    circle.style.width = circle.style.height = `${diameter}px`;
                    circle.style.left = `${e.offsetX - radius}px`;
                    circle.style.top = `${e.offsetY - radius}px`;
                    circle.classList.add('ripple');
                    
                    const existing = btn.getElementsByClassName('ripple')[0];
                    if (existing) existing.remove();
                    
                    btn.appendChild(circle);
                    setTimeout(() => circle.remove(), 650);
                });
            });
        }

        // Back to Top
        function initBackToTop() {
            const btn = document.querySelector('.back-to-top');
            if (!btn) return;
            window.addEventListener('scroll', () => {
                if (window.scrollY > 650) {
                    btn.classList.remove('hidden');
                    btn.classList.add('flex');
                } else {
                    btn.classList.remove('flex');
                    btn.classList.add('hidden');
                }
            });
        }

        // Chart.js
        function initAccuracyChart() {
            const ctx = document.getElementById('accuracyChart');
            if (!ctx) return;
            if (accuracyChartInstance) accuracyChartInstance.destroy();
            
            accuracyChartInstance = new Chart(ctx, {
                type: 'line',
                data: {
                    labels: ['Jan 27', 'Jan 28', 'Jan 29', 'Jan 30', 'Jan 31', 'Feb 1', 'Feb 2'],
                    datasets: [{
                        label: 'AI Accuracy %',
                        data: [92.4, 93.1, 91.9, 94.5, 93.8, 94.6, 94.7],
                        borderColor: '#00f5ff',
                        backgroundColor: 'rgba(0, 245, 255, 0.08)',
                        borderWidth: 3.5,
                        tension: 0.38,
                        fill: true,
                        pointBackgroundColor: '#00f5ff',
                        pointBorderColor: '#050507',
                        pointBorderWidth: 2.5,
                        pointRadius: 4.5
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: { 
                        legend: { display: false }, 
                        tooltip: { 
                            backgroundColor: '#111114', 
                            borderColor: '#00f5ff', 
                            borderWidth: 1, 
                            displayColors: false,
                            callbacks: { label: (ctx) => ctx.raw + '%' }
                        } 
                    },
                    scales: {
                        x: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#64748b', font: { size: 11 } } },
                        y: { min: 89, max: 96, grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#64748b', font: { size: 11 }, callback: v => v + '%' } }
                    }
                }
            });
        }

        // Live Feed
        let liveFeedItems = [
            { id: 1, time: "just now", type: "news", text: "Esports World Cup 2026 officially opens in Paris — $30M prize pool", confidence: null },
            { id: 2, time: "47s ago", type: "prediction", text: "Halo: Campaign Evolved — 89% confidence for July 28 launch", confidence: 89 },
            { id: 3, time: "3m ago", type: "patch", text: "Apex Legends mid-season update live — new legend + balance changes", confidence: 82 },
            { id: 4, time: "11m ago", type: "news", text: "Assassin's Creed Black Flag Resynced reviews are overwhelmingly positive", confidence: null },
            { id: 5, time: "19m ago", type: "prediction", text: "Black Myth: Wukong 2 still 96% likely for TGA 2026 reveal", confidence: 96 },
        ];
        
        function initLiveFeed() {
            const container = document.getElementById('live-feed-list');
            container.innerHTML = '';
            liveFeedItems.forEach(item => container.appendChild(createLiveItem(item)));
        }
        
        function createLiveItem(item) {
            const div = document.createElement('div');
            div.className = `live-item px-7 py-[18px] flex items-start gap-x-4 group border-l-2 border-transparent hover:border-[#00f5ff]/40 cursor-pointer`;
            div.dataset.type = item.type;
            div.dataset.id = item.id;
            
            let icon = '', badge = '';
            if (item.type === 'prediction') {
                icon = `<i class="fa-solid fa-brain text-[#7c3aed] mt-0.5"></i>`;
                badge = `<span class="text-[10px] font-mono px-2.5 py-px rounded bg-[#7c3aed]/10 text-[#7c3aed]">${item.confidence}%</span>`;
            } else if (item.type === 'news') {
                icon = `<i class="fa-solid fa-newspaper text-[#00f5ff] mt-0.5"></i>`;
                badge = `<span class="text-[10px] px-2.5 py-px rounded bg-red-500/10 text-red-400">LIVE</span>`;
            } else {
                icon = `<i class="fa-solid fa-sync text-emerald-400 mt-0.5"></i>`;
                badge = `<span class="text-[10px] px-2.5 py-px rounded bg-emerald-400/10 text-emerald-400">PATCH</span>`;
            }
            
            div.innerHTML = `
                <div class="mt-0.5 flex-shrink-0">${icon}</div>
                <div class="flex-1 min-w-0">
                    <div class="flex items-center justify-between gap-x-3">
                        <div class="font-medium text-[14px] pr-3 leading-snug">${item.text}</div>
                        <div class="flex-shrink-0 flex items-center gap-x-2.5">${badge}<span class="font-mono text-xs text-white/40 tabular-nums">${item.time}</span></div>
                    </div>
                </div>
            `;
            div.onclick = () => showToast(`More details coming soon for: ${item.text.substring(0, 60)}...`, 'info');
            return div;
        }
        
        function filterLiveFeed(type) {
            currentLiveFilter = type;
            document.querySelectorAll('.filter-tab').forEach(tab => tab.classList.remove('active'));
            document.getElementById(`filter-${type}`).classList.add('active');
            
            const items = document.getElementById('live-feed-list').children;
            for (let item of items) {
                item.style.display = (type === 'all' || item.dataset.type === type) ? '' : 'none';
            }
        }
        
        function addLiveUpdate(silent = false) {
            const container = document.getElementById('live-feed-list');
            const newItemsPool = [
                { id: Date.now(), time: "just now", type: "prediction", text: "Elden Ring Nightreign sales exceed expectations — 92% confidence", confidence: 92 },
                { id: Date.now() + 1, time: "just now", type: "news", text: "Major esports org announces new partnership with Symantic", confidence: null },
                { id: Date.now() + 2, time: "just now", type: "patch", text: "Apex Legends Season 22 balance changes revealed early", confidence: 81 },
            ];
            const randomItem = newItemsPool[Math.floor(Math.random() * newItemsPool.length)];
            const newEl = createLiveItem(randomItem);
            newEl.style.opacity = '0';
            newEl.style.transform = 'translateY(-18px)';
            container.insertBefore(newEl, container.firstChild);
            
            while (container.children.length > 8) container.removeChild(container.lastChild);
            
            requestAnimationFrame(() => {
                newEl.style.transition = 'all 0.5s cubic-bezier(0.23, 1, 0.32, 1)';
                newEl.style.opacity = '1';
                newEl.style.transform = 'translateY(0)';
            });
            
            if (currentLiveFilter !== 'all' && newEl.dataset.type !== currentLiveFilter) newEl.style.display = 'none';
            if (!silent) showToast("New live intelligence received", 'success');
        }

        // Predictions
        let predictionsData = [
            { id: 1, title: "Black Myth: Wukong 2 Announcement", confidence: 98, date: "TGA 2026", category: "Rumor" },
            { id: 2, title: "GTA VI Trailer 2 Release", confidence: 87, date: "Before March 2026", category: "Prediction" },
            { id: 3, title: "Valorant Patch 9.04 Meta Shift", confidence: 91, date: "Mid February", category: "Patch" },
            { id: 4, title: "Elden Ring Nightreign Sales", confidence: 92, date: "Q1 2026", category: "Prediction" },
            { id: 5, title: "T1 Wins Worlds 2027", confidence: 71, date: "Late 2027", category: "Esports" },
        ];
        
        function initPredictions() {
            renderPredictions(predictionsData);
        }
        
        function renderPredictions(data) {
            const grid = document.getElementById('predictions-grid');
            grid.innerHTML = '';
            
            data.forEach(pred => {
                const card = document.createElement('div');
                card.className = `glass border border-white/10 rounded-3xl p-7 prediction-card cursor-pointer`;
                card.onclick = () => showPredictionModal(pred);
                card.innerHTML = `
                    <div class="flex justify-between items-start mb-5">
                        <span class="px-3.5 py-1 text-[10px] font-bold tracking-widest rounded-2xl ${pred.category === 'Esports' ? 'bg-violet-400/10 text-violet-400' : pred.category === 'Patch' ? 'bg-emerald-400/10 text-emerald-400' : 'bg-orange-400/10 text-orange-400'}">${pred.category}</span>
                        <span class="text-xs text-white/40 font-mono">${pred.date}</span>
                    </div>
                    <div class="font-semibold text-[15.5px] leading-snug tracking-tight mb-5">${pred.title}</div>
                    
                    <div class="mb-2 flex justify-between text-xs">
                        <span class="text-white/60">AI Confidence</span>
                        <span class="font-mono text-emerald-400 font-semibold">${pred.confidence}%</span>
                    </div>
                    <div class="h-1.5 bg-white/10 rounded-full overflow-hidden">
                        <div class="confidence-bar" style="width: ${pred.confidence}%"></div>
                    </div>
                `;
                grid.appendChild(card);
            });
        }
        
        function showPredictionModal(pred) {
            const modal = document.createElement('div');
            modal.className = `fixed inset-0 bg-black/90 z-[130] flex items-center justify-center p-6`;
            modal.innerHTML = `
                <div onclick="event.target.remove()" class="glass max-w-lg w-full border border-white/10 rounded-3xl p-9">
                    <div class="flex justify-between items-start">
                        <span class="px-4 py-1 text-xs font-bold tracking-widest rounded-3xl ${pred.category === 'Esports' ? 'bg-violet-400/10 text-violet-400' : pred.category === 'Patch' ? 'bg-emerald-400/10 text-emerald-400' : 'bg-orange-400/10 text-orange-400'}">${pred.category}</span>
                        <span class="text-xs text-white/40 font-mono">${pred.date}</span>
                    </div>
                    
                    <h3 class="text-3xl font-bold tracking-tighter mt-6">${pred.title}</h3>
                    
                    <div class="mt-8">
                        <div class="flex justify-between text-sm mb-2.5">
                            <span class="text-white/60">AI Confidence</span>
                            <span class="font-mono text-emerald-400 font-bold text-lg">${pred.confidence}%</span>
                        </div>
                        <div class="h-2 bg-white/10 rounded-full overflow-hidden">
                            <div class="confidence-bar" style="width: ${pred.confidence}%"></div>
                        </div>
                    </div>
                    
                    <div class="mt-7 text-sm text-white/70 leading-relaxed">
                        Our model analyzed thousands of data points including social sentiment, betting odds, historical patterns, and insider signals. 
                        This prediction carries a <strong>${pred.confidence}% confidence score</strong>.
                    </div>
                    
                    <div class="mt-9 flex gap-3">
                        <button onclick="this.closest('.fixed').remove(); showToast('Added to watchlist')" class="flex-1 py-3.5 border border-white/20 hover:bg-white/5 rounded-3xl font-semibold text-sm">Add to Watchlist</button>
                        <button onclick="this.closest('.fixed').remove(); document.getElementById('ai').scrollIntoView({behavior:'smooth'})" class="flex-1 py-3.5 bg-white text-black font-bold rounded-3xl active:scale-[0.985]">Ask AI about this</button>
                    </div>
                </div>
            `;
            document.body.appendChild(modal);
        }
        
        function refreshPredictions() {
            const grid = document.getElementById('predictions-grid');
            grid.style.transition = 'opacity 0.2s';
            grid.style.opacity = '0.25';
            
            setTimeout(() => {
                predictionsData.forEach(p => {
                    p.confidence = Math.max(68, Math.min(98, p.confidence + (Math.random() - 0.5) * 5));
                });
                renderPredictions(predictionsData);
                grid.style.opacity = '1';
                showToast("Predictions refreshed with latest model output", 'success');
            }, 280);
        }

        // News Section
        let newsData = [
            { id: 1, category: "esports", title: "Esports World Cup 2026 opens in Paris with record $30M prize pool", time: "just now", summary: "Team Falcons leads early as top clubs battle in the biggest esports event of the year.", full: "The Esports World Cup 2026 has officially kicked off in Paris. With a record $30M prize pool and strong participation from Team Falcons, Vitality, and AG.AL, this is shaping up to be the most competitive EWC to date across multiple titles.", score: "9.7", tag: "ESPORTS" },
            { id: 2, category: "review", title: "Review: Assassin's Creed Black Flag Resynced — A triumphant return", time: "2h ago", summary: "Ubisoft delivers a stunning modern take on the beloved pirate epic with refined combat and visuals.", full: "Assassin's Creed Black Flag Resynced launches July 9 across PC, PS5, and Xbox Series. The remake brings the legendary pirate adventure into 2026 with gorgeous visuals, significantly improved naval combat, and a deeper story experience that fans have been waiting for.", score: "9.4", tag: "REVIEW" },
            { id: 3, category: "patch", title: "Apex Legends mid-season update brings new legend and major balance changes", time: "5h ago", summary: "Respawn introduces fresh content that is already reshaping the competitive meta.", full: "The latest Apex Legends update adds a brand new legend, significant map updates to World's Edge, and balance adjustments across multiple characters. The community is reacting with excitement and heated discussion.", score: "8.1", tag: "PATCH" },
            { id: 4, category: "rumor", title: "Halo: Campaign Evolved expected July 28 with new story missions", time: "today", summary: "343 Industries teases major additions to the classic Halo Combat Evolved experience.", full: "Reliable sources indicate Halo: Campaign Evolved will launch on July 28 with a full visual and gameplay remake of the original campaign plus several brand new story missions and modernized features.", score: "8.9", tag: "RUMOR" },
            { id: 5, category: "esports", title: "MSI 2026: T1 and Gen.G advance in dramatic League of Legends bracket", time: "yesterday", summary: "High-level play continues as favorites secure key victories at Mid-Season Invitational.", full: "T1 and Gen.G have advanced from the MSI 2026 bracket stage after thrilling series. The tournament is delivering some of the highest-level League of Legends seen all year as teams fight for the mid-season crown.", score: "9.2", tag: "ESPORTS" },
            { id: 6, category: "review", title: "Review: Rhythm Heaven Groove delivers pure rhythm joy on Switch", time: "yesterday", summary: "Nintendo's latest rhythm game is already being called one of the best in the series.", full: "Rhythm Heaven Groove launched July 2 on Nintendo Switch and is receiving universal praise for its perfect timing, charming presentation, and incredibly addictive gameplay loop. A must-play for rhythm fans.", score: "9.0", tag: "REVIEW" },
            { id: 7, category: "patch", title: "Valorant Patch 9.04 live — Major Jett and Viper meta shakeup", time: "2d ago", summary: "Riot pushes significant agent changes that are already reshaping ranked and pro play.", full: "The new Valorant patch introduces major tweaks to Jett and Viper along with new agent abilities. Pros and ranked players worldwide are rapidly adapting to the completely shifted meta.", score: "8.3", tag: "PATCH" },
            { id: 8, category: "rumor", title: "Black Myth: Wukong 2 still on track for major TGA 2026 reveal", time: "2d ago", summary: "Development sources confirm the sequel remains targeted for a big end-of-year announcement.", full: "Despite the busy summer release calendar, multiple reliable sources indicate Black Myth: Wukong 2 is still on track for a major The Game Awards 2026 reveal with significant gameplay footage expected.", score: "9.5", tag: "RUMOR" },
        ];
        
        let visibleNewsCount = 6;
        
        function initNewsSection() {
            renderNews(newsData.slice(0, visibleNewsCount));
            
            let searchTimeout;
            const searchInput = document.getElementById('news-search');
            window.debounceFilterNews = () => {
                clearTimeout(searchTimeout);
                searchTimeout = setTimeout(() => filterNews(), 160);
            };
            
            document.getElementById('news-filter').addEventListener('change', filterNews);
        }
        
        function renderNews(newsArray) {
            const grid = document.getElementById('news-grid');
            grid.innerHTML = '';
            
            newsArray.forEach(item => {
                const isSaved = savedArticles.some(a => a.id === item.id);
                const card = document.createElement('div');
                card.className = `news-card glass border border-white/10 rounded-3xl p-7 flex flex-col cursor-pointer premium-card`;
                card.onclick = (e) => {
                    if (!e.target.closest('.news-bookmark')) showArticleModal(item);
                };
                
                card.innerHTML = `
                    <div class="flex justify-between items-start">
                        <span onclick="event.stopImmediatePropagation(); applyCategoryFilter('${item.category}');" class="px-3.5 py-1 text-[10px] font-bold tracking-widest rounded-2xl cursor-pointer hover:opacity-80 transition-opacity ${getTagColor(item.tag)}">${item.tag}</span>
                        <div class="flex items-center gap-x-2">
                            <span class="text-xs text-white/40 font-mono">${item.time}</span>
                            <button onclick="event.stopImmediatePropagation(); toggleBookmark(${item.id}, this)" class="news-bookmark text-white/40 hover:text-red-400 transition-colors ${isSaved ? 'saved' : ''}">
                                <i class="fa-${isSaved ? 'solid' : 'regular'} fa-bookmark"></i>
                            </button>
                        </div>
                    </div>
                    <div class="mt-5 font-semibold text-[15.5px] leading-snug tracking-[-0.2px] flex-1">${item.title}</div>
                    <div class="mt-3.5 text-sm text-white/60 line-clamp-2">${item.summary}</div>
                    <div class="flex items-center justify-between mt-auto pt-6 border-t border-white/10 text-xs">
                        <div class="flex items-center gap-x-1.5"><span class="font-mono text-emerald-400 font-semibold">${item.score}</span><span class="text-white/40">/10</span></div>
                        <div class="text-[#00f5ff] flex items-center gap-x-1 text-xs font-medium">READ FULL ANALYSIS <i class="fa-solid fa-arrow-right-long ml-px"></i></div>
                    </div>
                `;
                grid.appendChild(card);
            });
        }
        
        function getTagColor(tag) {
            if (tag === 'ESPORTS') return 'bg-violet-400/10 text-violet-400';
            if (tag === 'PATCH') return 'bg-emerald-400/10 text-emerald-400';
            if (tag === 'RUMOR') return 'bg-orange-400/10 text-orange-400';
            return 'bg-sky-400/10 text-sky-400';
        }
        
        function applyCategoryFilter(category) {
            document.getElementById('news-filter').value = category;
            filterNews();
            document.getElementById('news').scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
        
        function filterNews() {
            const searchTerm = document.getElementById('news-search').value.toLowerCase().trim();
            const filterValue = document.getElementById('news-filter').value;
            let filtered = newsData;
            
            if (filterValue) filtered = filtered.filter(item => item.category === filterValue);
            if (searchTerm) filtered = filtered.filter(item => item.title.toLowerCase().includes(searchTerm) || item.summary.toLowerCase().includes(searchTerm));
            
            renderNews(filtered.slice(0, visibleNewsCount));
        }
        
        function loadMoreNews() {
            visibleNewsCount += 3;
            const searchTerm = document.getElementById('news-search').value.toLowerCase().trim();
            const filterValue = document.getElementById('news-filter').value;
            let filtered = newsData;
            if (filterValue) filtered = filtered.filter(item => item.category === filterValue);
            if (searchTerm) filtered = filtered.filter(item => item.title.toLowerCase().includes(searchTerm) || item.summary.toLowerCase().includes(searchTerm));
            renderNews(filtered.slice(0, visibleNewsCount));
            if (visibleNewsCount >= filtered.length) document.getElementById('load-more-btn').style.display = 'none';
        }
        
        function toggleBookmark(articleId, element) {
            const article = newsData.find(a => a.id === articleId);
            if (!article) return;
            
            const index = savedArticles.findIndex(a => a.id === articleId);
            
            if (index > -1) {
                savedArticles.splice(index, 1);
                element.classList.remove('saved');
                element.innerHTML = '<i class="fa-regular fa-bookmark"></i>';
                showToast("Removed from reading list", 'info');
            } else {
                savedArticles.push(article);
                element.classList.add('saved');
                element.innerHTML = '<i class="fa-solid fa-bookmark"></i>';
                showToast("Saved to reading list", 'success');
            }
            
            localStorage.setItem('symantic_saved', JSON.stringify(savedArticles));
            updateSavedCount();
        }
        
        function updateSavedCount() {
            const countEl = document.getElementById('saved-count');
            const textEl = document.getElementById('saved-count-text');
            if (!countEl || !textEl) return;
            
            if (savedArticles.length > 0) {
                countEl.style.display = 'flex';
                textEl.textContent = `${savedArticles.length} saved`;
            } else {
                countEl.style.display = 'none';
            }
        }
        
        function showSavedArticles() {
            if (savedArticles.length === 0) return;
            const grid = document.getElementById('news-grid');
            grid.innerHTML = '';
            
            savedArticles.forEach(item => {
                const card = document.createElement('div');
                card.className = `news-card glass border border-white/10 rounded-3xl p-7 flex flex-col cursor-pointer premium-card`;
                card.onclick = () => showArticleModal(item);
                
                card.innerHTML = `
                    <div class="flex justify-between items-start">
                        <span class="px-3.5 py-1 text-[10px] font-bold tracking-widest rounded-2xl ${getTagColor(item.tag)}">${item.tag}</span>
                        <div class="flex items-center gap-x-2">
                            <span class="text-xs text-white/40 font-mono">${item.time}</span>
                            <button onclick="event.stopImmediatePropagation(); toggleBookmark(${item.id}, this)" class="news-bookmark saved text-red-400"><i class="fa-solid fa-bookmark"></i></button>
                        </div>
                    </div>
                    <div class="mt-5 font-semibold text-[15.5px] leading-snug tracking-[-0.2px] flex-1">${item.title}</div>
                    <div class="mt-3.5 text-sm text-white/60 line-clamp-2">${item.summary}</div>
                    <div class="flex items-center justify-between mt-auto pt-6 border-t border-white/10 text-xs">
                        <div class="flex items-center gap-x-1.5"><span class="font-mono text-emerald-400 font-semibold">${item.score}</span><span class="text-white/40">/10</span></div>
                        <div class="text-[#00f5ff] flex items-center gap-x-1 text-xs font-medium">READ FULL ANALYSIS <i class="fa-solid fa-arrow-right-long ml-px"></i></div>
                    </div>
                `;
                grid.appendChild(card);
            });
            
            const msg = document.createElement('div');
            msg.className = 'col-span-full text-center py-5 text-sm text-white/50';
            msg.innerHTML = `Showing your <span class="font-medium text-white/70">${savedArticles.length} saved articles</span>. <span class="cursor-pointer underline hover:text-white/70" onclick="resetNewsView()">Show all news</span>`;
            grid.appendChild(msg);
        }
        
        function resetNewsView() {
            visibleNewsCount = 6;
            document.getElementById('news-search').value = '';
            document.getElementById('news-filter').value = '';
            renderNews(newsData.slice(0, visibleNewsCount));
        }
        
        function showArticleModal(article) {
            const modal = document.getElementById('article-modal');
            const content = document.getElementById('article-modal-content');
            const isSaved = savedArticles.some(a => a.id === article.id);
            
            content.innerHTML = `
                <div class="flex justify-between items-start">
                    <span class="px-4 py-1 text-xs font-bold tracking-[1.5px] rounded-3xl ${getTagColor(article.tag)}">${article.tag}</span>
                    <span class="text-xs text-white/40 font-mono">${article.time}</span>
                </div>
                <h3 class="text-3xl font-bold tracking-tighter mt-5 pr-6">${article.title}</h3>
                <div class="flex items-center gap-x-2 mt-5">
                    <div class="px-3.5 py-px text-sm bg-emerald-400/10 text-emerald-400 rounded-2xl font-medium">Symantic Score: ${article.score}/10</div>
                    <div class="text-xs text-white/50">• 100% data-backed • No publisher influence</div>
                </div>
                <div class="prose prose-invert mt-8 text-[15px] text-white/80 leading-relaxed">${article.full}</div>
                <div class="mt-9 pt-6 border-t border-white/10 flex items-center justify-between text-xs">
                    <div class="flex items-center gap-x-3">
                        <button onclick="toggleBookmarkFromModal(${article.id}, this)" class="flex items-center gap-x-2 px-5 py-2.5 rounded-2xl border border-white/20 hover:bg-white/5 transition-colors ${isSaved ? 'text-red-400 border-red-400/30' : ''}">
                            <i class="fa-${isSaved ? 'solid' : 'regular'} fa-bookmark"></i>
                            <span>${isSaved ? 'Saved' : 'Save for later'}</span>
                        </button>
                        <button onclick="navigator.clipboard.writeText(window.location.href); showToast('Link copied to clipboard')" class="flex items-center gap-x-2 px-5 py-2.5 rounded-2xl border border-white/20 hover:bg-white/5 transition-colors">
                            <i class="fa-solid fa-link"></i> <span>Share</span>
                        </button>
                    </div>
                    <button onclick="hideArticleModal()" class="px-6 py-2.5 text-xs font-bold border border-white/20 rounded-3xl hover:bg-white/5">CLOSE</button>
                </div>
            `;
            modal.classList.remove('hidden');
            modal.classList.add('flex');
        }
        
        function toggleBookmarkFromModal(articleId, btn) {
            const article = newsData.find(a => a.id === articleId);
            if (!article) return;
            const index = savedArticles.findIndex(a => a.id === articleId);
            const icon = btn.querySelector('i');
            const text = btn.querySelector('span');
            
            if (index > -1) {
                savedArticles.splice(index, 1);
                btn.classList.remove('text-red-400', 'border-red-400/30');
                icon.classList.remove('fa-solid');
                icon.classList.add('fa-regular');
                text.textContent = 'Save for later';
            } else {
                savedArticles.push(article);
                btn.classList.add('text-red-400', 'border-red-400/30');
                icon.classList.remove('fa-regular');
                icon.classList.add('fa-solid');
                text.textContent = 'Saved';
            }
            
            localStorage.setItem('symantic_saved', JSON.stringify(savedArticles));
            updateSavedCount();
            setTimeout(() => {
                const searchTerm = document.getElementById('news-search').value.toLowerCase().trim();
                const filterValue = document.getElementById('news-filter').value;
                let filtered = newsData;
                if (filterValue) filtered = filtered.filter(i => i.category === filterValue);
                if (searchTerm) filtered = filtered.filter(i => i.title.toLowerCase().includes(searchTerm) || i.summary.toLowerCase().includes(searchTerm));
                renderNews(filtered.slice(0, visibleNewsCount));
            }, 280);
        }
        
        function hideArticleModal() {
            const modal = document.getElementById('article-modal');
            modal.classList.remove('flex');
            modal.classList.add('hidden');
        }

        // Dashboard Metrics
        function bumpMetric(element, baseValue, increment) {
            const numberEl = element.querySelector('.metric-value');
            if (!numberEl) return;
            const isFloat = baseValue % 1 !== 0;
            let current = parseFloat(numberEl.textContent.replace(/[^0-9.]/g, '')) || baseValue;
            const newValue = current + increment;
            
            const duration = 680;
            const start = performance.now();
            
            function animate(now) {
                const progress = Math.min((now - start) / duration, 1);
                const eased = 1 - Math.pow(1 - progress, 3);
                const val = current + (newValue - current) * eased;
                
                if (isFloat) numberEl.innerHTML = val.toFixed(1);
                else if (baseValue > 1000) numberEl.innerHTML = Math.round(val).toLocaleString();
                else numberEl.innerHTML = Math.round(val);
                
                if (progress < 1) requestAnimationFrame(animate);
                else {
                    if (isFloat) numberEl.innerHTML = newValue.toFixed(1);
                    else if (baseValue > 1000) numberEl.innerHTML = Math.round(newValue).toLocaleString();
                    else numberEl.innerHTML = Math.round(newValue);
                }
            }
            requestAnimationFrame(animate);
            
            element.style.transform = 'scale(0.96)';
            setTimeout(() => element.style.transform = 'scale(1)', 140);
            
            if (Math.random() > 0.6) setTimeout(() => showToast("Metric updated with latest live data"), 720);
        }
        
        function refreshDashboard() {
            const cards = document.querySelectorAll('#intelligence .metric-card');
            cards.forEach((card, i) => {
                setTimeout(() => {
                    const numEl = card.querySelector('.metric-value');
                    if (!numEl) return;
                    let val = parseFloat(numEl.textContent.replace(/[^0-9.]/g, ''));
                    if (!isNaN(val)) {
                        const variation = val * (0.012 + Math.random() * 0.028);
                        const newVal = val + (Math.random() > 0.5 ? variation : -variation * 0.55);
                        numEl.style.transitionDuration = '0ms';
                        numEl.style.transform = 'translateY(-6px)';
                        setTimeout(() => {
                            if (numEl.textContent.includes('.')) numEl.innerHTML = newVal.toFixed(1);
                            else if (val > 1000) numEl.innerHTML = Math.round(newVal).toLocaleString();
                            else numEl.innerHTML = Math.round(newVal);
                            numEl.style.transitionDuration = '280ms';
                            numEl.style.transform = 'translateY(0)';
                        }, 30);
                    }
                }, i * 70);
            });
            
            setTimeout(() => {
                if (accuracyChartInstance) {
                    const newData = accuracyChartInstance.data.datasets[0].data.map(v => Math.max(90, Math.min(96, v + (Math.random() - 0.5) * 0.55)));
                    accuracyChartInstance.data.datasets[0].data = newData;
                    accuracyChartInstance.update();
                }
            }, 450);
            
            showToast("Dashboard refreshed with latest live data", 'success');
        }

        // AI Chat - Magical Experience
        function initChat() {
            const container = document.getElementById('chat-messages');
            container.innerHTML = `
                <div class="flex gap-x-3.5">
                    <div class="w-9 h-9 flex-shrink-0 rounded-2xl bg-gradient-to-br from-[#00f5ff] to-[#7c3aed] flex items-center justify-center ring-1 ring-white/20">
                        <i class="fa-solid fa-robot text-xs text-black"></i>
                    </div>
                    <div class="max-w-[82%]">
                        <div class="text-xs text-white/50 mb-px">SYMANTIC AI • just now</div>
                        <div class="bg-white/5 px-5 py-3.5 rounded-3xl text-sm">Hey! I'm Symantic AI. Ask me anything about games, predictions, patches, or esports. I have access to real-time data.</div>
                    </div>
                </div>
            `;
        }
        
        function initQuickPrompts() {
            const container = document.getElementById('quick-prompts');
            const prompts = [
                { text: "GTA VI release date?", query: "When is GTA VI releasing?" },
                { text: "Valorant meta right now", query: "What's the current Valorant meta and best agents?" },
                { text: "Black Myth Wukong 2 prediction", query: "Black Myth Wukong 2 announcement prediction" },
                { text: "Best FPS game 2026", query: "What is the best FPS game right now?" }
            ];
            container.innerHTML = prompts.map(p => 
                `<button onclick="quickPrompt('${p.query}')" class="quick-prompt px-4 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl text-white/80 text-xs transition-all active:scale-[0.985]">${p.text}</button>`
            ).join('');
        }
        
        function showTypingIndicator() {
            const container = document.getElementById('chat-messages');
            const typing = document.createElement('div');
            typing.id = 'typing-indicator';
            typing.className = 'flex gap-x-3.5';
            typing.innerHTML = `
                <div class="w-9 h-9 flex-shrink-0 rounded-2xl bg-gradient-to-br from-[#00f5ff] to-[#7c3aed] flex items-center justify-center ring-1 ring-white/20">
                    <i class="fa-solid fa-robot text-xs text-black"></i>
                </div>
                <div class="bg-white/5 px-5 py-3.5 rounded-3xl">
                    <div class="thinking-dots"><span></span><span></span><span></span></div>
                </div>
            `;
            container.appendChild(typing);
            container.scrollTop = container.scrollHeight;
        }
        
        function removeTypingIndicator() {
            const typing = document.getElementById('typing-indicator');
            if (typing) typing.remove();
        }
        
  // ==================== GROQ (Real + Protected) ====================
async function generateAIResponse(query) {
    try {
        const response = await fetch("/api/groq", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                messages: [
                    { role: "system", content: "You are Symantic AI, a helpful gaming assistant." },
                    { role: "user", content: query }
                ]
            })
        });
        const data = await response.json();
        return data.choices?.[0]?.message?.content || "Sorry, something went wrong.";
    } catch (e) {
        return "Sorry, connection error.";
    }
}

// Chat message helpers to avoid duplication
function appendUserMessage(text) {
    const container = document.getElementById('chat-messages');
    container.innerHTML += `<div class="flex justify-end"><div class="max-w-[78%] bg-[#00f5ff] text-black px-5 py-3.5 rounded-3xl text-sm">${text}</div></div>`;
    container.scrollTop = container.scrollHeight;
}

function appendAIMessage(text) {
    const container = document.getElementById('chat-messages');
    const aiMsg = document.createElement('div');
    aiMsg.className = 'flex gap-x-3.5 chat-bubble';
    aiMsg.innerHTML = `
        <div class="w-9 h-9 flex-shrink-0 rounded-2xl bg-gradient-to-br from-[#00f5ff] to-[#7c3aed] flex items-center justify-center ring-1 ring-white/20">
            <i class="fa-solid fa-robot text-xs text-black"></i>
        </div>
        <div class="max-w-[82%]">
            <div class="text-xs text-white/50 mb-px">SYMANTIC AI • just now</div>
            <div class="bg-white/5 px-5 py-[13px] rounded-3xl text-sm">${text}</div>
        </div>
    `;
    container.appendChild(aiMsg);
    container.scrollTop = container.scrollHeight;
}

async function sendChatMessage() {
    const input = document.getElementById('chat-input');
    const msg = input.value.trim();
    if (!msg) return;

    appendUserMessage(msg);
    input.value = '';

    showTypingIndicator();

    const aiReply = await generateAIResponse(msg);
    removeTypingIndicator();

    appendAIMessage(aiReply);
}

async function quickPrompt(query) {
    appendUserMessage(query);

    showTypingIndicator();
    const aiReply = await generateAIResponse(query);
    removeTypingIndicator();

    appendAIMessage(aiReply);
}
        function clearChat() {
            const container = document.getElementById('chat-messages');
            container.innerHTML = '';
            initChat();
        }
        
        function simulateVoiceInput() {
            const input = document.getElementById('chat-input');
            showToast("Voice input activated (demo) — try speaking now", 'info');
            setTimeout(() => {
                input.value = "What's the current Valorant meta?";
                sendChatMessage();
            }, 1400);
        }
        
        function uploadReplay() {
            showToast("Replay analysis started — processing your match data...", 'success');
            setTimeout(() => {
                const container = document.getElementById('chat-messages');
                const aiMsg = document.createElement('div');
                aiMsg.className = 'flex gap-x-3.5 chat-bubble';
                aiMsg.innerHTML = `
                    <div class="w-9 h-9 flex-shrink-0 rounded-2xl bg-gradient-to-br from-[#00f5ff] to-[#7c3aed] flex items-center justify-center ring-1 ring-white/20">
                        <i class="fa-solid fa-robot text-xs text-black"></i>
                    </div>
                    <div class="max-w-[82%]">
                        <div class="text-xs text-white/50 mb-px">SYMANTIC AI • just now</div>
                        <div class="bg-white/5 px-5 py-[13px] rounded-3xl text-sm">I've analyzed your replay. Your K/D ratio is strong, but positioning in mid-round can improve. Would you like specific recommendations for your next 5 matches?</div>
                    </div>
                `;
                container.appendChild(aiMsg);
                container.scrollTop = container.scrollHeight;
            }, 2200);
        }

        // Pricing Toggle
        function togglePricing(period) {
            const monthlyBtn = document.getElementById('pricing-monthly');
            const yearlyBtn = document.getElementById('pricing-yearly');
            const proPrice = document.getElementById('pro-price');
            const proBilling = document.getElementById('pro-billing');
            
            if (period === 'monthly') {
                monthlyBtn.classList.add('bg-white', 'text-black');
                monthlyBtn.classList.remove('text-white');
                yearlyBtn.classList.remove('bg-white', 'text-black');
                yearlyBtn.classList.add('text-white');
                proPrice.textContent = '$12';
                proBilling.textContent = 'billed monthly • cancel anytime';
            } else {
                yearlyBtn.classList.add('bg-white', 'text-black');
                yearlyBtn.classList.remove('text-white');
                monthlyBtn.classList.remove('bg-white', 'text-black');
                monthlyBtn.classList.add('text-white');
                proPrice.textContent = '$9';
                proBilling.textContent = 'billed yearly • save $39';
            }
        }

        // Modals
        function showLoginModal() {
            document.getElementById('login-modal').classList.remove('hidden');
            document.getElementById('login-modal').classList.add('flex');
        }
        function hideLoginModal() {
            document.getElementById('login-modal').classList.remove('flex');
            document.getElementById('login-modal').classList.add('hidden');
        }
        function loginUser() {
            hideLoginModal();
            showToast("Welcome back! You're now logged in as demo user.", 'success');
            setTimeout(() => document.getElementById('live').scrollIntoView({ behavior: 'smooth', block: 'center' }), 1100);
        }
        function showSubscribeModal() {
            document.getElementById('subscribe-modal').classList.remove('hidden');
            document.getElementById('subscribe-modal').classList.add('flex');
        }
        function hideSubscribeModal() {
            document.getElementById('subscribe-modal').classList.remove('flex');
            document.getElementById('subscribe-modal').classList.add('hidden');
        }
        
        function processFakeCheckout() {
            const modalContent = document.querySelector('#subscribe-modal .glass');
            modalContent.innerHTML = `
                <div class="text-center py-10">
                    <div class="mx-auto w-16 h-16 bg-emerald-400/10 rounded-3xl flex items-center justify-center mb-6">
                        <i class="fa-solid fa-check text-4xl text-emerald-400"></i>
                    </div>
                    <div class="font-bold text-3xl tracking-tight">Welcome to Pro!</div>
                    <p class="mt-2 text-white/70">Your 14-day free trial has started.</p>
                    
                    <div class="mt-9 text-left bg-white/5 p-6 rounded-2xl text-sm">
                        <div class="font-semibold mb-3">What's unlocked now:</div>
                        <ul class="space-y-1.5 text-white/80">
                            <li>✓ Unlimited AI insights &amp; predictions</li>
                            <li>✓ Early access to all forecasts</li>
                            <li>✓ Custom dashboards &amp; alerts</li>
                            <li>✓ Priority support</li>
                        </ul>
                    </div>
                    
                    <button onclick="hideSubscribeModal(); showToast('Pro features activated! Explore the dashboard.')" class="mt-8 w-full py-4 font-bold bg-white text-black rounded-3xl active:scale-[0.985]">
                        Start Exploring Pro Features
                    </button>
                </div>
            `;
        }
        function showContactModal() {
            const modal = document.createElement('div');
            modal.className = `fixed inset-0 bg-black/80 z-[120] flex items-center justify-center p-6`;
            modal.innerHTML = `
                <div onclick="event.target.remove()" class="glass w-full max-w-md border border-white/10 rounded-3xl p-9">
                    <div class="text-center">
                        <i class="fa-solid fa-headset text-4xl mb-5 text-[#00f5ff]"></i>
                        <div class="font-bold text-2xl tracking-tight">Let's talk enterprise</div>
                        <p class="mt-2 text-white/70">Our team will get back to you within 4 hours.</p>
                        <div class="mt-7 text-left">
                            <input placeholder="Your work email" class="w-full bg-white/5 border border-white/10 px-6 py-3.5 rounded-3xl text-sm mb-3.5" value="studio@yourgame.com">
                            <textarea placeholder="Tell us about your team and needs..." class="w-full h-24 bg-white/5 border border-white/10 px-6 py-3.5 rounded-3xl text-sm resize-y"></textarea>
                        </div>
                        <button onclick="this.closest('.fixed').remove(); showToast('Thanks! Our sales team will contact you shortly.', 'success')" class="mt-6 w-full py-4 bg-white font-bold text-black rounded-3xl active:scale-[0.985]">Send message</button>
                    </div>
                </div>
            `;
            document.body.appendChild(modal);
        }

        // Command Palette (WOW Feature)
        function initCommandPaletteKeyboard() {
            document.addEventListener('keydown', function(e) {
                if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
                    e.preventDefault();
                    showCommandPalette();
                }
                if (e.key === '?' && document.activeElement.tagName === 'BODY') {
                    e.preventDefault();
                    document.getElementById('ai').scrollIntoView({ behavior: 'smooth' });
                    setTimeout(() => document.getElementById('chat-input').focus(), 650);
                }
            });
        }
        
        function showCommandPalette() {
            const palette = document.getElementById('command-palette');
            const input = document.getElementById('command-input');
            const results = document.getElementById('command-results');
            
            palette.classList.remove('hidden');
            palette.classList.add('flex');
            input.value = '';
            input.focus();
            
            showAllCommands();
            
            input.onkeyup = filterCommands;
        }
        
        function hideCommandPalette() {
            const palette = document.getElementById('command-palette');
            palette.classList.remove('flex');
            palette.classList.add('hidden');
        }
        
        function showAllCommands() {
            const results = document.getElementById('command-results');
            results.innerHTML = `
                <div class="px-3 py-1 text-xs text-white/40 font-medium">QUICK ACTIONS</div>
                <div onclick="executeCommand('live')" class="px-4 py-3 hover:bg-white/5 rounded-2xl flex items-center gap-x-3 cursor-pointer"><i class="fa-solid fa-broadcast-tower w-4 text-[#00f5ff]"></i> <span>Go to Live Feed</span></div>
                <div onclick="executeCommand('predictions')" class="px-4 py-3 hover:bg-white/5 rounded-2xl flex items-center gap-x-3 cursor-pointer"><i class="fa-solid fa-brain w-4 text-[#7c3aed]"></i> <span>Refresh Predictions</span></div>
                <div onclick="executeCommand('ai-gta')" class="px-4 py-3 hover:bg-white/5 rounded-2xl flex items-center gap-x-3 cursor-pointer"><i class="fa-solid fa-robot w-4 text-[#00f5ff]"></i> <span>Ask AI: GTA VI prediction</span></div>
                <div onclick="executeCommand('dashboard')" class="px-4 py-3 hover:bg-white/5 rounded-2xl flex items-center gap-x-3 cursor-pointer"><i class="fa-solid fa-chart-line w-4 text-emerald-400"></i> <span>Refresh Dashboard</span></div>
                <div onclick="executeCommand('pricing')" class="px-4 py-3 hover:bg-white/5 rounded-2xl flex items-center gap-x-3 cursor-pointer"><i class="fa-solid fa-credit-card w-4 text-white/60"></i> <span>View Pricing</span></div>
            `;
        }
        
        function filterCommands() {
            const input = document.getElementById('command-input').value.toLowerCase();
            const results = document.getElementById('command-results');
            
            if (!input) {
                showAllCommands();
                return;
            }
            
            let html = `<div class="px-3 py-1 text-xs text-white/40 font-medium">RESULTS</div>`;
            
            if (input.includes('live') || input.includes('feed')) {
                html += `<div onclick="executeCommand('live')" class="px-4 py-3 hover:bg-white/5 rounded-2xl flex items-center gap-x-3 cursor-pointer"><i class="fa-solid fa-broadcast-tower w-4 text-[#00f5ff]"></i> <span>Go to Live Feed</span></div>`;
            }
            if (input.includes('predict') || input.includes('brain')) {
                html += `<div onclick="executeCommand('predictions')" class="px-4 py-3 hover:bg-white/5 rounded-2xl flex items-center gap-x-3 cursor-pointer"><i class="fa-solid fa-brain w-4 text-[#7c3aed]"></i> <span>Refresh Predictions</span></div>`;
            }
            if (input.includes('gta') || input.includes('ai')) {
                html += `<div onclick="executeCommand('ai-gta')" class="px-4 py-3 hover:bg-white/5 rounded-2xl flex items-center gap-x-3 cursor-pointer"><i class="fa-solid fa-robot w-4 text-[#00f5ff]"></i> <span>Ask AI about GTA VI</span></div>`;
            }
            if (input.includes('dash') || input.includes('metric')) {
                html += `<div onclick="executeCommand('dashboard')" class="px-4 py-3 hover:bg-white/5 rounded-2xl flex items-center gap-x-3 cursor-pointer"><i class="fa-solid fa-chart-line w-4 text-emerald-400"></i> <span>Refresh Dashboard</span></div>`;
            }
            if (input.includes('price') || input.includes('pro')) {
                html += `<div onclick="executeCommand('pricing')" class="px-4 py-3 hover:bg-white/5 rounded-2xl flex items-center gap-x-3 cursor-pointer"><i class="fa-solid fa-credit-card w-4 text-white/60"></i> <span>View Pricing Plans</span></div>`;
            }
            if (input.includes('news') || input.includes('article')) {
                html += `<div onclick="executeCommand('news')" class="px-4 py-3 hover:bg-white/5 rounded-2xl flex items-center gap-x-3 cursor-pointer"><i class="fa-solid fa-newspaper w-4 text-[#00f5ff]"></i> <span>Go to News</span></div>`;
            }
            
            results.innerHTML = html || `<div class="px-4 py-6 text-center text-white/50 text-sm">No matching commands. Try "live", "predict", or "gta"</div>`;
        }
        
        function executeCommand(cmd) {
            hideCommandPalette();
            
            setTimeout(() => {
                if (cmd === 'live') {
                    document.getElementById('live').scrollIntoView({ behavior: 'smooth', block: 'center' });
                } else if (cmd === 'predictions') {
                    document.getElementById('predictions').scrollIntoView({ behavior: 'smooth', block: 'center' });
                    setTimeout(() => refreshPredictions(), 650);
                } else if (cmd === 'ai-gta') {
                    document.getElementById('ai').scrollIntoView({ behavior: 'smooth' });
                    setTimeout(() => {
                        const input = document.getElementById('chat-input');
                        input.value = "When is GTA VI releasing?";
                        sendChatMessage();
                    }, 750);
                } else if (cmd === 'dashboard') {
                    document.getElementById('intelligence').scrollIntoView({ behavior: 'smooth', block: 'center' });
                    setTimeout(() => refreshDashboard(), 650);
                } else if (cmd === 'pricing') {
                    document.getElementById('pricing').scrollIntoView({ behavior: 'smooth', block: 'center' });
                } else if (cmd === 'news') {
                    document.getElementById('news').scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
            }, 180);
        }

        // Theme Toggle
        function toggleTheme() {
            currentTheme = currentTheme === 'dark' ? 'light' : 'dark';
            applyTheme();
            localStorage.setItem('symantic_theme', currentTheme);
        }
        
        function applyTheme() {
            const icon = document.getElementById('theme-icon');
            if (!icon) return;
            
            if (currentTheme === 'light') {
                document.documentElement.style.setProperty('--bg', '#f8fafc');
                document.documentElement.style.setProperty('--surface', '#ffffff');
                document.documentElement.style.setProperty('--text-primary', '#0f172a');
                document.documentElement.style.setProperty('--text-secondary', '#475569');
                document.body.style.background = '#f8fafc';
                document.body.style.color = '#0f172a';
                icon.classList.remove('fa-moon');
                icon.classList.add('fa-sun');
            } else {
                document.documentElement.style.setProperty('--bg', '#050507');
                document.documentElement.style.setProperty('--surface', '#0a0a0f');
                document.documentElement.style.setProperty('--text-primary', '#f1f5f9');
                document.documentElement.style.setProperty('--text-secondary', '#94a3b8');
                document.body.style.background = '#050507';
                document.body.style.color = '#f1f5f9';
                icon.classList.remove('fa-sun');
                icon.classList.add('fa-moon');
            }
        }

        // Toast Notifications
        function showToast(msg, type = 'success') {
            const toast = document.createElement('div');
            let icon = type === 'success' ? '<i class="fa-solid fa-check-double"></i>' : '<i class="fa-solid fa-info-circle"></i>';
            let bg = type === 'success' ? 'bg-white text-black' : 'bg-white/95 text-black';
            toast.className = `fixed bottom-8 left-1/2 -translate-x-1/2 px-7 py-3.5 ${bg} text-sm font-medium rounded-3xl shadow-2xl flex items-center gap-x-2.5 z-[200]`;
            toast.innerHTML = `${icon} <span>${msg}</span>`;
            document.body.appendChild(toast);
            setTimeout(() => {
                toast.style.transition = 'all .25s ease';
                toast.style.opacity = '0';
                setTimeout(() => toast.remove(), 220);
            }, 2400);
        }

        // Mobile Menu
        function toggleMobileMenu() {
            const menu = document.getElementById('mobile-menu');
            const icon = document.getElementById('mobile-menu-icon');
            if (menu.classList.contains('hidden')) {
                menu.classList.remove('hidden');
                icon.classList.add('fa-times');
                icon.classList.remove('fa-bars');
            } else {
                menu.classList.add('hidden');
                icon.classList.remove('fa-times');
                icon.classList.add('fa-bars');
            }
        }

        // Boot
        window.onload = function() {
            init();
            
            // Hero floating card subtle animation
            setTimeout(() => {
                const heroCard = document.getElementById('hero-floating-card');
                if (heroCard) {
                    heroCard.style.transition = 'transform 3s cubic-bezier(0.23, 1, 0.32, 1)';
                    setInterval(() => {
                        if (heroCard) {
                            heroCard.style.transform = 'translateY(-6px)';
                            setTimeout(() => {
                                if (heroCard) heroCard.style.transform = 'translateY(0)';
                            }, 2800);
                        }
                    }, 6200);
                }
            }, 1800);
            
            // Keyboard shortcuts hint
            document.addEventListener('keypress', function(e) {
                if (e.key.toLowerCase() === 's' && document.activeElement.tagName === "BODY") {
                    addLiveUpdate();
                }
            });
        };
        
        // Global Demo API
        window.Symantic = {
            addLiveUpdate: () => addLiveUpdate(),
            refreshDashboard: () => refreshDashboard(),
            simulateChat: (q) => {
                const input = document.getElementById('chat-input');
                input.value = q;
                document.getElementById('ai').scrollIntoView({behavior:'smooth'});
                setTimeout(() => sendChatMessage(), 650);
            },
            filterLive: (type) => filterLiveFeed(type),
            showCommand: () => showCommandPalette()
        };
