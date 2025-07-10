import React, { useState, useEffect, useCallback, useMemo } from 'react';

// --- MOCK API & CONFIG ---
const TONKEEPER_WALLET_ADDRESS = "UQA0JhVw0w34-YQZpFxxY6dxFLL5HJOQYXIJOzD4GUFWvMVR";
const VIP_FEE_TON = 0.5;
const WITHDRAWAL_TAX_TON = 0.2;
const BOT_LINK = "https://t.me/Gcoin_ton_bot";
const SELL_BUY_LINK = "https://t.me/blum/app?startapp=memepadjetton_GCOIN_bUeAb-ref_eVORv4YQFS";
const TONKEEPER_PLAY_STORE_LINK = "https://play.google.com/store/apps/details?id=com.ton_keeper&hl=en-US&pli=1";
const ADMIN_TELEGRAM_ID = "Arena_net"; // The Telegram ID to send withdrawal/task notifications to.

// --- HELPER FUNCTIONS ---
const generateInviteLink = (userId) => `${BOT_LINK}?start=${userId}`;

// --- TELEGRAM INTEGRATION ---
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
        'store': <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>,
    };
    return icons[name] || null;
};

// --- MAIN SECTIONS ---

const DailySpin = ({ spins, setSpins, updateBalance, tg }) => {
    const segments = useMemo(() => [
        { label: '10', value: 10, type: 'gold' }, 
        { label: '20', value: 20, type: 'gold' }, 
        { label: '30', value: 30, type: 'gold' }, 
        { label: '50', value: 50, type: 'gold' },
        { label: '5', value: 5, type: 'gold' }, 
        { label: '15', value: 15, type: 'gold' },
        { label: 'MISS', value: 0, type: 'none' },
        { label: 'MISS', value: 0, type: 'none' },
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

    const getCoordinatesForPercent = (percent) => {
        const x = Math.cos(2 * Math.PI * percent);
        const y = Math.sin(2 * Math.PI * percent);
        return [x, y];
    };

    const pizzaSlices = segments.map((segment, index) => {
        const [startX, startY] = getCoordinatesForPercent(index / segments.length);
        const [endX, endY] = getCoordinatesForPercent((index + 1) / segments.length);
        const largeArcFlag = 1 / segments.length > 0.5 ? 1 : 0;

        const pathData = [
            `M ${startX * 100} ${startY * 100}`,
            `A 100 100 0 ${largeArcFlag} 1 ${endX * 100} ${endY * 100}`,
            `L 0 0`
        ].join(' ');

        const textAngle = ((index + 0.5) / segments.length) * 360;
        const textX = Math.cos(2 * Math.PI * (index + 0.5) / segments.length) * 65;
        const textY = Math.sin(2 * Math.PI * (index + 0.5) / segments.length) * 65;

        return {
            path: pathData,
            color: index % 2 === 0 ? '#22C55E' : '#FBBF24', // Alternating green and yellow
            label: segment.label,
            textTransform: `translate(${textX}, ${textY}) rotate(${textAngle + 90})`
        };
    });

    return (
        <div className="text-center p-4 sm:p-6 bg-gray-800 rounded-2xl shadow-lg">
            <h2 className="text-2xl sm:text-3xl font-bold text-yellow-400 mb-4">Daily Spin Wheel</h2>
            
            <div className="relative w-64 h-64 sm:w-80 sm:h-80 mx-auto my-8">
                <div 
                    className="absolute inset-0 transition-transform duration-[4000ms] ease-out"
                    style={{ transform: `rotate(${rotation}deg)` }}
                >
                    <svg viewBox="-105 -105 210 210" className="w-full h-full">
                        <g transform="rotate(-90)">
                            {pizzaSlices.map((slice, i) => (
                                <g key={i}>
                                    <path d={slice.path} fill={slice.color} stroke="#166534" strokeWidth="2" />
                                    <text
                                        transform={slice.textTransform}
                                        dy="0.35em"
                                        textAnchor="middle"
                                        fill="white"
                                        className="font-bold text-lg"
                                    >
                                        {slice.label}
                                    </text>
                                </g>
                            ))}
                        </g>
                    </svg>
                </div>
                <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 z-10">
                     <div className="w-0 h-0 border-l-8 border-r-8 border-b-16 border-l-transparent border-r-transparent border-b-red-500"></div>
                </div>
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
                    You landed on: <span className="font-bold text-yellow-400">{result.label}</span>
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

const TaskRequestForm = ({ tg, user, onClose }) => {
    const [projectName, setProjectName] = useState('');
    const [description, setDescription] = useState('');
    const [adLink, setAdLink] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!projectName || !description || !adLink) {
            if (tg) tg.showAlert('Please fill out all fields.');
            return;
        }

        const message = `New Task Request from ${user?.first_name || 'a user'} (ID: ${user?.id}):\n\nProject: ${projectName}\n\nDescription & Budget: ${description}\n\nLink: ${adLink}`;
        const url = `https://t.me/${ADMIN_TELEGRAM_ID}?text=${encodeURIComponent(message)}`;
        
        if (tg) {
            tg.openTelegramLink(url);
        } else {
            window.open(url, '_blank');
        }
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
            <div className="bg-gray-800 rounded-2xl shadow-2xl w-full max-w-sm p-5">
                <form onSubmit={handleSubmit}>
                    <h3 className="text-xl font-bold text-yellow-400 mb-4">Request a Task</h3>
                    <div className="space-y-4">
                        <input
                            type="text"
                            placeholder="Project Name"
                            value={projectName}
                            onChange={(e) => setProjectName(e.target.value)}
                            className="w-full p-3 bg-gray-900 text-white rounded-lg border-2 border-gray-700 focus:border-yellow-500 outline-none"
                        />
                        <textarea
                            placeholder="Project Description & Budget"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            rows="4"
                            className="w-full p-3 bg-gray-900 text-white rounded-lg border-2 border-gray-700 focus:border-yellow-500 outline-none"
                        />
                        <input
                            type="url"
                            placeholder="Advertisement Link"
                            value={adLink}
                            onChange={(e) => setAdLink(e.target.value)}
                            className="w-full p-3 bg-gray-900 text-white rounded-lg border-2 border-gray-700 focus:border-yellow-500 outline-none"
                        />
                    </div>
                    <div className="mt-6 flex justify-end space-x-3">
                        <button type="button" onClick={onClose} className="py-2 px-4 bg-gray-600 text-white font-semibold rounded-lg hover:bg-gray-500">Cancel</button>
                        <button type="submit" className="py-2 px-4 bg-blue-500 text-white font-bold rounded-lg hover:bg-blue-400">Submit Request</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const TaskSection = ({ updateBalance, tg, invitedFriendsCount, setConnectedWallet, connectedWallet, user }) => {
    const [tasks, setTasks] = useState([
        { id: 1, title: 'Win 3 Games', reward: 100, completed: false, type: 'normal' },
        { id: 2, title: 'Invite 5 friends', reward: 200, completed: false, type: 'invite' },
        { id: 3, title: 'Join our news channel', reward: 500, completed: false, type: 'join', link: 'https://t.me/GCoin_news' },
        { id: 4, title: 'Connect your Tonkeeper wallet', reward: 100, completed: !!connectedWallet, type: 'connect', tip: 'Make sure to connect a wallet that is linked to Blum.' }
    ]);
    const [showRequestForm, setShowRequestForm] = useState(false);

    useEffect(() => {
        setTasks(prevTasks => prevTasks.map(task => 
            task.type === 'connect' ? { ...task, completed: !!connectedWallet } : task
        ));
    }, [connectedWallet]);

    const handleClaim = (taskId) => {
        const task = tasks.find(t => t.id === taskId);
        if (!task || task.completed) return;

        if (task.type === 'invite' && invitedFriendsCount < 5) {
            if (tg) tg.showAlert('You must invite 5 friends to claim this reward.');
            return;
        }

        if (task.type === 'join' && task.link) {
            if (tg) tg.openLink(task.link); else window.open(task.link, '_blank');
        }
        
        if (task.type === 'connect') {
            const tonkeeperUrl = 'tonkeeper://';
            setTimeout(() => {
                const simulatedAddress = "UQ" + Math.random().toString(16).slice(2) + "..." + Math.random().toString(16).slice(2, 6);
                setConnectedWallet(simulatedAddress);
                if (tg) tg.showAlert(`Wallet connected: ${simulatedAddress}`);
            }, 1500);

            const fallbackTimeout = setTimeout(() => {
                window.location.href = TONKEEPER_PLAY_STORE_LINK;
            }, 2500);

            const handleVisibilityChange = () => {
                if (document.visibilityState === 'hidden') clearTimeout(fallbackTimeout);
                document.removeEventListener('visibilitychange', handleVisibilityChange);
            };
            document.addEventListener('visibilitychange', handleVisibilityChange);
            window.location.href = tonkeeperUrl;
        }
        
        updateBalance(task.reward);
        setTasks(tasks.map(t => t.id === taskId ? {...t, completed: true} : t));
        if (tg && task.type !== 'connect') {
            tg.HapticFeedback.notificationOccurred('success');
            tg.showAlert(`You claimed ${task.reward} Gold!`);
        }
    };

    return (
        <>
            <div className="p-4 sm:p-6 bg-gray-800 rounded-2xl shadow-lg">
                <div className="flex justify-between items-center mb-6">
                     <h2 className="text-2xl sm:text-3xl font-bold text-yellow-400">Tasks & Missions</h2>
                     <button onClick={() => setShowRequestForm(true)} className="flex items-center py-2 px-3 bg-purple-600 text-white font-bold rounded-lg active:scale-95 text-sm">
                        <Icon name="sparkles" className="w-4 h-4 mr-2" />
                        Request a Task
                     </button>
                </div>
                <div className="space-y-3">
                    {tasks.map(task => {
                        const isInviteTask = task.type === 'invite';
                        const canClaimInvite = isInviteTask && invitedFriendsCount >= 5;
                        
                        return (
                            <div key={task.id} className={`p-3 sm:p-4 rounded-lg flex justify-between items-center ${task.completed ? 'bg-gray-700 opacity-60' : 'bg-gray-700'}`}>
                                <div>
                                    <p className="font-semibold text-white text-sm sm:text-base">{task.title}</p>
                                    <p className="text-xs sm:text-sm text-yellow-400">Reward: {task.reward} Gold</p>
                                    {isInviteTask && <p className="text-xs text-green-400">Progress: {invitedFriendsCount} / 5</p>}
                                    {task.tip && !task.completed && <p className="text-xs text-gray-400 italic mt-1">{task.tip}</p>}
                                    {task.type === 'connect' && connectedWallet && <p className="text-xs text-green-400 mt-1">Wallet: {connectedWallet}</p>}
                                </div>
                                <div className="w-24 text-right">
                                    {task.completed ? (
                                        <span className="py-2 px-4 bg-green-600 text-white font-bold rounded-lg text-sm">
                                            Done
                                        </span>
                                    ) : (
                                        <button
                                            onClick={() => handleClaim(task.id)}
                                            disabled={isInviteTask && !canClaimInvite}
                                            className="py-2 px-4 bg-blue-500 text-white font-bold rounded-lg hover:bg-blue-400 disabled:bg-gray-600 disabled:cursor-not-allowed text-sm active:scale-95"
                                        >
                                            {task.type === 'join' ? 'Join' : (task.type === 'connect' ? 'Connect' : 'Claim')}
                                        </button>
                                    )}
                                </div>
                            </div>
                        )
                    })}
                </div>
            </div>
            {showRequestForm && <TaskRequestForm tg={tg} user={user} onClose={() => setShowRequestForm(false)} />}
        </>
    );
};

const WithdrawalSection = ({ balance, isVip, setIsVip, vipData, setVipData, tg, connectedWallet, user, updateBalance }) => {
    const [page, setPage] = useState('main');
    const [isVerifying, setIsVerifying] = useState(false);

    useEffect(() => {
        if (!isVerifying) return;

        const interval = setInterval(() => {
            console.log("Checking payment status...");
        }, 3000);

        const timeout = setTimeout(() => {
            clearInterval(interval);
            if(tg) tg.showAlert("VIP Payment Confirmed!");
            setIsVip(true);
            setVipData({ ...vipData, unlockedDaily: 1000 });
            setIsVerifying(false);
            setPage('main');
        }, 12000);

        return () => {
            clearInterval(interval);
            clearTimeout(timeout);
        };
    }, [isVerifying, tg, setIsVip, setVipData, vipData]);

    const sendWithdrawalNotification = () => {
        const message = `New VIP Withdrawal:\n\nTelegram ID: ${user.id}\nWallet: ${connectedWallet}\nAmount: 30,000 Gold`;
        const url = `https://t.me/${ADMIN_TELEGRAM_ID}?text=${encodeURIComponent(message)}`;
        if (tg) {
            tg.openTelegramLink(url);
        } else {
            window.open(url, '_blank');
        }
    };

    const handleVipAccept = () => {
        if (tg) {
            tg.openLink(`ton://transfer/${TONKEEPER_WALLET_ADDRESS}?amount=${VIP_FEE_TON * 1e9}&text=VIPActivation`);
            setIsVerifying(true);
        }
    };
    
    const handleWithdraw = () => {
        const amount = 30000;
        if (!connectedWallet) {
            if (tg) tg.showAlert('Please connect your wallet from the Tasks section first.');
            return;
        }
        if (balance < amount) {
            if (tg) tg.showAlert("You do not have enough Gold to withdraw.");
            return;
        }
        if (!isVip) {
            if (tg) tg.showAlert("You must be a VIP member to withdraw.");
            return;
        }

        tg.openLink(`ton://transfer/${connectedWallet}?amount=${WITHDRAWAL_TAX_TON * 1e9}&text=GoldCoinWithdrawal`);
        
        setTimeout(() => {
            updateBalance(-amount);
            sendWithdrawalNotification();
            if (tg) tg.showAlert("Withdrawal successful! A notification has been sent.");
            setPage('main');
        }, 8000);
    };

    const handleSellBuyClick = () => {
        if (tg) {
            tg.openLink(SELL_BUY_LINK, {try_instant_view: true});
        } else {
            window.open(SELL_BUY_LINK, '_blank');
        }
    };

    const renderPage = () => {
        if (isVerifying) {
            return (
                <div className="text-center p-8">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-400 mx-auto"></div>
                    <h2 className="text-xl font-bold text-yellow-400 mt-4">Verifying Payment</h2>
                    <p className="text-gray-300 text-sm mt-2">Please wait while we confirm your transaction on the blockchain.</p>
                </div>
            );
        }

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
                        <div className="text-center bg-gray-700 p-4 rounded-lg mb-4">
                            <p className="text-white text-lg">Withdrawal Amount: <span className="font-bold text-green-400">30,000 Gold</span></p>
                            <p className="text-xs text-gray-400 mt-1">This is a fixed amount for VIP members.</p>
                        </div>
                        <p className="text-xs text-center text-gray-400 mb-4">A tax of {WITHDRAWAL_TAX_TON} TON will be applied.</p>
                        <button onClick={handleWithdraw} disabled={!connectedWallet || balance < 30000} className="w-full py-3 bg-green-500 text-white font-bold rounded-lg shadow-md hover:bg-green-400 active:scale-95 disabled:bg-gray-500 disabled:cursor-not-allowed">
                            {!connectedWallet ? 'Connect Wallet First' : (balance < 30000 ? 'Not Enough Gold' : 'Withdraw via Tonkeeper')}
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
                            <div onClick={handleSellBuyClick} className="p-4 bg-blue-500 rounded-lg text-white cursor-pointer hover:bg-blue-400 transition-colors duration-200 flex items-center">
                                <Icon name="store" className="w-6 h-6 mr-3" />
                                <div>
                                    <h3 className="text-lg font-semibold">Sell/Buy</h3>
                                    <p className="text-sm text-blue-100">Access the marketplace.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                );
        }
    };

    return <div className="p-4 sm:p-6 bg-gray-800 rounded-2xl shadow-lg">{renderPage()}</div>;
};

const FriendSection = ({ setSpins, tg, user, invitedFriendsCount, setInvitedFriendsCount }) => {
    const inviteLink = user ? generateInviteLink(user.id) : '';

    const handleCopyLink = () => {
        if (!inviteLink || !tg) return;
        
        tg.HapticFeedback.impactOccurred('light');
        navigator.clipboard.writeText(inviteLink).then(() => {
            tg.showAlert('Your invite link has been copied!');
        }).catch(err => {
            console.error('Failed to copy: ', err);
            tg.showAlert('Failed to copy link.');
        });
    };

    const simulateInvite = () => {
        setInvitedFriendsCount(prev => prev + 1);
        if (tg) tg.showAlert('A friend has joined using your link! (Simulation)');
    };

    return (
        <div className="p-4 sm:p-6 bg-gray-800 rounded-2xl shadow-lg text-center">
            <h2 className="text-2xl sm:text-3xl font-bold text-yellow-400 mb-4">Invite Friends</h2>
            <p className="text-gray-300 mb-2 text-sm">Share your unique link with friends. You get an extra spin for each friend who joins!</p>
            <p className="text-gray-300 mb-6 text-sm">Friends Invited: <span className="font-bold text-green-400">{invitedFriendsCount}</span></p>

            <div className="p-3 bg-gray-900 rounded-lg flex items-center justify-between mb-4">
                <p className="text-green-400 font-mono text-xs sm:text-sm overflow-x-auto whitespace-nowrap">
                    {inviteLink ? inviteLink : 'Loading link...'}
                </p>
                <button onClick={handleCopyLink} className="ml-4 py-1 px-3 bg-yellow-500 text-gray-900 font-bold rounded-lg text-sm active:scale-95">Copy</button>
            </div>

            <button onClick={simulateInvite} className="w-full py-2 bg-indigo-500 text-white font-bold rounded-lg shadow-md hover:bg-indigo-400 active:scale-95 text-sm">
                Simulate a friend joining
            </button>
            <p className="text-xs text-gray-500 mt-2">(For testing purposes)</p>
        </div>
    );
};


// --- APP ---

export default function App() {
    const tg = useTelegram();
    const [user, setUser] = useState(null);
    const [balance, setBalance] = useState(0); // Initial balance is now 0
    const [spins, setSpins] = useState(3);
    const [activeTab, setActiveTab] = useState('spin');
    const [isVip, setIsVip] = useState(false);
    const [vipData, setVipData] = useState({ monthlyLimit: 30000, unlockedDaily: 0, withdrawnThisMonth: 0 });
    const [invitedFriendsCount, setInvitedFriendsCount] = useState(0);
    const [connectedWallet, setConnectedWallet] = useState(null);

    useEffect(() => {
        if (tg) {
            const telegramUser = tg.initDataUnsafe?.user;
            if (telegramUser) {
                setUser(telegramUser);
            } else {
                // Fallback for testing in a browser
                setUser({ id: '123456789', first_name: 'Browser' });
            }
        }
    }, [tg]);

    const updateBalance = useCallback((amount) => {
        setBalance(prev => prev + amount);
    }, []);

    const tabs = {
        'spin': <DailySpin spins={spins} setSpins={setSpins} updateBalance={updateBalance} tg={tg} />,
        'games': <GameSection balance={balance} updateBalance={updateBalance} tg={tg} />,
        'tasks': <TaskSection updateBalance={updateBalance} tg={tg} invitedFriendsCount={invitedFriendsCount} setConnectedWallet={setConnectedWallet} connectedWallet={connectedWallet} user={user} />,
        'withdraw': <WithdrawalSection balance={balance} isVip={isVip} setIsVip={setIsVip} vipData={vipData} setVipData={setVipData} tg={tg} connectedWallet={connectedWallet} user={user} updateBalance={updateBalance} />,
        'friends': <FriendSection setSpins={setSpins} tg={tg} user={user} invitedFriendsCount={invitedFriendsCount} setInvitedFriendsCount={setInvitedFriendsCount} />,
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
                        <p className="text-xs text-gray-400 mt-1">Welcome, {user?.first_name || 'Guest'}</p>
                    </div>
                    <div className="text-right">
                        <div className="flex items-center justify-end">
                            <Icon name="coin" className="w-5 h-5 text-yellow-400 mr-1" />
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
                            className={`flex-1 flex flex-col items-center py-2 px-1 text-center transition-colors duration-200 ${activeTab === item.id ? 'text-yellow-400' : 'text-gray-400 hover:text-green-400'}`}
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
