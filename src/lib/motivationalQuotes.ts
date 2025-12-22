export const motivationalQuotes = [
  "Great job! Every morning is a fresh start.",
  "You did it! Today is going to be amazing.",
  "Well done! You're building great habits.",
  "Excellent! Your discipline is impressive.",
  "You're unstoppable! Keep up the momentum.",
  "Success! Another day, another victory.",
  "Fantastic! You're making progress every day.",
  "Amazing! Your dedication is paying off.",
  "Outstanding! You're crushing your goals.",
  "Brilliant! You're one step closer to greatness.",
];

export const getRandomQuote = () => {
  return motivationalQuotes[Math.floor(Math.random() * motivationalQuotes.length)];
};
