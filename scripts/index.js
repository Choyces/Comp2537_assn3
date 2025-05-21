let matches = 0;
let pairsLeft = 0;
let clicks = 0;
let isProcessing = false;

function updateStats() {
  document.getElementById("stat-matches").textContent = matches;
  document.getElementById("stat-pairsLeft").textContent = pairsLeft - matches;
  document.getElementById("stat-clicks").textContent = clicks;
};

function resetGame() {
  matches = 0;
  clicks = 0;
  pairsLeft = 0;
  firstCard = undefined;
  secondCard = undefined;
  isProcessing = false;

  document.getElementById('game_grid').innerHTML = '';
  document.getElementById('stats').classList.add('d-none');
  document.getElementById('resetButton').classList.add('d-none');
}

function setDifficulty(difficulty) { 
 
  if (difficulty === "easy") {
    pairsLeft = 3;
  } else if (difficulty === "medium") {
    pairsLeft = 9;
  } else if (difficulty === "hard") {
    pairsLeft = 18;
  }
alert(`Selected: ${difficulty}, Pairs: ${pairsLeft}`);
};

function adjustCardSizing() {
  const totalCards = document.querySelectorAll('.card').length;
  const cardsPerRow = Math.ceil(Math.sqrt(totalCards)); 
  const cardWidth = `calc(100% / ${cardsPerRow} - 10px)`;

  document.querySelectorAll('.card').forEach(card => {
    card.style.flex = `0 1 ${cardWidth}`;
  });
}


async function loadPokemon() {
    let pokemonArray = [];
    const usedNums = new Set();
while (pokemonArray.length < pairsLeft * 2) {
  const pokeNum = Math.floor(Math.random() * 1000) + 1;

  if (!usedNums.has(pokeNum)) {
    try {
      const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${pokeNum}`);

      if (!response.ok) throw new Error("Invalid Pokémon ID");

      const jsonObj = await response.json();
      usedNums.add(pokeNum);
      pokemonArray.push(jsonObj, jsonObj); 

    } catch (err) {
      console.warn(`Skipping invalid Pokémon #${pokeNum}`);
    }
  }
}
   for (let i = pokemonArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [pokemonArray[i], pokemonArray[j]] = [pokemonArray[j], pokemonArray[i]];
  }
  return pokemonArray;
};

function createCardElement(cardTemplate, pokemon, index) {
  const newCard = cardTemplate.content.cloneNode(true);
  const card = newCard.querySelector(".card");
  const frontFace = newCard.querySelector(".front_face");

  const imgUrl = pokemon.sprites.other['official-artwork'].front_default;

  card.setAttribute("data-id", index);
  frontFace.setAttribute("src", imgUrl);
  frontFace.setAttribute("id", `card-${index}`);

  return newCard;
}

  
async function processSingle(pokemon, cardTemplate, index) {
  return createCardElement(cardTemplate, pokemon, index);
}

async function displayPokemon() {
    const cardTemplate = document.getElementById("card");
    const container = document.getElementById("game_grid");

  try {
    const pokemonArray = await loadPokemon();
    container.innerHTML = "";

    for (let i = 0; i < pokemonArray.length; i++) {
      const newCard = await processSingle(pokemonArray[i], cardTemplate, i);
      container.appendChild(newCard);
    }

    setup();
    adjustCardSizing();
  } catch (error) {
    console.error("Error displaying Pokémon: ", error);
  }
  document.getElementById('stats').classList.remove('d-none');
  document.getElementById('resetButton').classList.remove('d-none');
}

function setup() {
  matches = 0;
  firstCard = undefined;
  secondCard = undefined;

  $(".card").on("click", function () {
    if (isProcessing || $(this).hasClass("flip")) return;
  clicks++;
  updateStats();
    $(this).addClass("flip");

    const front = $(this).find(".front_face")[0];

    if (!firstCard) {
      firstCard = front;
    } else {
      secondCard = front;
      isProcessing = true;

      if (firstCard.id === secondCard.id) {
        isProcessing = false;
        return;
      }

      if (firstCard.src === secondCard.src) {
        console.log("MATCH!");
        $(`#${firstCard.id}`).parent().off("click");
        $(`#${secondCard.id}`).parent().off("click");
        matches++;
        updateStats();

        if (matches === pairsLeft) {
          setTimeout(() => alert("You win!"), 500);
        }

        resetCards();
      } else {
        console.log("NO match");
        setTimeout(() => {
          $(`#${firstCard.id}`).parent().removeClass("flip");
          $(`#${secondCard.id}`).parent().removeClass("flip");
          resetCards();
        }, 1000);
      }
    }
  });
}

function start() {
  if (pairsLeft == 0) {
    alert("Select a difficulty first!");
    return;
  }
  displayPokemon();
}

function resetCards() {
  firstCard = undefined;
  secondCard = undefined;
  isProcessing = false;
}

$(document).ready(setup)