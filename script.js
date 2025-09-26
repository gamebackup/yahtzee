// Yahtzee game logic
const diceContainer = document.getElementById('dice-container');
const rollBtn = document.getElementById('roll-btn');
const scorecardBody = document.querySelector('#scorecard tbody');
const finalScoreEl = document.getElementById('final-score');

const categories = [
  { name: "Ones", calc: (dice) => dice.filter(d => d === 1).length * 1 },
  { name: "Twos", calc: (dice) => dice.filter(d => d === 2).length * 2 },
  { name: "Threes", calc: (dice) => dice.filter(d => d === 3).length * 3 },
  { name: "Fours", calc: (dice) => dice.filter(d => d === 4).length * 4 },
  { name: "Fives", calc: (dice) => dice.filter(d => d === 5).length * 5 },
  { name: "Sixes", calc: (dice) => dice.filter(d => d === 6).length * 6 },
  { name: "Three of a Kind", calc: (dice) => hasNOfAKind(dice, 3) ? sumDice(dice) : 0 },
  { name: "Four of a Kind", calc: (dice) => hasNOfAKind(dice, 4) ? sumDice(dice) : 0 },
  { name: "Full House", calc: (dice) => isFullHouse(dice) ? 25 : 0 },
  { name: "Small Straight", calc: (dice) => isSmallStraight(dice) ? 30 : 0 },
  { name: "Large Straight", calc: (dice) => isLargeStraight(dice) ? 40 : 0 },
  { name: "Yahtzee", calc: (dice) => hasNOfAKind(dice, 5) ? 50 : 0 },
  { name: "Chance", calc: (dice) => sumDice(dice) }
];

let dice = [1,1,1,1,1];
let held = [false,false,false,false,false];
let rollsLeft = 3;
let scores = Array(categories.length).fill(null);

function sumDice(dice) {
  return dice.reduce((a,b)=>a+b, 0);
}

function hasNOfAKind(dice, n) {
  const counts = {};
  dice.forEach(d => counts[d] = (counts[d] || 0) + 1);
  return Object.values(counts).some(c => c >= n);
}

function isFullHouse(dice) {
  const counts = Object.values(dice.reduce((a,d)=>{a[d]=(a[d]||0)+1;return a;},{}));
  return counts.includes(3) && counts.includes(2);
}

function isSmallStraight(dice) {
  const unique = [...new Set(dice)].sort();
  const straights = [
    [1,2,3,4],[2,3,4,5],[3,4,5,6]
  ];
  return straights.some(straight => straight.every(num => unique.includes(num)));
}

function isLargeStraight(dice) {
  const unique = [...new Set(dice)].sort();
  return (
    unique.length === 5 &&
    ((unique[0] === 1 && unique[4] === 5) ||
     (unique[0] === 2 && unique[4] === 6))
  );
}

function renderDice() {
  diceContainer.innerHTML = "";
  dice.forEach((value, idx) => {
    const die = document.createElement('div');
    die.className = 'die' + (held[idx] ? ' held' : '');
    die.textContent = value;
    die.onclick = () => {
      if (rollsLeft < 3 && rollsLeft > 0) {
        held[idx] = !held[idx];
        renderDice();
      }
    };
    diceContainer.appendChild(die);
  });
}

function rollDice() {
  if (rollsLeft === 0) return;
  dice = dice.map((value, idx) => held[idx] ? value : Math.ceil(Math.random()*6));
  rollsLeft--;
  rollBtn.textContent = rollsLeft > 0 ? `Roll Dice (${rollsLeft} left)` : "No Rolls Left";
  renderDice();
  renderScorecard();
}

function renderScorecard() {
  scorecardBody.innerHTML = "";
  categories.forEach((cat, idx) => {
    const row = document.createElement('tr');
    if (scores[idx] != null) row.className = 'scored';
    row.innerHTML = `
      <td>${cat.name}</td>
      <td>${scores[idx] != null ? scores[idx] : cat.calc(dice)}</td>
      <td>
        ${scores[idx] == null && rollsLeft < 3 ? `<button data-idx="${idx}">Assign</button>` : ''}
      </td>
    `;
    scorecardBody.appendChild(row);
  });
  scorecardBody.querySelectorAll('button[data-idx]').forEach(btn => {
    btn.onclick = () => assignScore(parseInt(btn.getAttribute('data-idx')));
  });
}

function assignScore(idx) {
  scores[idx] = categories[idx].calc(dice);
  rollsLeft = 3;
  held = [false,false,false,false,false];
  dice = [1,1,1,1,1];
  rollBtn.textContent = `Roll Dice (${rollsLeft} left)`;
  renderDice();
  renderScorecard();
  checkEnd();
}

function checkEnd() {
  if (scores.every(s => s != null)) {
    rollBtn.disabled = true;
    finalScoreEl.textContent = `Game Over! Final Score: ${scores.reduce((a,b)=>a+b,0)}`;
  }
}

rollBtn.onclick = rollDice;
renderDice();
renderScorecard();
