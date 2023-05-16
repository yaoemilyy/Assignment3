let pokemons = [];
let selectedTypes = [];

const numPerPage = 10;
let numPages = 0;
const numPageBtn = 5;

const setup = async () => {
  $('#pokeCards').empty();

  // Fetch all the Pokémon types
  let response = await axios.get('https://pokeapi.co/api/v2/type/');
  let types = response.data.results;
  console.log(types);

  // Display the Pokémon types as checkboxes
  types.forEach((type) => {
    $('#typeCheckboxes').append(`
      <label>
        <input type="checkbox" name="type" value="${type.name}" /> ${type.name}
      </label>
    `);
  });

  // Add event listener to the checkboxes
  $('#typeCheckboxes input[type="checkbox"]').change(function () {
    selectedTypes = getSelectedTypes();
    filterPokemonByTypes();
  });

  // Fetch all the Pokémon
  response = await axios.get('https://pokeapi.co/api/v2/pokemon?offset=0&limit=810');
  pokemons = response.data.results;
  numPages = Math.ceil(pokemons.length / numPerPage);
  console.log("numPages: ", numPages);

  showPage(1);
};

function getSelectedTypes() {
  const checkboxes = $('#typeCheckboxes input[type="checkbox"]');
  const selectedTypes = [];

  checkboxes.each(function () {
    if (this.checked) {
      selectedTypes.push(this.value);
    }
  });

  return selectedTypes;
}

async function filterPokemonByTypes() {
  $('#pokeCards').empty();

  const filteredPokemon = pokemons.filter(async (pokemon) => {
    const response = await axios.get(pokemon.url);
    const types = response.data.types.map((type) => type.type.name);
    return selectedTypes.every((type) => types.includes(type));
  });

  numPages = Math.ceil(filteredPokemon.length / numPerPage);
  console.log("numPages: ", numPages);

  showPage(1, filteredPokemon);
}

async function showPage(currentPage, filteredPokemon) {
  if (currentPage < 1) {
    currentPage = 1;
  }
  if (currentPage > numPages) {
    currentPage = numPages;
  }

  $('#pokeCards').empty();

  const pokemonList = filteredPokemon || pokemons;

  for (let i = (currentPage - 1) * numPerPage; i < (currentPage - 1) * numPerPage + numPerPage && i < pokemonList.length; i++) {
    let response = await axios.get(pokemonList[i].url);
    let thisPokemon = response.data;
    $('#pokeCards').append(`
      <div class="pokeCard card" pokeName="${thisPokemon.name}">
        <h3>${thisPokemon.name.toUpperCase()}</h3> 
        <img src="${thisPokemon.sprites.front_default}" alt="${thisPokemon.name}"/>
        <button type="button" class="btn btn-primary" data-toggle="modal" data-target="#pokeModal">
          More
        </button>
      </div>
    `);
  }

  // add pagination buttons
  $('#pagination').empty();
  const startI = Math.max(1, currentPage - Math.floor(numPageBtn / 2));
  const endI = Math.min(numPages, currentPage + Math.floor(numPageBtn / 2));

  if (currentPage > 1) {
    $('#pagination').append(`
      <button type="button" class="btn btn-primary pageBtn" id="pagefirst" pageNum="1">First</button>
      `);
      $('#pagination').append(`
        <button type="button" class="btn btn-primary pageBtn" id="pageprev" pageNum="${currentPage - 1}">Prev</button>
      `);
    }
  
    for (let i = startI; i <= endI; i++) {
      let active = "";
      if (i == currentPage) {
        active = "active";
      }
      $('#pagination').append(`
        <button type="button" class="btn btn-primary pageBtn ${active}" id="page${i}" pageNum="${i}">${i}</button>
      `);
    }
  
    if (currentPage < numPages) {
      $('#pagination').append(`
        <button type="button" class="btn btn-primary pageBtn" id="pagenext" pageNum="${currentPage + 1}">Next</button>
      `);
      $('#pagination').append(`
        <button type="button" class="btn btn-primary pageBtn" id="pagelast" pageNum="${numPages}">Last</button>
      `);
    }
  
    // add event listener to pagination buttons
    $('body').off('click', '.pageBtn');
    $('body').on('click', '.pageBtn', async function () {
      const pageNum = parseInt($(this).attr('pageNum'));
      showPage(pageNum, filteredPokemon);
    });
  
    // pop up modal when clicking on a pokemon card
    // add event listener to each pokemon card
    $('body').off('click', '.pokeCard');
    $('body').on('click', '.pokeCard', async function () {
      const pokemonName = $(this).attr('pokeName');
      const res = await axios.get(`https://pokeapi.co/api/v2/pokemon/${pokemonName}`);
      const types = res.data.types.map((type) => type.type.name);
      $('.modal-body').html(`
        <div style="width:200px">
          <img src="${res.data.sprites.other['official-artwork'].front_default}" alt="${res.data.name}"/>
          <div>
            <h3>Abilities</h3>
            <ul>
              ${res.data.abilities.map((ability) => `<li>${ability.ability.name}</li>`).join('')}
            </ul>
          </div>
          <div>
            <h3>Stats</h3>
            <ul>
              ${res.data.stats.map((stat) => `<li>${stat.stat.name}: ${stat.base_stat}</li>`).join('')}
            </ul>
          </div>
        </div>
        <h3>Types</h3>
        <ul>
          ${types.map((type) => `<li>${type}</li>`).join('')}
        </ul>
      `);
      $('.modal-title').html(`
        <h2>${res.data.name.toUpperCase()}</h2>
      `);
    });
  }
  
  $(document).ready(setup);
  

