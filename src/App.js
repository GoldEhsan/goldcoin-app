import React, { useState, useEffect, useCallback, useMemo } from 'react';

// --- MOCK API & CONFIG ---
const TONKEEPER_WALLET_ADDRESS = "UQA0JhVw0w34-YQZpFxxY6dxFLL5HJOQYXIJOzD4GUFWvMVR";
const VIP_FEE_TON = 0.5;
const WITHDRAWAL_TAX_TON = 0.2;

// --- HELPER FUNCTIONS ---
const generateInviteLink = (userId) => `https://t.me/YOUR_BOT_USERNAME?start=${userId}`;

// --- TELEGRAM INTEGRATION (THIS WAS THE MISSING PART) ---
const useTelegram = () => {
    const [tg, setTg] = useState(null);

    useEffect(() => {
        if (window.Telegram && window.Telegram.WebApp) {
            const telegramApp = window.Telegram.WebApp;
            telegramApp.ready();
            telegramApp.expand();
            setTg(telegramApp);
        }
    }, []);

    return tg;
};


// --- UI COMPONENTS ---

const Icon = ({ name, className }) => {
    const icons = {
        'coin': <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.707l-3-3a1 1 0 00-1.414 0l-3 3a1 1 0 001.414 1.414L9 9.414V13a1 1 0 102 0V9.414l1.293 1.293a1 1 0 001.414-1.414z" clipRule="evenodd" /></svg>,
        'spinner': <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
        'game': <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 4a2 2 0 114 0v1a1 1 0 001 1h3a1 1 0 011 1v3a1 1 0 01-1 1h-1a2 2 0 100 4h1a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-1a2 2 0 10-4 0v1a1 1 0 01-1 1H7a1 1 0 01-1-1v-3a1 1 0 00-1-1H4a2 2 0 110-4h1a1 1 0 001-1V7a1 1 0 011-1h3a1 1 0 001-1V4z" /></svg>,
        'task': <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" /></svg>,
        'wallet': <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>,
        'friends': <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M15 21a6 6 0 00-9-5.197M15 11a4 4 0 110-5.292" /></svg>,
        'vip': <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 2a1 1 0 00-1 1v1a1 1 0 002 0V3a1 1 0 00-1-1zM4 4h3a3 3 0 006 0h3a2 2 0 012 2v9a2 2 0 01-2 2H4a2 2 0 01-2-2V6a2 2 0 012-2zm12 5a1 1 0 100-2H4a1 1 0 100 2h12zM4 13a1 1 0 100 2h12a1 1 0 100-2H4z" clipRule="evenodd" /></svg>,
        'sparkles': <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 3v4M3 5h4M19 3v4M17 5h4M14 11v4M12 13h4M5 19v-4M3 17h4M19 19v-4M17 17h4" /></svg>,
    };
    return icons[name] || null;
};

const Modal = ({ show, onClose, title, children }) => {
    if (!show) return null;
    return (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
            <div className="bg-gray-800 rounded-2xl shadow-2xl w-full max-w-sm p-5">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-bold text-yellow-400">{title}</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-white text-2xl">&times;</button>
                </div>
                <div>{children}</div>
            </div>
        </div>
    );
};


// --- MAIN SECTIONS ---

const DailySpin = ({ spins, setSpins, updateBalance, tg }) => {
    const segments = useMemo(() => [
        { label: '50', value: 50, type: 'gold' }, { label: 'Try Again', value: 0, type: 'none' },
        { label: '100', value: 100, type: 'gold' }, { label: 'Nothing', value: 0, type: 'none' },
        { label: '200', value: 200, type: 'gold' }, { label: 'Better Luck!', value: 0, type: 'none' },
        { label: '500', value: 500, type: 'gold' }, { label: 'Almost!', value: 0, type: 'none' },
    ], []);
    const [isSpinning, setIsSpinning] = useState(false);
    const [rotation, setRotation] = useState(0);
    const [result, setResult] = useState(null);

    const handleSpin = () => {
        if (spins <= 0 || isSpinning) return;

        if (tg) tg.HapticFeedback.impactOccurred('medium');
        setIsSpinning(true);
        setResult(null);
        setSpins(prev => prev - 1);

        const spinAngle = Math.floor(Math.random() * 360) + 360 * 5;
        const newRotation = rotation + spinAngle;
        setRotation(newRotation);

        setTimeout(() => {
            const segmentAngle = 360 / segments.length;
            const finalAngle = newRotation % 360;
            const winningIndex = Math.floor((360 - finalAngle + segmentAngle / 2) % 360 / segmentAngle);
            const selectedSegment = segments[winningIndex];
            
            setResult(selectedSegment);
            if (selectedSegment.type === 'gold') {
                updateBalance(selectedSegment.value);
                if (tg) tg.HapticFeedback.notificationOccurred('success');
            }
            setIsSpinning(false);
        }, 4000);
    };

    return (
        <div className="text-center p-4 sm:p-6 bg-gray-800 rounded-2xl shadow-lg">
            <h2 className="text-2xl sm:text-3xl font-bold text-yellow-400 mb-4">Daily Spin Wheel</h2>
            <div className="relative w-64 h-64 sm:w-80 sm:h-80 mx-auto mb-6">
                <div className="absolute inset-0 transition-transform duration-[4000ms] ease-out" style={{ transform: `rotate(${rotation}deg)` }}>
                    {segments.map((segment, i) => (
                        <div key={i} className="absolute w-1/2 h-1/2 origin-bottom-right" style={{ transform: `rotate(${i * (360 / segments.length)}deg)` }}>
                            <div className={`w-full h-full flex items-center justify-center text-white font-bold text-xs sm:text-lg ${i % 2 === 0 ? 'bg-yellow-500' : 'bg-yellow-600'}`} style={{ clipPath: 'polygon(0 0, 100% 0, 100% 100%)' }}>
                                <span style={{ transform: `rotate(22.5deg) translate(-50%, -10px)` }} className="block text-center">{segment.label}</span>
                            </div>
                        </div>
                    ))}
                </div>
                <div className="absolute top-1/2 left-1/2 w-6 h-6 bg-white rounded-full transform -translate-x-1/2 -translate-y-1/2 border-4 border-gray-900"></div>
                <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-2 w-0 h-0 border-l-8 border-r-8 border-b-16 border-l-transparent border-r-transparent border-b-red-500 z-10"></div>
            </div>
            
            <button
                onClick={handleSpin}
                disabled={spins <= 0 || isSpinning}
                className="w-full py-3 px-6 bg-yellow-500 text-gray-900 font-bold rounded-lg shadow-md hover:bg-yellow-400 disabled:bg-gray-600 disabled:cursor-not-allowed transition-all duration-300 transform active:scale-95"
            >
                {isSpinning ? 'Spinning...' : `Spin Now (${spins} left)`}
            </button>
            {result && (
                <div className="mt-4 p-3 bg-gray-700 rounded-lg text-md sm:text-lg">
                    Result: <span className="font-bold text-yellow-400">{result.label}</span>
                    {result.type === 'gold' && ` (+${result.value} Gold)`}
                </div>
            )}
        </div>
    );
};

const GameSection = ({ balance, updateBalance, tg }) => {
    const [selectedGame, setSelectedGame] = useState(null);
    const [strategy, setStrategy] = useState('');
    const [isFetchingStrategy, setIsFetchingStrategy] = useState(false);

    const games = [
        { name: 'Backgammon', icon: '🎲' },
        { name: 'Chess', icon: '♟️' },
        { name: 'Snakes & Ladders', icon: '🐍' },
    ];

    const findMatch = () => {
        if (balance < 10) {
            if (tg) tg.showAlert("You need at least 10 Gold to play.");
            return;
        }
        updateBalance(-10);
        if (tg) tg.showPopup({ title: "Matchmaking", message: "Finding an opponent..." });
        
        setTimeout(() => {
            const win = Math.random() > 0.5;
            if (win) {
                updateBalance(20);
                if (tg) tg.showAlert('You won! +20 Gold');
            } else {
                if (tg) tg.showAlert('You lost! -10 Gold');
            }
        }, 3000);
    };

    const fetchGameStrategy = async (gameName) => {
        setIsFetchingStrategy(true);
        setStrategy('');
        setSelectedGame(gameName);

        const prompt = `Give me a single, powerful, beginner-friendly tip for winning a game of ${gameName}. Be concise.`;
        
        try {
            const chatHistory = [{ role: "user", parts: [{ text: prompt }] }];
            const payload = { contents: chatHistory };
            const apiKey = "";
            const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;
            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            const result = await response.json();
            if (result.candidates && result.candidates[0]?.content?.parts[0]?.text) {
                setStrategy(result.candidates[0].content.parts[0].text);
            } else {
                setStrategy("Could not fetch a strategy at this time. Please try again.");
            }
        } catch (error) {
            console.error("Gemini API error:", error);
            setStrategy("An error occurred while fetching the strategy.");
        } finally {
            setIsFetchingStrategy(false);
        }
    };

    return (
        <div className="p-4 sm:p-6 bg-gray-800 rounded-2xl shadow-lg">
            <h2 className="text-2xl sm:text-3xl font-bold text-yellow-400 mb-6 text-center">Competitive Games</h2>
            <div className="space-y-4">
                {games.map(game => (
                    <div key={game.name} className="bg-gray-700 p-4 rounded-lg">
                        <div className="flex justify-between items-center">
                            <div className="flex items-center">
                                <span className="text-3xl mr-4">{game.icon}</span>
                                <span className="text-lg font-semibold text-white">{game.name}</span>
                            </div>
                            <button onClick={() => findMatch()} className="py-2 px-4 bg-green-500 text-white font-bold rounded-lg active:scale-95 text-sm">Play (10)</button>
                        </div>
                        {selectedGame === game.name && (
                            <div className="mt-3 pt-3 border-t border-gray-600">
                                {isFetchingStrategy && <p className="text-sm text-gray-400">Getting tip from AI Coach...</p>}
                                {strategy && <p className="text-sm text-yellow-300">{strategy}</p>}
                            </div>
                        )}
                        <button onClick={() => fetchGameStrategy(game.name)} disabled={isFetchingStrategy} className="w-full mt-2 text-xs text-center text-blue-400 hover:text-blue-300 disabled:text-gray-500">
                            {isFetchingStrategy ? 'Loading...' : '✨ Get AI Tip'}
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
};

const TaskSection = ({ updateBalance, tg }) => {
    const [tasks, setTasks] = useState([
        { id: 1, title: 'Win 3 Games', reward: 100, completed: false },
        { id: 2, title: 'Invite a Friend', reward: 50, completed: true },
    ]);
    const [isGeneratingTask, setIsGeneratingTask] = useState(false);

    const handleClaim = (taskId) => {
        const task = tasks.find(t => t.id === taskId);
        if (!task || task.completed) return;
        
        updateBalance(task.reward);
        setTasks(tasks.map(t => t.id === taskId ? {...t, completed: true} : t));
        if (tg) {
            tg.HapticFeedback.notificationOccurred('success');
            tg.showAlert(`You claimed ${task.reward} Gold!`);
        }
    };

    const generateNewTask = async () => {
        setIsGeneratingTask(true);
        const prompt = `Generate a single, creative task for a player in a mobile game called GoldCoin. The task should be something a player can achieve. The reward should be between 25 and 250 gold. Format the response as a JSON object with keys "title" and "reward". Example: {"title": "Win a game of Chess without losing a pawn", "reward": 150}`;

        try {
            const chatHistory = [{ role: "user", parts: [{ text: prompt }] }];
            const payload = { contents: chatHistory };
            const apiKey = "";
            const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;
            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            const result = await response.json();
            if (result.candidates && result.candidates[0]?.content?.parts[0]?.text) {
                // Clean the response to ensure it's valid JSON
                const rawText = result.candidates[0].content.parts[0].text;
                const jsonText = rawText.replace(/```json/g, '').replace(/```/g, '').trim();
                const newTaskData = JSON.parse(jsonText);
                const newTask = {
                    id: tasks.length + 1,
                    title: newTaskData.title,
                    reward: newTaskData.reward,
                    completed: false,
                };
                setTasks(prevTasks => [...prevTasks, newTask]);
            }
        } catch (error) {
            console.error("Gemini API error:", error);
            if(tg) tg.showAlert("Couldn't generate a new task. Please try again.");
        } finally {
            setIsGeneratingTask(false);
        }
    };

    return (
        <div className="p-4 sm:p-6 bg-gray-800 rounded-2xl shadow-lg">
            <div className="flex justify-between items-center mb-6">
                 <h2 className="text-2xl sm:text-3xl font-bold text-yellow-400">Tasks & Missions</h2>
                 <button onClick={generateNewTask} disabled={isGeneratingTask} className="flex items-center py-2 px-3 bg-purple-600 text-white font-bold rounded-lg active:scale-95 text-sm disabled:bg-gray-600">
                    <Icon name="sparkles" className="w-4 h-4 mr-2" />
                    {isGeneratingTask ? 'Generating...' : 'New Task'}
                 </button>
            </div>
            <div className="space-y-3">
                {tasks.map(task => (
                    <div key={task.id} className={`p-3 sm:p-4 rounded-lg flex justify-between items-center ${task.completed ? 'bg-gray-700 opacity-60' : 'bg-gray-700'}`}>
                        <div>
                            <p className="font-semibold text-white text-sm sm:text-base">{task.title}</p>
                            <p className="text-xs sm:text-sm text-yellow-400">Reward: {task.reward} Gold</p>
                        </div>
                        <button
                            onClick={() => handleClaim(task.id)}
                            disabled={task.completed}
                            className="py-2 px-4 bg-blue-500 text-white font-bold rounded-lg hover:bg-blue-400 disabled:bg-gray-600 disabled:cursor-not-allowed text-sm active:scale-95"
                        >
                            {task.completed ? 'Claimed' : 'Claim'}
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
};

const WithdrawalSection = ({ balance, isVip, setIsVip, vipData, setVipData, tg }) => {
    const [page, setPage] = useState('main');
    const [withdrawAmount, setWithdrawAmount] = useState('');

    const handleVipAccept = () => {
        if (tg) {
            tg.openLink(`ton://transfer/${TONKEEPER_WALLET_ADDRESS}?amount=${VIP_FEE_TON * 1e9}&text=VIPActivation`);
        }
        setTimeout(() => {
            if (tg) tg.showAlert("VIP Activated! (Simulated)");
            setIsVip(true);
            setVipData({ ...vipData, unlockedDaily: 1000 });
            setPage('main');
        }, 5000);
    };
    
    const handleWithdraw = () => {
        const amount = Number(withdrawAmount);
        if (amount <= 0 || !tg) return;
        if (amount > balance) {
            tg.showAlert("Insufficient balance.");
            return;
        }
        if (isVip && amount > vipData.unlockedDaily) {
            tg.showAlert("Withdrawal amount exceeds your daily unlocked limit.");
            return;
        }
        tg.openLink(`ton://transfer/${TONKEEPER_WALLET_ADDRESS}?amount=${WITHDRAWAL_TAX_TON * 1e9}&text=WithdrawalTax`);
        setTimeout(() => {
            tg.showAlert(`Withdrawal of ${amount} successful! (Simulated)`);
        }, 5000);
    };

    const renderPage = () => {
        switch(page) {
            case 'vip_info':
                return (
                    <div className="text-center">
                        <Icon name="vip" className="w-12 h-12 mx-auto text-yellow-400 mb-4" />
                        <h2 className="text-2xl font-bold text-yellow-400 mb-4">VIP Activation</h2>
                        <p className="text-gray-300 mb-6 text-sm">
                            Pay {VIP_FEE_TON} TON to withdraw up to {vipData.monthlyLimit.toLocaleString()} Gold per month.
                        </p>
                        <button onClick={handleVipAccept} className="w-full py-3 bg-yellow-500 text-gray-900 font-bold rounded-lg shadow-md hover:bg-yellow-400 active:scale-95">
                            Accept & Pay
                        </button>
                        <button onClick={() => setPage('main')} className="mt-4 text-gray-400 hover:text-white text-sm">Back</button>
                    </div>
                );
            case 'withdraw':
                return (
                    <div>
                        <h2 className="text-2xl font-bold text-yellow-400 mb-4 text-center">Online Withdrawal</h2>
                        {isVip && (
                            <div className="text-center bg-gray-700 p-3 rounded-lg mb-4">
                                <p className="text-white">Daily Unlocked: <span className="font-bold text-green-400">{vipData.unlockedDaily} Gold</span></p>
                            </div>
                        )}
                        <div className="mb-4">
                            <label className="block text-gray-400 mb-2 text-sm">Amount</label>
                            <input 
                                type="number"
                                value={withdrawAmount}
                                onChange={(e) => setWithdrawAmount(e.target.value)}
                                placeholder="Enter amount"
                                className="w-full p-3 bg-gray-900 text-white rounded-lg border-2 border-gray-700 focus:border-yellow-500 outline-none"
                            />
                        </div>
                        <p className="text-xs text-center text-gray-400 mb-4">Tax: {WITHDRAWAL_TAX_TON} TON</p>
                        <button onClick={handleWithdraw} className="w-full py-3 bg-green-500 text-white font-bold rounded-lg shadow-md hover:bg-green-400 active:scale-95">
                            Withdraw via Tonkeeper
                        </button>
                        <button onClick={() => setPage('main')} className="mt-4 w-full text-center text-gray-400 hover:text-white text-sm">Back</button>
                    </div>
                );
            default:
                return (
                    <div>
                        <h2 className="text-2xl sm:text-3xl font-bold text-yellow-400 mb-6 text-center">Withdrawals</h2>
                        <div className="space-y-4">
                            <div className="p-4 bg-gray-700 rounded-lg">
                                <h3 className="text-lg font-semibold text-white">Free Withdrawal</h3>
                                <p className="text-gray-400 text-sm">Temporarily closed.</p>
                            </div>
                            <div className="p-4 bg-yellow-600 rounded-lg text-white">
                                <h3 className="text-lg font-semibold">VIP Withdrawal</h3>
                                {!isVip ? (
                                    <button onClick={() => setPage('vip_info')} className="mt-2 py-2 px-4 bg-gray-800 rounded-lg font-bold hover:bg-gray-900 active:scale-95 text-sm">Activate VIP</button>
                                ) : (
                                    <button onClick={() => setPage('withdraw')} className="mt-2 py-2 px-4 bg-green-500 rounded-lg font-bold hover:bg-green-600 active:scale-95 text-sm">Withdraw Now</button>
                                )}
                            </div>
                        </div>
                    </div>
                );
        }
    };

    return <div className="p-4 sm:p-6 bg-gray-800 rounded-2xl shadow-lg">{renderPage()}</div>;
};

const FriendSection = ({ setSpins, tg }) => {
    const handleShare = () => {
        if (!tg) return;
        const userId = tg.initDataUnsafe?.user?.id || 'guest';
        const link = generateInviteLink(userId);
        
        tg.openTelegramLink(`https://t.me/share/url?url=${encodeURIComponent(link)}&text=${encodeURIComponent("Join me on GoldCoin and get free rewards!")}`);
        
        setSpins(prev => prev + 1);
        tg.HapticFeedback.notificationOccurred('success');
        tg.showAlert("You received an extra spin for sharing!");
    };

    return (
        <div className="p-4 sm:p-6 bg-gray-800 rounded-2xl shadow-lg text-center">
            <h2 className="text-2xl sm:text-3xl font-bold text-yellow-400 mb-4">Invite a Friend</h2>
            <p className="text-gray-300 mb-6 text-sm">Share an invite link to receive 1 extra spin for today!</p>
            <button onClick={handleShare} className="w-full py-3 bg-blue-500 text-white font-bold rounded-lg shadow-md hover:bg-blue-400 active:scale-95">
                Share Invite
            </button>
        </div>
    );
};


// --- APP ---

export default function App() {
    const tg = useTelegram();
    const [user, setUser] = useState(null);
    const [balance, setBalance] = useState(1000);
    const [spins, setSpins] = useState(3);
    const [activeTab, setActiveTab] = useState('spin');
    const [isVip, setIsVip] = useState(false);
    const [vipData, setVipData] = useState({ monthlyLimit: 30000, unlockedDaily: 0, withdrawnThisMonth: 0 });

    useEffect(() => {
        if (tg) {
            setUser(tg.initDataUnsafe?.user);
        }
    }, [tg]);

    const updateBalance = useCallback((amount) => {
        setBalance(prev => prev + amount);
    }, []);

    const tabs = {
        'spin': <DailySpin spins={spins} setSpins={setSpins} updateBalance={updateBalance} tg={tg} />,
        'games': <GameSection balance={balance} updateBalance={updateBalance} tg={tg} />,
        'tasks': <TaskSection updateBalance={updateBalance} tg={tg} />,
        'withdraw': <WithdrawalSection balance={balance} isVip={isVip} setIsVip={setIsVip} vipData={vipData} setVipData={setVipData} tg={tg} />,
        'friends': <FriendSection setSpins={setSpins} tg={tg} />,
    };

    const navItems = [
        { id: 'spin', icon: 'spinner', label: 'Spin' },
        { id: 'games', icon: 'game', label: 'Games' },
        { id: 'tasks', icon: 'task', label: 'Tasks' },
        { id: 'withdraw', icon: 'wallet', label: 'Withdraw' },
        { id: 'friends', icon: 'friends', label: 'Friends' },
    ];

    return (
        <div className="bg-gray-900 text-white min-h-screen font-sans flex flex-col">
            <div className="flex-grow container mx-auto max-w-lg p-3 sm:p-4">
                <header className="bg-gray-800 rounded-xl p-3 mb-4 shadow-lg flex justify-between items-center">
                    <div>
                        <h1 className="text-xl font-bold text-yellow-400">GoldCoin</h1>
                        <p className="text-xs text-gray-400">Welcome, {user ? user.first_name : 'Player'}</p>
                    </div>
                    <div className="text-right">
                        <div className="flex items-center justify-end">
                            <Icon name="coin" className="w-5 h-5 text-yellow-500 mr-1" />
                            <span className="text-lg font-bold">{balance.toLocaleString()}</span>
                        </div>
                    </div>
                </header>

                <main>
                    {tabs[activeTab]}
                </main>
            </div>

            <div className="h-20"></div>

            <footer className="fixed bottom-0 left-0 right-0 bg-gray-800 shadow-t-lg border-t border-gray-700">
                <nav className="container mx-auto max-w-lg flex justify-around">
                    {navItems.map(item => (
                        <button 
                            key={item.id}
                            onClick={() => setActiveTab(item.id)} 
                            className={`flex-1 flex flex-col items-center py-2 px-1 text-center transition-colors duration-200 ${activeTab === item.id ? 'text-yellow-400' : 'text-gray-400 hover:text-yellow-500'}`}
                        >
                            <Icon name={item.icon} className="w-7 h-7" />
                            <span className="text-xs mt-1">{item.label}</span>
                        </button>
                    ))}
                </nav>
            </footer>
        </div>
    );
}
