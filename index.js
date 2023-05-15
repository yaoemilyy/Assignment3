
let pokemons = []

const numPerPage = 10;
var numPages = 0;
const numPageBtn = 5;

const setup = async () => {
  // test out poke api using axios here


  $('#pokeCards').empty()
  let response = await axios.get('https://pokeapi.co/api/v2/pokemon?offset=0&limit=810');
  console.log(response.data.results);


  pokemon = response.data.results;
  numPages = Math.ceil(pokemon.length / numPerPage);
  console.log("numPages: ", numPages);

  showPage(1);

  // pop up modal when clicking on a pokemon card
  // add event listener to each pokemon card
  $('body').on('click', '.pokeCard', async function (e) {
    const pokemonName = $(this).attr('pokeName')
    // console.log("pokemonName: ", pokemonName);
    const res = await axios.get(`https://pokeapi.co/api/v2/pokemon/${pokemonName}`)
    // console.log("res.data: ", res.data);
    const types = res.data.types.map((type) => type.type.name)
    // console.log("types: ", types);
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
      
        `)
    $('.modal-title').html(`
        <h2>${res.data.name.toUpperCase()}</h2>
        `)
  })

   // add event listener to pagination buttons
   $('body').on('click', ".pageBtn", async function (e) {
    const pageNum = parseInt($(this).attr("pageNum"))
    showPage(pageNum);
  });

};


async function showPage(currentPage) {
  if (currentPage < 1) {
    currentPage = 1;
  }
  if (currentPage > numPages) {
    currentPage = numPages;
  }

  $('#pokeCards').empty()
 for (let i = ((currentPage-1)*numPerPage); i < ((currentPage-1)*numPerPage)+ numPerPage && i < pokemon.length; i++) {
  console.log("i:" , i);

  let innerResponse = await axios.get(`${pokemon[i].url}`);
  let thisPokemon = innerResponse.data;
    $('#pokeCards').append(`
    <div class="pokeCard card" pokeName=${thisPokemon.name}>
    <h3>${thisPokemon.name.toUpperCase()}</h3> 
    <img src="${thisPokemon.sprites.front_default}" alt="${thisPokemon.name}"/>
    <button type="button" class="btn btn-primary" data-toggle="modal" data-target="#pokeModal">
      More
    </button>
    </div>  
        `);
  }



// add pagination buttons
  $('#pagination').empty()
  var startI = Math.max(1, currentPage-Math.floor(numPageBtn/2));
  var endI = Math.min(numPages, currentPage+Math.floor(numPageBtn/2));
  const startPage = 1;
  const endPage = numPages;

  if (currentPage > 1) {
    $('#pagination').append(`
      <button type="button" class="btn btn-primary pageBtn" id="pagefirst" pageNum= "1">First</button>
    `);
    $('#pagination').append(`
    <button type="button" class="btn btn-primary pageBtn" id="pageprev" pageNum="${currentPage-1}">Prev</button>
  `);
}
  
  for (let i = startI; i <= endI; i++) {
    var active = "";
    if (i == currentPage) {
      active = "active";
    }
    $('#pagination').append(`
         <button type="button" class="btn btn-primary pageBtn ${active}" id="page${i}" pageNum="${i}">${i}</button>
    `);

  }
   if(currentPage < numPages) {
    $('#pagination').append(`
         <button type="button" class="btn btn-primary pageBtn id="pageprev" pageNum="${currentPage+1}">Next</button>
    `);
     $('#pagination').append(`
    <button type="button" class="btn btn-primary pageBtn id="pagelast" pageNum="${numPages}">Last</button>
    `);
  }

}

  $(document).ready(setup)


