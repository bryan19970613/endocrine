import React, { useState, useEffect, useRef } from 'react';
import { Heart, Activity, AlertTriangle, Pill, Timer, Skull, Stethoscope, FileText, Syringe, RefreshCw } from 'lucide-react';

/**
 * Endocrine ER: Code Red
 * A high-stakes pharmacology decision game based on endocrine system treatments.
 * * Clinical Scenarios:
 * 1. Thyroid Storm in Pregnancy
 * 2. Fetal Lung Maturation
 * 3. Liver Impairment & Steroids
 * 4. Agranulocytosis (Thioamides side effect)
 * 5. Addison's Disease
 * 6. BPH & Male Pattern Baldness
 * 7. Myxedema Coma
 * 8. Breast Cancer (SERMs)
 * 9. Adrenal Crisis (Withdrawal)
 * 10. Mineralocorticoid Potency (Edema)
 */

const SCENARIOS = [
  {
    id: 1,
    title: "Thyroid Storm in Pregnancy",
    symptoms: "Pregnant woman (First Trimester) presenting with sudden high fever and tachycardia. Diagnosed with Thyroid Storm.",
    history: "No other significant medical history.",
    options: ["Methimazole", "Propylthiouracil (PTU)", "Levothyroxine", "Radioactive Iodine"],
    correct: "Propylthiouracil (PTU)",
    reason: "PTU is preferred in the first trimester (Methimazole is teratogenic). PTU also inhibits peripheral conversion of T4 to T3, making it suitable for thyroid storm.",
    difficulty: "Hard"
  },
  {
    id: 2,
    title: "Fetal Lung Maturation",
    symptoms: "Pregnant patient showing signs of preterm labor. Medication needed to promote fetal lung maturation.",
    history: "Fetus at approx. 28 weeks.",
    options: ["Prednisone", "Cortisone", "Dexamethasone", "Fludrocortisone"],
    correct: "Dexamethasone",
    reason: "Dexamethasone is an active drug and crosses the placenta. Prednisone is deactivated by placental 11β-HSD2 and is ineffective for the fetus.",
    difficulty: "Medium"
  },
  {
    id: 3,
    title: "Inflammation with Liver Impairment",
    symptoms: "Patient with severe cirrhosis requires systemic steroids for inflammation control.",
    history: "Extremely high ALT/AST levels.",
    options: ["Prednisone", "Prednisolone", "Cortisone", "Methimazole"],
    correct: "Prednisolone",
    reason: "Prednisone is a prodrug requiring hepatic conversion. Patients with poor liver function should directly use the active drug, Prednisolone.",
    difficulty: "Medium"
  },
  {
    id: 4,
    title: "Severe Drug Adverse Reaction",
    symptoms: "Patient presents with sudden high fever and severe sore throat after weeks of taking anti-thyroid medication.",
    history: "Currently taking PTU.",
    options: ["Prescribe Antibiotics", "Increase PTU Dosage", "Switch to Methimazole", "Stop Drug Immediately & Check WBC"],
    correct: "Stop Drug Immediately & Check WBC",
    reason: "This is a warning sign of Agranulocytosis, a severe side effect of Thioamides. The drug must be stopped immediately.",
    difficulty: "Hard"
  },
  {
    id: 5,
    title: "Addison's Disease Treatment",
    symptoms: "Diagnosed with Primary Adrenal Insufficiency (Addison's Disease), presenting with hypotension and hyperkalemia.",
    history: "Requires mineralocorticoid replacement.",
    options: ["Dexamethasone", "Spironolactone", "Fludrocortisone", "Tamoxifen"],
    correct: "Fludrocortisone",
    reason: "Fludrocortisone is a potent mineralocorticoid agonist (strong sodium retention) used for replacement therapy. Spironolactone is an antagonist and would be fatal.",
    difficulty: "Medium"
  },
  {
    id: 6,
    title: "BPH Treatment",
    symptoms: "Elderly male with difficulty urinating, diagnosed with Benign Prostatic Hyperplasia (BPH).",
    history: "Patient also desires treatment for male pattern baldness.",
    options: ["Flutamide", "Finasteride", "Tamoxifen", "Testosterone"],
    correct: "Finasteride",
    reason: "Finasteride is a 5α-reductase inhibitor. It reduces DHT production, shrinking the prostate and treating male pattern baldness. Flutamide is a receptor blocker.",
    difficulty: "Medium"
  },
  {
    id: 7,
    title: "Myxedema Coma",
    symptoms: "Patient presents with extreme hypothyroidism and is comatose (Myxedema Coma).",
    history: "Emergency resuscitation required.",
    options: ["Levothyroxine (T4)", "Liothyronine (T3)", "Lugol's Solution", "PTU"],
    correct: "Liothyronine (T3)",
    reason: "While T4 is the standard maintenance therapy, Myxedema Coma is an emergency requiring the fast-acting, high-potency T3 (Liothyronine) to save life.",
    difficulty: "Hard"
  },
  {
    id: 8,
    title: "Breast Cancer Treatment",
    symptoms: "Premenopausal woman diagnosed with estrogen-dependent breast cancer.",
    history: "No history of osteoporosis.",
    options: ["Raloxifene", "Tamoxifen", "Estradiol", "Progesterone"],
    correct: "Tamoxifen",
    reason: "Tamoxifen acts as an antagonist in breast tissue (treating cancer). Raloxifene is primarily used for osteoporosis prevention.",
    difficulty: "Medium"
  },
  {
    id: 9,
    title: "Adrenal Crisis (Withdrawal)",
    symptoms: "Patient on long-term high-dose steroids suddenly stopped medication completely.",
    history: "Admitted with hypotension and shock.",
    options: ["Administer Epinephrine", "Administer High-Dose IV Steroids", "Administer Antibiotics", "Observe"],
    correct: "Administer High-Dose IV Steroids",
    reason: "This is Acute Adrenal Crisis. Long-term negative feedback causes adrenal atrophy; sudden withdrawal is fatal. Immediate steroid replacement is needed.",
    difficulty: "Hard"
  },
  {
    id: 10,
    title: "Edema Side Effects",
    symptoms: "Patient requires steroids but has severe edema and a history of heart failure. Need a drug with minimal mineralocorticoid activity.",
    history: "Poor cardiac function.",
    options: ["Hydrocortisone", "Prednisone", "Dexamethasone", "Cortisone"],
    correct: "Dexamethasone",
    reason: "Dexamethasone has 0 sodium retention activity, preventing worsening of edema. Prednisone still has slight (0.8) retention activity.",
    difficulty: "Hard"
  }
];

// Shuffle array utility
const shuffle = (array) => {
  return [...array].sort(() => Math.random() - 0.5);
};

export default function EndocrineERGame() {
  const [gameState, setGameState] = useState('start'); // start, playing, won, lost
  const [currentLevel, setCurrentLevel] = useState(0);
  const [hp, setHp] = useState(100);
  const [timeLeft, setTimeLeft] = useState(100);
  const [shuffledScenarios, setShuffledScenarios] = useState([]);
  const [shuffledOptions, setShuffledOptions] = useState([]);
  const [feedback, setFeedback] = useState(null); // { type: 'success' | 'error', message: string }
  const [combo, setCombo] = useState(0);

  const timerRef = useRef(null);

  // Initialize Game
  const startGame = () => {
    const scenarios = shuffle(SCENARIOS);
    setShuffledScenarios(scenarios);
    setGameState('playing');
    setCurrentLevel(0);
    setHp(100);
    setTimeLeft(100); 
    setCombo(0);
    setFeedback(null);
    prepareLevel(scenarios[0]);
  };

  const prepareLevel = (scenario) => {
    setShuffledOptions(shuffle(scenario.options));
    setTimeLeft(20); // 20 seconds per question hard mode
  };

  // Timer Logic
  useEffect(() => {
    if (gameState === 'playing' && !feedback) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 0) {
            handleTimeOut();
            return 0;
          }
          return prev - 0.1; // Smooth updates
        });
      }, 100);
    }
    return () => clearInterval(timerRef.current);
  }, [gameState, feedback, currentLevel]);

  const handleTimeOut = () => {
    clearInterval(timerRef.current);
    handleAnswer(null, true);
  };

  const handleAnswer = (selectedOption, isTimeout = false) => {
    clearInterval(timerRef.current);
    const currentScenario = shuffledScenarios[currentLevel];
    
    let isCorrect = false;
    if (!isTimeout && selectedOption === currentScenario.correct) {
      isCorrect = true;
    }

    if (isCorrect) {
      setCombo(prev => prev + 1);
      setFeedback({
        type: 'success',
        title: 'Diagnosis Correct',
        message: currentScenario.reason
      });
      // Heal slightly on correct answer
      setHp(prev => Math.min(100, prev + 10));
    } else {
      setCombo(0);
      const damage = 35; // High damage punishment
      const newHp = hp - damage;
      setHp(newHp);
      
      setFeedback({
        type: 'error',
        title: isTimeout ? 'Resuscitation Failed (Timeout)' : 'Medical Error',
        message: isTimeout 
          ? `Patient vital signs lost. Correct treatment was: ${currentScenario.correct}`
          : `Wrong choice! ${currentScenario.reason}`
      });

      if (newHp <= 0) {
        setTimeout(() => setGameState('lost'), 3500);
        return;
      }
    }

    // Next Level Delay
    setTimeout(() => {
      if (currentLevel + 1 >= shuffledScenarios.length) {
        setGameState('won');
      } else {
        setCurrentLevel(prev => prev + 1);
        setFeedback(null);
        prepareLevel(shuffledScenarios[currentLevel + 1]);
      }
    }, 4000); // 4 seconds to read the explanation
  };

  // Render Functions
  const getHealthColor = () => {
    if (hp > 60) return 'bg-green-500';
    if (hp > 30) return 'bg-yellow-500';
    return 'bg-red-600 animate-pulse';
  };

  if (gameState === 'start') {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-slate-900 text-white p-4 font-sans">
        <div className="max-w-md w-full bg-slate-800 p-8 rounded-2xl shadow-2xl border border-slate-700 text-center">
          <div className="flex justify-center mb-6">
            <div className="relative">
              <Heart className="w-20 h-20 text-red-500 animate-pulse" fill="currentColor" />
              <Activity className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-slate-900 w-10 h-10" />
            </div>
          </div>
          <h1 className="text-4xl font-bold mb-2 text-red-500 tracking-wider">Endocrine ER</h1>
          <h2 className="text-xl text-slate-400 mb-6">CODE RED: PHARMACOLOGY</h2>
          
          <div className="bg-slate-900/50 p-4 rounded-lg text-left mb-6 text-sm space-y-2 border border-slate-700">
            <p className="flex items-center text-slate-300"><AlertTriangle className="w-4 h-4 mr-2 text-yellow-500"/> High-stakes Pharmacology Challenge</p>
            <p className="flex items-center text-slate-300"><Timer className="w-4 h-4 mr-2 text-blue-500"/> 20 seconds to save each patient</p>
            <p className="flex items-center text-slate-300"><Skull className="w-4 h-4 mr-2 text-red-500"/> Wrong choices cause massive damage</p>
          </div>

          <button 
            onClick={startGame}
            className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-4 px-6 rounded-xl transition-all transform hover:scale-105 shadow-lg flex items-center justify-center gap-2"
          >
            <Stethoscope className="w-6 h-6" />
            Start Shift
          </button>
        </div>
      </div>
    );
  }

  if (gameState === 'lost') {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-red-950 text-white p-4 text-center">
        <Skull className="w-24 h-24 text-red-500 mb-6 animate-bounce" />
        <h1 className="text-5xl font-bold mb-4 text-red-500">Mission Failed</h1>
        <p className="text-xl text-red-200 mb-8">You lost the patient on Case #{currentLevel + 1}.</p>
        <p className="mb-8 max-w-md text-slate-300 italic">"The negative feedback loop of the endocrine system is unforgiving, and so is your decision making."</p>
        <button 
          onClick={startGame}
          className="bg-slate-800 hover:bg-slate-700 text-white font-bold py-3 px-8 rounded-full border border-slate-600 flex items-center gap-2"
        >
          <RefreshCw className="w-5 h-5" />
          Retry
        </button>
      </div>
    );
  }

  if (gameState === 'won') {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-emerald-950 text-white p-4 text-center">
        <div className="mb-6 bg-yellow-500/20 p-6 rounded-full">
          <FileText className="w-24 h-24 text-yellow-400" />
        </div>
        <h1 className="text-5xl font-bold mb-4 text-emerald-400">Perfect Practice</h1>
        <p className="text-xl text-emerald-100 mb-8">You successfully saved all patients!</p>
        <div className="bg-emerald-900/50 p-6 rounded-xl border border-emerald-700 max-w-md mb-8">
          <p className="text-lg font-semibold">Key Takeaways:</p>
          <ul className="text-left list-disc list-inside mt-4 space-y-2 text-emerald-200 text-sm">
            <li>Thyroid Storm in Pregnancy: PTU (1st Trimester)</li>
            <li>Fetal Lung Maturation: Dexamethasone</li>
            <li>Addison's Disease: Fludrocortisone</li>
            <li>Watch for Agranulocytosis with PTU/Methimazole</li>
          </ul>
        </div>
        <button 
          onClick={startGame}
          className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 px-8 rounded-full shadow-lg"
        >
          Play Again
        </button>
      </div>
    );
  }

  const currentScenario = shuffledScenarios[currentLevel];

  return (
    <div className="min-h-screen bg-slate-900 text-slate-200 font-sans flex flex-col">
      {/* Top HUD */}
      <div className="bg-slate-800 border-b border-slate-700 p-4 shadow-md sticky top-0 z-10">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="flex flex-col">
              <span className="text-xs text-slate-400 uppercase tracking-widest">Patient Vitality</span>
              <div className="w-48 h-4 bg-slate-900 rounded-full overflow-hidden border border-slate-600 relative">
                <div 
                  className={`h-full transition-all duration-500 ${getHealthColor()}`} 
                  style={{ width: `${hp}%` }}
                />
                <span className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-white drop-shadow-md">
                  {hp}%
                </span>
              </div>
            </div>
            <div className="hidden md:flex flex-col ml-4">
               <span className="text-xs text-slate-400 uppercase tracking-widest">Case</span>
               <span className="font-mono text-xl text-blue-400">{currentLevel + 1} <span className="text-slate-500 text-sm">/ {SCENARIOS.length}</span></span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Timer className={`w-5 h-5 ${timeLeft < 5 ? 'text-red-500 animate-spin' : 'text-slate-400'}`} />
            <span className={`font-mono text-2xl font-bold ${timeLeft < 5 ? 'text-red-500' : 'text-white'}`}>  
              {timeLeft.toFixed(1)}s
            </span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 max-w-4xl mx-auto w-full p-4 flex flex-col justify-center">
        
        {/* Scenario Card */}
        <div className="bg-slate-800 rounded-2xl p-6 shadow-xl border border-slate-700 mb-6 relative overflow-hidden">
          {/* Background decoration */}
          <div className="absolute top-0 right-0 p-4 opacity-5">
            <Activity className="w-64 h-64 text-white" />
          </div>

          <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-blue-400 flex items-center gap-2">
                <FileText className="w-6 h-6" />
                {currentScenario.title}
              </h2>
              <span className={`px-3 py-1 rounded-full text-xs font-bold border ${
                currentScenario.difficulty === 'Hard' ? 'bg-red-900/30 text-red-400 border-red-800' : 'bg-yellow-900/30 text-yellow-400 border-yellow-800'
              }`}>  
                {currentScenario.difficulty}
              </span>
            </div>

            <div className="space-y-4 text-lg">
              <div className="bg-slate-900/50 p-4 rounded-lg border-l-4 border-yellow-500">
                <p className="text-slate-400 text-sm uppercase mb-1">Chief Complaint</p>
                <p className="text-white font-medium">{currentScenario.symptoms}</p>
              </div>
              <div className="bg-slate-900/50 p-4 rounded-lg border-l-4 border-blue-500">
                 <p className="text-slate-400 text-sm uppercase mb-1">History & Vitals</p>
                 <p className="text-slate-200">{currentScenario.history}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Feedback Overlay */}
        {feedback && (
           <div className={`mb-6 p-4 rounded-xl border animate-fade-in ${
             feedback.type === 'success' ? 'bg-green-900/20 border-green-500 text-green-200' : 'bg-red-900/20 border-red-500 text-red-200'
           }`}> 
             <h3 className="font-bold text-lg mb-1 flex items-center gap-2">
               {feedback.type === 'success' ? <RefreshCw className="w-5 h-5" /> : <AlertTriangle className="w-5 h-5" />}
               {feedback.title}
             </h3>
             <p>{feedback.message}</p>
           </div>
        )}

        {/* Action Buttons */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {shuffledOptions.map((option, idx) => (
            <button
              key={idx}
              disabled={!!feedback}
              onClick={() => handleAnswer(option)}
              className={`p-5 rounded-xl text-left transition-all transform border-2 flex items-center gap-3 relative overflow-hidden group
                ${feedback 
                  ? option === currentScenario.correct 
                    ? 'bg-green-600 border-green-400 text-white opacity-100 scale-105' // Show correct answer
                    : 'bg-slate-800 border-slate-700 text-slate-500 opacity-50' // Dim others
                  : 'bg-slate-800 border-slate-700 hover:border-blue-400 hover:bg-slate-750 hover:shadow-lg active:scale-95'
                }
              `}
            >
              <div className={`p-2 rounded-lg {
                feedback && option === currentScenario.correct ? 'bg-green-500 text-white' : 'bg-slate-700 text-blue-300 group-hover:bg-blue-500 group-hover:text-white transition-colors'
              }`}>  
                {idx === 0 ? <Pill className="w-6 h-6" /> : 
                 idx === 1 ? <Syringe className="w-6 h-6" /> :
                 idx === 2 ? <Stethoscope className="w-6 h-6" /> :
                 <Activity className="w-6 h-6" />}
              </div>
              <span className="font-semibold text-lg">{option}</span>
            </button>
          ))}
        </div>
      </div>
    );
  }