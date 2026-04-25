'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useOrderStore } from '@/store/use-order-store';

/**
 * Ingredient Game Component
 * AR catch game for gamified loyalty with discount rewards
 */
export function IngredientGame() {
  const [gameActive, setGameActive] = useState(false);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);
  const [caught, setCaught] = useState<string[]>([]);
  const [gameOver, setGameOver] = useState(false);
  const { applyDiscount } = useOrderStore();

  const ingredients = [
    '🍅', // Tomato
    '🧀', // Cheese
    '🌿', // Basil
    '🫒', // Olive Oil
    '🧄', // Garlic
    '🧅', // Onion
    '🥕', // Carrot
    '🍆', // Eggplant
  ];

  // Game timer
  useEffect(() => {
    if (!gameActive || timeLeft === 0) return;

    const timer = setTimeout(() => {
      setTimeLeft(timeLeft - 1);
    }, 1000);

    if (timeLeft === 0) {
      endGame();
    }

    return () => clearTimeout(timer);
  }, [gameActive, timeLeft]);

  const startGame = () => {
    setGameActive(true);
    setScore(0);
    setCaught([]);
    setTimeLeft(30);
    setGameOver(false);
  };

  const catchIngredient = (ingredient: string) => {
    if (caught.includes(ingredient)) return; // Already caught

    const newCaught = [...caught, ingredient];
    setCaught(newCaught);
    setScore(score + 10);

    // Haptic feedback if available
    if ('vibrate' in navigator) {
      navigator.vibrate(50);
    }
  };

  const endGame = () => {
    setGameActive(false);
    setGameOver(true);

    // Calculate discount based on score
    const discountPercentage = Math.floor(score / 10); // 1% per 10 points
    if (discountPercentage > 0) {
      const discountCode = `GAME${Math.random().toString(36).substr(2, 5).toUpperCase()}`;
      applyDiscount(discountCode, discountPercentage);
    }
  };

  const resetGame = () => {
    setGameOver(false);
    setScore(0);
    setCaught([]);
    setTimeLeft(30);
  };

  return (
    <div className="space-y-6">
      <Card className="p-6 bg-gradient-to-br from-green-50 to-emerald-50">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          🎮 Catch the Ingredients
        </h2>
        <p className="text-gray-600 mb-4">
          Play to earn discounts on your order!
        </p>

        {!gameActive && !gameOver && (
          <div className="space-y-4">
            <p className="text-gray-700">
              Catch falling ingredients to score points and unlock exclusive discounts!
            </p>
            <Button onClick={startGame} className="w-full bg-green-600 hover:bg-green-700">
              🚀 Start Game
            </Button>
          </div>
        )}

        {(gameActive || gameOver) && (
          <>
            {/* Game Header */}
            <div className="flex justify-between items-center mb-6 p-4 bg-white rounded-lg">
              <div>
                <p className="text-sm text-gray-600">Score</p>
                <p className="text-3xl font-bold text-green-600">{score}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Time Left</p>
                <p
                  className={`text-3xl font-bold ${
                    timeLeft <= 10 ? 'text-red-600' : 'text-gray-900'
                  }`}
                >
                  {timeLeft}s
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Caught</p>
                <p className="text-3xl font-bold text-blue-600">{caught.length}</p>
              </div>
            </div>

            {/* Game Area */}
            {gameActive && (
              <div className="bg-white rounded-lg p-6 min-h-96 mb-4 relative overflow-hidden border-2 border-dashed border-green-300">
                <p className="text-center text-gray-500 mb-4">Tap ingredients to catch them!</p>

                {/* Ingredient Grid */}
                <div className="grid grid-cols-4 gap-4">
                  {ingredients.map((ingredient, index) => (
                    <button
                      key={index}
                      onClick={() => catchIngredient(ingredient)}
                      disabled={caught.includes(ingredient)}
                      className={`h-20 text-4xl rounded-lg transition-all transform ${
                        caught.includes(ingredient)
                          ? 'bg-green-100 scale-110 opacity-50 cursor-not-allowed'
                          : 'bg-gray-100 hover:bg-green-100 hover:scale-110 cursor-pointer active:scale-95'
                      }`}
                    >
                      {ingredient}
                    </button>
                  ))}
                </div>

                {/* Caught Items Display */}
                <div className="mt-6 p-3 bg-green-50 rounded">
                  <p className="text-sm font-semibold text-gray-700 mb-2">Caught:</p>
                  <div className="flex flex-wrap gap-2">
                    {caught.map((item, idx) => (
                      <Badge key={idx} className="bg-green-500 text-lg px-3 py-2">
                        {item}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Game Over Screen */}
            {gameOver && (
              <div className="space-y-4">
                <div className="p-6 bg-white rounded-lg text-center">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">Game Over!</h3>
                  <p className="text-4xl font-bold text-green-600 mb-4">{score} Points</p>

                  <div className="mb-4 p-4 bg-green-50 rounded-lg">
                    <p className="text-sm text-gray-600 mb-1">Discount Unlocked</p>
                    <p className="text-2xl font-bold text-green-600">
                      {Math.floor(score / 10)}% OFF
                    </p>
                  </div>

                  <p className="text-gray-600 text-sm mb-4">
                    {caught.length} ingredients caught out of {ingredients.length}
                  </p>

                  <Button onClick={resetGame} className="w-full bg-green-600 hover:bg-green-700">
                    Play Again
                  </Button>
                </div>

                {/* Share Score */}
                <Card className="p-4 bg-blue-50">
                  <p className="text-sm font-semibold text-gray-900 mb-2">
                    💡 Pro Tip: Your discount will be automatically applied to your order!
                  </p>
                </Card>
              </div>
            )}
          </>
        )}
      </Card>
    </div>
  );
}
