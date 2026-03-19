import { Toaster } from "@/components/ui/sonner";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AnimatePresence, motion } from "motion/react";
import { useCallback, useEffect, useState } from "react";

const queryClient = new QueryClient();

function AppWrapper() {
  return (
    <QueryClientProvider client={queryClient}>
      <DesiLotteryGame />
      <Toaster />
    </QueryClientProvider>
  );
}

// ── Types ──────────────────────────────────────────────────────────────────
type GamePhase = "pick" | "result";
type ResultType = "jackpot" | "two" | "one" | "zero";

interface GameState {
  playerNumbers: number[];
  computerNumbers: number[];
  matches: number;
  resultType: ResultType;
}

// ── Confetti Piece ─────────────────────────────────────────────────────────
interface ConfettiPiece {
  id: number;
  x: number;
  color: string;
  delay: number;
  duration: number;
  size: number;
  shape: "square" | "circle" | "star";
}

const CONFETTI_COLORS = [
  "#FF6600",
  "#D4AF37",
  "#FF1493",
  "#00C853",
  "#2196F3",
  "#FF9800",
  "#E91E63",
  "#4CAF50",
];

const FIREWORK_POSITIONS = [20, 50, 80];

function generateConfetti(count: number): ConfettiPiece[] {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    color: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
    delay: Math.random() * 2,
    duration: 2 + Math.random() * 3,
    size: 6 + Math.random() * 10,
    shape: (["square", "circle", "star"] as const)[
      Math.floor(Math.random() * 3)
    ],
  }));
}

// ── String Lights ─────────────────────────────────────────────────────────
const LIGHT_COLORS = [
  "#FF6600",
  "#D4AF37",
  "#FF1493",
  "#00C853",
  "#2196F3",
  "#FF9800",
];
const LIGHTS_COUNT = Array.from({ length: 24 }, (_, i) => i);

function StringLights() {
  return (
    <div
      className="flex items-end justify-center gap-0 overflow-hidden w-full"
      style={{ height: 36 }}
    >
      <svg
        className="absolute top-0 left-0 w-full"
        height="36"
        viewBox="0 0 1200 36"
        preserveAspectRatio="none"
        aria-label="Decorative string lights"
      >
        <title>Decorative string lights</title>
        <path
          d="M0,4 Q100,20 200,8 Q300,20 400,8 Q500,20 600,8 Q700,20 800,8 Q900,20 1000,8 Q1100,20 1200,8"
          stroke="oklch(0.35 0.05 45)"
          strokeWidth="1.5"
          fill="none"
        />
      </svg>
      {LIGHTS_COUNT.map((i) => (
        <span
          key={`light-${i}`}
          className="string-light relative"
          style={{
            color: LIGHT_COLORS[i % LIGHT_COLORS.length],
            backgroundColor: LIGHT_COLORS[i % LIGHT_COLORS.length],
            animationDelay: `${(i * 0.2) % 1.5}s`,
            margin: "0 12px",
            marginTop: i % 2 === 0 ? 6 : 14,
          }}
        />
      ))}
    </div>
  );
}

// ── Rangoli SVG ────────────────────────────────────────────────────────────
const RANGOLI_ANGLES = [0, 45, 90, 135, 180, 225, 270, 315];

function RangoliDecoration({ size = 80 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 80 80"
      className="opacity-40"
      aria-label="Rangoli decoration"
    >
      <title>Rangoli decoration</title>
      <circle cx="40" cy="40" r="4" fill="#D4AF37" />
      {RANGOLI_ANGLES.map((angle) => (
        <g key={`angle-${angle}`} transform={`rotate(${angle} 40 40)`}>
          <ellipse
            cx="40"
            cy="22"
            rx="3"
            ry="8"
            fill={
              CONFETTI_COLORS[
                RANGOLI_ANGLES.indexOf(angle) % CONFETTI_COLORS.length
              ]
            }
            opacity="0.7"
          />
          <circle
            cx="40"
            cy="14"
            r="2.5"
            fill={
              CONFETTI_COLORS[
                (RANGOLI_ANGLES.indexOf(angle) + 2) % CONFETTI_COLORS.length
              ]
            }
          />
        </g>
      ))}
      <circle
        cx="40"
        cy="40"
        r="12"
        fill="none"
        stroke="#D4AF37"
        strokeWidth="1.5"
        strokeDasharray="4 3"
      />
      <circle
        cx="40"
        cy="40"
        r="20"
        fill="none"
        stroke="#FF6600"
        strokeWidth="1"
        strokeDasharray="3 4"
      />
    </svg>
  );
}

// ── Number Tile ────────────────────────────────────────────────────────────
interface NumberTileProps {
  num: number;
  isSelected: boolean;
  isDisabled: boolean;
  onClick: () => void;
  index: number;
}

function NumberTile({
  num,
  isSelected,
  isDisabled,
  onClick,
  index,
}: NumberTileProps) {
  return (
    <motion.button
      type="button"
      data-ocid={`number.item.${index}`}
      onClick={onClick}
      disabled={isDisabled}
      whileHover={!isDisabled && !isSelected ? { scale: 1.08, y: -2 } : {}}
      whileTap={!isDisabled ? { scale: 0.95 } : {}}
      className={`
        relative w-full aspect-square flex items-center justify-center
        rounded-xl border-2 cursor-pointer font-devanagari font-black
        text-2xl sm:text-3xl transition-all duration-200
        ${isSelected ? "tile-selected" : "bg-white border-[oklch(0.85_0.04_85)] hover:border-[oklch(0.67_0.2_48)] hover:bg-[oklch(0.97_0.03_80)] text-foreground"}
        ${isDisabled && !isSelected ? "opacity-40 cursor-not-allowed" : ""}
      `}
    >
      {num}
    </motion.button>
  );
}

// ── Result Message ─────────────────────────────────────────────────────────
function ResultMessage({
  resultType,
  matches,
}: { resultType: ResultType; matches: number }) {
  const configs = {
    jackpot: {
      emoji: "🎉",
      hindi: "जैकपॉट! आप जीत गए!",
      english: "JACKPOT!",
      sub: "तीनों नंबर मिले! बधाई हो!",
      bg: "from-[#D4AF37] to-[#FF8C00]",
    },
    two: {
      emoji: "🎊",
      hindi: "शाबाश! आप लगभग जीत गए!",
      english: "Almost there!",
      sub: `${matches} नंबर मिले! बहुत बढ़िया!`,
      bg: "from-[#FF6600] to-[#FF9800]",
    },
    one: {
      emoji: "👍",
      hindi: "अच्छा प्रयास!",
      english: "Keep trying!",
      sub: `${matches} नंबर मिला! अगली बार और बेहतर!`,
      bg: "from-[#1F6A2F] to-[#2E7D32]",
    },
    zero: {
      emoji: "😊",
      hindi: "कोई बात नहीं!",
      english: "Better luck next time!",
      sub: "हार मत मानो, फिर कोशिश करो!",
      bg: "from-[oklch(0.30_0.06_215)] to-[oklch(0.22_0.07_220)]",
    },
  };

  const c = configs[resultType];

  return (
    <motion.div
      initial={{ scale: 0.5, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      className={`rounded-2xl bg-gradient-to-br ${c.bg} p-6 text-center shadow-2xl`}
    >
      <div className="text-6xl mb-2">{c.emoji}</div>
      <div className="text-2xl font-black font-devanagari text-white leading-tight">
        {c.hindi}
      </div>
      <div className="text-xl font-bold text-white mt-1 opacity-90">
        {c.english}
      </div>
      <div className="text-sm mt-2 text-white opacity-80 font-devanagari">
        {c.sub}
      </div>
    </motion.div>
  );
}

// ── Confetti Overlay ────────────────────────────────────────────────────────
function ConfettiOverlay({ show }: { show: boolean }) {
  const [pieces] = useState(() => generateConfetti(60));

  if (!show) return null;

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-50">
      {pieces.map((p) => (
        <div
          key={p.id}
          className="animate-confetti absolute top-0"
          style={{
            left: `${p.x}%`,
            width: p.size,
            height: p.size,
            backgroundColor: p.color,
            borderRadius: p.shape === "circle" ? "50%" : "2px",
            animationDelay: `${p.delay}s`,
            animationDuration: `${p.duration}s`,
            transform: p.shape === "star" ? "rotate(45deg)" : undefined,
          }}
        />
      ))}
      {FIREWORK_POSITIONS.map((x) => (
        <div
          key={`fw-${x}`}
          className="animate-firework absolute"
          style={{
            left: `${x}%`,
            top: "20%",
            width: 80,
            height: 80,
            marginLeft: -40,
            background: `radial-gradient(circle, ${CONFETTI_COLORS[FIREWORK_POSITIONS.indexOf(x) * 2]} 0%, transparent 70%)`,
            animationDelay: `${FIREWORK_POSITIONS.indexOf(x) * 0.3}s`,
          }}
        />
      ))}
    </div>
  );
}

// ── Main Game Component ────────────────────────────────────────────────────
function DesiLotteryGame() {
  const [phase, setPhase] = useState<GamePhase>("pick");
  const [selectedNumbers, setSelectedNumbers] = useState<number[]>([]);
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const [shakeResult, setShakeResult] = useState(false);

  const toggleNumber = useCallback(
    (num: number) => {
      if (phase !== "pick") return;
      setSelectedNumbers((prev) => {
        if (prev.includes(num)) return prev.filter((n) => n !== num);
        if (prev.length >= 3) return prev;
        return [...prev, num];
      });
    },
    [phase],
  );

  const drawNumbers = useCallback(() => {
    if (selectedNumbers.length !== 3) return;

    const pool = Array.from({ length: 10 }, (_, i) => i + 1);
    const shuffled = pool.sort(() => Math.random() - 0.5);
    const computerNumbers = shuffled.slice(0, 3);

    const matches = selectedNumbers.filter((n) =>
      computerNumbers.includes(n),
    ).length;
    let resultType: ResultType;
    if (matches === 3) resultType = "jackpot";
    else if (matches === 2) resultType = "two";
    else if (matches === 1) resultType = "one";
    else resultType = "zero";

    setGameState({
      playerNumbers: selectedNumbers,
      computerNumbers,
      matches,
      resultType,
    });
    setPhase("result");

    if (matches === 3) {
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 5000);
    } else if (matches === 0) {
      setShakeResult(true);
      setTimeout(() => setShakeResult(false), 600);
    }
  }, [selectedNumbers]);

  const playAgain = useCallback(() => {
    setPhase("pick");
    setSelectedNumbers([]);
    setGameState(null);
    setShowConfetti(false);
    setShakeResult(false);
  }, []);

  const allNumbers = Array.from({ length: 10 }, (_, i) => i + 1);
  const slotIndices = [0, 1, 2];

  return (
    <div className="min-h-screen flex flex-col font-devanagari">
      <ConfettiOverlay show={showConfetti} />

      {/* ── Header ── */}
      <header
        className="w-full relative overflow-hidden"
        style={{
          background:
            "linear-gradient(135deg, #D8B25B 0%, #C8922F 50%, #D87A1C 100%)",
        }}
      >
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className="w-12 h-12 rounded-full flex items-center justify-center text-2xl shadow-lg border-2 border-[oklch(0.95_0.02_90)]"
              style={{
                background: "linear-gradient(135deg, #1F6A2F, #2E7D32)",
              }}
            >
              🪔
            </div>
            <div>
              <div className="text-white font-black text-lg sm:text-xl leading-tight tracking-wide drop-shadow">
                Sumit Indian Desi Contest
              </div>
              <div className="text-[oklch(0.95_0.02_90)] text-xs sm:text-sm font-devanagari font-semibold opacity-90">
                सुमित इंडियन देसी कॉन्टेस्ट
              </div>
            </div>
          </div>

          <nav
            className="hidden md:flex items-center gap-1"
            data-ocid="nav.panel"
          >
            {[
              { en: "HOME", hi: "होम", active: true },
              { en: "PLAY NOW", hi: "अभी खेलें", active: false },
              { en: "RESULTS", hi: "परिणाम", active: false },
              { en: "GUIDE", hi: "गाइड", active: false },
            ].map((item) => (
              <button
                type="button"
                key={item.en}
                data-ocid={`nav.${item.en.toLowerCase().replace(" ", "_")}.link`}
                className={`px-3 py-2 rounded-md cursor-pointer text-center transition-all border-0 bg-transparent ${
                  item.active
                    ? "bg-[#D87A1C]! shadow-inner"
                    : "hover:bg-[oklch(0.65_0.15_55_/_0.3)]"
                }`}
              >
                <div className="text-white font-bold text-xs tracking-wider">
                  {item.en}
                </div>
                <div className="text-[oklch(0.95_0.02_90)] text-[10px] font-devanagari opacity-90">
                  {item.hi}
                </div>
              </button>
            ))}
          </nav>
        </div>
      </header>

      {/* ── Hero Banner ── */}
      <div
        className="relative w-full"
        style={{
          background: "linear-gradient(180deg, #0E2A3A 0%, #1B4A3B 100%)",
          paddingTop: 8,
        }}
      >
        <StringLights />

        <div className="max-w-6xl mx-auto px-4 py-10 sm:py-16 flex flex-col sm:flex-row items-center gap-6 relative">
          <div className="absolute left-4 top-4 hidden lg:block">
            <RangoliDecoration size={100} />
          </div>

          <div className="flex-1 text-center sm:text-left z-10">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7 }}
            >
              <div className="text-[oklch(0.75_0.14_85)] text-sm font-semibold tracking-widest uppercase mb-2">
                🪔 Lucky Draw Contest 🪔
              </div>
              <h1 className="text-white font-black text-3xl sm:text-4xl lg:text-5xl leading-tight font-devanagari drop-shadow-lg mb-3">
                दिवाली धमाका!
                <br />
                <span style={{ color: "#FFD700" }}>जैकपॉट जीतें</span>
              </h1>
              <p className="text-[oklch(0.85_0.04_85)] text-base sm:text-lg font-devanagari mb-6">
                3 लकी नंबर चुनें और जीतने का मौका पाएं!
              </p>
              <button
                type="button"
                data-ocid="hero.play_button"
                onClick={() =>
                  document
                    .getElementById("game-section")
                    ?.scrollIntoView({ behavior: "smooth" })
                }
                className="px-8 py-3 rounded-xl font-black text-white text-lg transition-all hover:scale-105 active:scale-95"
                style={{
                  background: "linear-gradient(135deg, #F07A1A, #D87A1C)",
                }}
              >
                अभी खेलें 🎯
              </button>
            </motion.div>
          </div>

          <div className="flex-shrink-0 text-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="text-7xl sm:text-8xl leading-none"
            >
              🎆🪔🎇
            </motion.div>
            <div className="text-4xl mt-2">🎊🎉🎊</div>
          </div>

          <div className="absolute right-4 bottom-4 hidden lg:block">
            <RangoliDecoration size={90} />
          </div>
        </div>
      </div>

      {/* ── Main Game Section ── */}
      <main
        id="game-section"
        className="flex-1 max-w-6xl mx-auto w-full px-4 py-8 grid lg:grid-cols-2 gap-8"
      >
        {/* Left: Game */}
        <div>
          <AnimatePresence mode="wait">
            {phase === "pick" ? (
              <motion.div
                key="pick"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.4 }}
              >
                <div className="flex items-center gap-2 mb-4">
                  <RangoliDecoration size={36} />
                  <h2 className="text-xl font-black font-devanagari text-foreground">
                    आज का ड्रॉ: अपना लकी नंबर चुनें
                  </h2>
                </div>

                <div
                  className="bg-card rounded-2xl border-2 border-[oklch(0.85_0.04_85)] p-6"
                  style={{ boxShadow: "0 4px 24px oklch(0.75 0.14 85 / 0.25)" }}
                >
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-muted-foreground text-sm font-devanagari">
                      {selectedNumbers.length}/3 नंबर चुने गए
                    </span>
                    <div className="flex gap-2">
                      {slotIndices.map((i) => (
                        <div
                          key={`slot-${i}`}
                          className={`w-8 h-8 rounded-full border-2 flex items-center justify-center font-black text-sm transition-all ${
                            selectedNumbers[i]
                              ? "border-[oklch(0.67_0.2_48)] bg-[oklch(0.67_0.2_48)] text-white"
                              : "border-[oklch(0.85_0.04_85)] bg-muted text-muted-foreground"
                          }`}
                        >
                          {selectedNumbers[i] ?? "?"}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-5 gap-3 mb-6">
                    {allNumbers.map((num, idx) => (
                      <NumberTile
                        key={num}
                        num={num}
                        index={idx + 1}
                        isSelected={selectedNumbers.includes(num)}
                        isDisabled={
                          selectedNumbers.length >= 3 &&
                          !selectedNumbers.includes(num)
                        }
                        onClick={() => toggleNumber(num)}
                      />
                    ))}
                  </div>

                  <motion.button
                    type="button"
                    data-ocid="game.submit_button"
                    onClick={drawNumbers}
                    disabled={selectedNumbers.length !== 3}
                    whileHover={
                      selectedNumbers.length === 3 ? { scale: 1.02 } : {}
                    }
                    whileTap={
                      selectedNumbers.length === 3 ? { scale: 0.97 } : {}
                    }
                    className="w-full py-4 rounded-xl font-black text-white text-lg font-devanagari transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{
                      background:
                        selectedNumbers.length === 3
                          ? "linear-gradient(135deg, #D8B25B, #C8922F)"
                          : "oklch(0.80 0.04 85)",
                    }}
                  >
                    अपना नंबर सबमिट करें 🎯
                  </motion.button>

                  <p className="text-center text-muted-foreground text-xs mt-3 font-devanagari">
                    🪔 1 से 10 के बीच 3 नंबर चुनें
                  </p>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="result"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -30 }}
                transition={{ duration: 0.5 }}
                className={shakeResult ? "animate-shake" : ""}
              >
                <div className="flex items-center gap-2 mb-4">
                  <RangoliDecoration size={36} />
                  <h2 className="text-xl font-black font-devanagari text-foreground">
                    परिणाम
                  </h2>
                </div>

                <div
                  className="bg-card rounded-2xl border-2 border-[oklch(0.85_0.04_85)] p-6 space-y-5"
                  style={{ boxShadow: "0 4px 24px oklch(0.75 0.14 85 / 0.25)" }}
                >
                  {gameState && (
                    <ResultMessage
                      resultType={gameState.resultType}
                      matches={gameState.matches}
                    />
                  )}

                  {gameState && (
                    <div className="space-y-4">
                      <div>
                        <div className="text-sm font-semibold font-devanagari text-muted-foreground mb-2">
                          आपके नंबर:
                        </div>
                        <div className="flex gap-3 justify-center">
                          {gameState.playerNumbers.map((num) => (
                            <div
                              key={`player-${num}`}
                              className={`w-14 h-14 rounded-xl border-2 flex items-center justify-center font-black text-2xl transition-all ${
                                gameState.computerNumbers.includes(num)
                                  ? "tile-matched"
                                  : "bg-white border-[oklch(0.85_0.04_85)] text-foreground"
                              }`}
                            >
                              {num}
                            </div>
                          ))}
                        </div>
                      </div>

                      <div>
                        <div className="text-sm font-semibold font-devanagari text-muted-foreground mb-2">
                          कंप्यूटर के नंबर:
                        </div>
                        <div className="flex gap-3 justify-center">
                          {gameState.computerNumbers.map((num, idx) => (
                            <motion.div
                              key={`computer-${num}`}
                              initial={{ rotateY: 90, opacity: 0 }}
                              animate={{ rotateY: 0, opacity: 1 }}
                              transition={{ duration: 0.4, delay: idx * 0.15 }}
                              className={`w-14 h-14 rounded-xl border-2 flex items-center justify-center font-black text-2xl ${
                                gameState.playerNumbers.includes(num)
                                  ? "tile-matched"
                                  : "tile-computer"
                              }`}
                            >
                              {num}
                            </motion.div>
                          ))}
                        </div>
                      </div>

                      <div className="text-center py-2 px-4 rounded-xl bg-muted">
                        <span className="font-black font-devanagari text-lg">
                          {gameState.matches} नंबर मिले
                        </span>
                        <span className="text-muted-foreground text-sm ml-2">
                          ({gameState.matches} matches)
                        </span>
                      </div>
                    </div>
                  )}

                  <motion.button
                    type="button"
                    data-ocid="game.play_again_button"
                    onClick={playAgain}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.97 }}
                    className="w-full py-4 rounded-xl font-black text-white text-lg font-devanagari"
                    style={{
                      background: "linear-gradient(135deg, #F07A1A, #D87A1C)",
                    }}
                  >
                    🔄 फिर से खेलें (Play Again)
                  </motion.button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Right: Recent Results */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <RangoliDecoration size={36} />
            <h2 className="text-xl font-black font-devanagari text-foreground">
              हालिया परिणाम
            </h2>
          </div>
          <RecentResultsList currentGame={gameState} />
        </div>
      </main>

      {/* ── Feature Cards ── */}
      <section className="max-w-6xl mx-auto w-full px-4 pb-10">
        <div className="grid sm:grid-cols-3 gap-4">
          {[
            {
              emoji: "🎮",
              title: "कैसे खेलें?",
              desc: "1-10 में से 3 नंबर चुनें, ड्रॉ करें और जीत की जांच करें!",
              color: "from-[#D8B25B] to-[#C8922F]",
            },
            {
              emoji: "🔒",
              title: "भरोसेमंद और सुरक्षित",
              desc: "Internet Computer पर पारदर्शी और सुरक्षित गेम।",
              color: "from-[#1F6A2F] to-[#2E7D32]",
            },
            {
              emoji: "🕐",
              title: "24/7 सहायता",
              desc: "कभी भी, कहीं भी खेलें। हमेशा आपके साथ!",
              color: "from-[#0E2A3A] to-[#1B4A3B]",
            },
          ].map((card) => (
            <motion.div
              key={card.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className={`rounded-2xl bg-gradient-to-br ${card.color} p-6 text-white shadow-lg`}
            >
              <div className="text-4xl mb-3">{card.emoji}</div>
              <div className="font-black text-lg font-devanagari mb-1">
                {card.title}
              </div>
              <div className="text-sm opacity-85 font-devanagari">
                {card.desc}
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="w-full" style={{ background: "#1F6A2F" }}>
        <div className="max-w-6xl mx-auto px-4 py-5 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-white">
            <span className="text-xl">🪔</span>
            <span className="font-black font-devanagari">
              सुमित इंडियन देसी कॉन्टेस्ट
            </span>
          </div>
          <div className="text-[oklch(0.85_0.04_145)] text-sm text-center">
            © {new Date().getFullYear()}. Built with ❤️ using{" "}
            <a
              href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:text-white transition-colors"
            >
              caffeine.ai
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}

// ── Recent Results ──────────────────────────────────────────────────────────
import { useAllResults } from "./hooks/useQueries";

function RecentResultsList({ currentGame }: { currentGame: GameState | null }) {
  const [sessionHistory, setSessionHistory] = useState<GameState[]>([]);
  const { data: backendResults } = useAllResults();

  useEffect(() => {
    if (currentGame) {
      setSessionHistory((prev) => [currentGame, ...prev].slice(0, 10));
    }
  }, [currentGame]);

  const hasHistory =
    sessionHistory.length > 0 || (backendResults && backendResults.length > 0);

  if (!hasHistory) {
    return (
      <div
        data-ocid="results.empty_state"
        className="bg-card rounded-2xl border-2 border-[oklch(0.85_0.04_85)] p-8 text-center"
      >
        <div className="text-5xl mb-3">🎯</div>
        <div className="font-bold font-devanagari text-muted-foreground">
          अभी तक कोई खेल नहीं खेला।
        </div>
        <div className="text-sm text-muted-foreground mt-1">
          अपने नंबर चुनें और खेलना शुरू करें!
        </div>
      </div>
    );
  }

  const resultLabel: Record<ResultType, string> = {
    jackpot: "जैकपॉट!",
    two: "लगभग!",
    one: "अच्छा प्रयास",
    zero: "अगली बार",
  };
  const resultEmoji: Record<ResultType, string> = {
    jackpot: "🎉",
    two: "🎊",
    one: "👍",
    zero: "😊",
  };

  return (
    <div className="space-y-3" data-ocid="results.list">
      {sessionHistory.map((game, i) => (
        <motion.div
          key={`session-${i}-${game.playerNumbers.join("-")}`}
          data-ocid={`results.item.${i + 1}`}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: i * 0.05 }}
          className="bg-card rounded-xl border-2 border-[oklch(0.85_0.04_85)] p-4 flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <div className="text-2xl">{resultEmoji[game.resultType]}</div>
            <div>
              <div className="font-bold text-sm font-devanagari">
                {resultLabel[game.resultType]}
              </div>
              <div className="text-xs text-muted-foreground">
                आपके: {game.playerNumbers.join(", ")} | कंप्यूटर:{" "}
                {game.computerNumbers.join(", ")}
              </div>
            </div>
          </div>
          <div
            className={`px-3 py-1 rounded-full font-black text-sm text-white ${
              game.matches === 3
                ? "bg-[#D4AF37]"
                : game.matches > 0
                  ? "bg-[#FF6600]"
                  : "bg-[oklch(0.40_0.06_215)]"
            }`}
          >
            {game.matches} मिले
          </div>
        </motion.div>
      ))}

      {backendResults && backendResults.length > 0 && (
        <>
          <div className="text-center text-xs text-muted-foreground font-devanagari py-1">
            — पिछले खेल —
          </div>
          {backendResults.slice(0, 5).map((result, i) => (
            <motion.div
              key={`backend-${result.playerNumbers.join("-")}-${i}`}
              data-ocid={`results.item.${sessionHistory.length + i + 1}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: i * 0.05 }}
              className="bg-muted rounded-xl border border-[oklch(0.85_0.04_85)] p-4 flex items-center justify-between opacity-80"
            >
              <div>
                <div className="text-xs font-devanagari font-semibold">
                  {result.isWin ? "🏆 जीत" : "😊 कोई बात नहीं"}
                </div>
                <div className="text-xs text-muted-foreground">
                  आपके: {result.playerNumbers.map(Number).join(", ")} | कंप्यूटर:{" "}
                  {result.computerNumbers.map(Number).join(", ")}
                </div>
              </div>
              <div
                className={`px-2 py-1 rounded-full text-xs font-bold text-white ${result.isWin ? "bg-[#1F6A2F]" : "bg-[oklch(0.40_0.06_215)]"}`}
              >
                {Number(result.matches)} मिले
              </div>
            </motion.div>
          ))}
        </>
      )}
    </div>
  );
}

export default AppWrapper;
