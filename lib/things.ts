export type Thing = {
  name: string;
  emoji: string;
  priceEUR: number; // base in EUR; converted per selected currency
};

export type ThingInCurrency = {
  name: string;
  emoji: string;
  price: number; // converted price in selected currency
};

export const THINGS: Thing[] = [
  { name: "Chocolate bar", emoji: "🍫", priceEUR: 1.5 },
  { name: "Croissant", emoji: "🥐", priceEUR: 1.8 },
  { name: "Coke", emoji: "🥤", priceEUR: 2.5 },
  { name: "Espresso", emoji: "☕", priceEUR: 3.0 },
  { name: "Ice cream cone", emoji: "🍦", priceEUR: 3.5 },
  { name: "Donut box", emoji: "🍩", priceEUR: 6.0 },
  { name: "Sandwich", emoji: "🥪", priceEUR: 7.5 },
  { name: "Pint of beer", emoji: "🍺", priceEUR: 8.0 },
  { name: "Kebab", emoji: "🌯", priceEUR: 10.0 },
  { name: "Lunch", emoji: "🍱", priceEUR: 15.0 },
  { name: "Paperback book", emoji: "📘", priceEUR: 16.0 },
  { name: "Movie ticket", emoji: "🎟️", priceEUR: 17 },
  { name: "Netflix subscription", emoji: "🍿", priceEUR: 20 },
  { name: "Bouquet of flowers", emoji: "💐", priceEUR: 22 },
  { name: "Power bank", emoji: "🔋", priceEUR: 25 },
  { name: "Round of drinks", emoji: "🍻", priceEUR: 55 },
  { name: "Fondue for two", emoji: "🫕", priceEUR: 60 },
  { name: "Ski day pass (local resort)", emoji: "🎿", priceEUR: 75 },
  { name: "Nice dinner", emoji: "🍝", priceEUR: 80 },
  { name: "Sneakers", emoji: "👟", priceEUR: 100 },
  { name: "Mechanical keyboard", emoji: "⌨️", priceEUR: 110 },
  { name: "Headphones", emoji: "🎧", priceEUR: 120 },
  { name: "External SSD (1TB)", emoji: "💾", priceEUR: 140 },
  { name: "Smart speaker", emoji: "🔈", priceEUR: 150 },
  { name: "Smartwatch", emoji: "⌚", priceEUR: 180 },
  { name: "Tablet", emoji: "📱", priceEUR: 220 },
  { name: "Weekend trip", emoji: "🧳", priceEUR: 250 },
  { name: "Espresso machine", emoji: "☕", priceEUR: 300 },
  { name: "Smartphone", emoji: "📱", priceEUR: 350 },
  { name: "Monitor", emoji: "🖥️", priceEUR: 400 },
  { name: "Bicycle", emoji: "🚴", priceEUR: 500 },
  { name: "Flight", emoji: "✈️", priceEUR: 600 },
  { name: "Sofa", emoji: "🛋️", priceEUR: 700 },
  { name: "Standing desk", emoji: "🪵", priceEUR: 800 },
  { name: "Ski set", emoji: "⛷️", priceEUR: 900 },
  { name: "Camera", emoji: "📷", priceEUR: 1000 },
  { name: "Mountain bike", emoji: "🚵", priceEUR: 1200 },
  { name: "Laptop", emoji: "💻", priceEUR: 1500 },
  { name: "Home gym setup", emoji: "🏋️", priceEUR: 2000 },
  { name: "E-bike", emoji: "🚲", priceEUR: 2500 },
  { name: "Family vacation", emoji: "🏖️", priceEUR: 3000 },
  { name: "Mechanical watch", emoji: "⌚", priceEUR: 5000 },
];
