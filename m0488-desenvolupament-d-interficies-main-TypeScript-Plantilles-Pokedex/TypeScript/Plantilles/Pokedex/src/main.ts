// ==========================================================
// EXERCICI 1: Llistar els 151 Pokémon
// ==========================================================
// TODO: Implementa la lògica de l'exercici 1 seguint els requisits


import * as Models from "./models.js";
import * as Utils from "./utils.js";
import {generarBotonsTipus} from "./utils.js";

console.log("main.ts carregat correctament");



let mapaPokemon = new Map<number, Models.BasePokemon>();
const cachePokemon = new Map<number, Models.DetailedPokemon>();

const botoCarregar = document.getElementById("btn-show-all") as HTMLButtonElement | null;

if (botoCarregar) {
    botoCarregar.addEventListener("click", carregarLlistaPokemon);
} else {
    console.error("No s'ha trobat el botó amb id btn-show-all");
}

async function carregarLlistaPokemon(): Promise<void>{

    Utils.mostrarEstat("Carregant la llista...", "loading");


    try{
       let resposta = await fetch("https://pokeapi.co/api/v2/pokemon?limit=151");
       if(!resposta.ok){
           throw new Error("Error al carregar la llista.")
       }

       let respostaJson = (await resposta.json()) as Models.IPokeApiListResponse;

       mapaPokemon.clear();
       respostaJson.results.forEach((p)  => {
           let pokemon = new Models.BasePokemon(p);
           mapaPokemon.set(pokemon.id, pokemon)
       });

        let llistaPokemon = Array.from(mapaPokemon.values());

        Utils.renderitzarLlistaNoms(llistaPokemon);

        Utils.amagarEstat();

    }catch (error: unknown){
        console.error("Error real:", error);

        Utils.mostrarEstat("Error de connexió. Revisa la consola.", "error");
    }




}

// ==========================================================
// EXERCICI 2: Cercador en temps real
// ==========================================================
// TODO: Implementa la lògica de l'exercici 2 seguint els requisits

let inputBuscar = document.getElementById("search-input") as HTMLInputElement | null;

if (inputBuscar) {
    inputBuscar.addEventListener("input", filtrarPokemon);
} else {
    console.error("No s'ha trobat l'input amb id search-input");
}

function filtrarPokemon(): void {
    if (!inputBuscar) {     //Confirmar que la entrada del input existeix
        return;
    }

    let textCerca = inputBuscar.value.trim().toLowerCase();

    let totsElsPokemon = Array.from(mapaPokemon.values());

    //Si no hi ha text mostra tots els Pokemons
    if (textCerca === "") {
        Utils.renderitzarLlistaNoms(totsElsPokemon);
        return;
    }

    const numeroTrobar = Number(textCerca);

    let pokemonFiltrats: Models.BasePokemon[];

    // Si la conversió dona número, buscamos por ID
    // isNan --> funció per determinar si un valor es númeric
    if (!isNaN(numeroTrobar)) {

        pokemonFiltrats = totsElsPokemon.filter(
            (pokemon) => pokemon.id === numeroTrobar);

    } else {

        // Si no es un número, buscamos por nombre
        pokemonFiltrats = totsElsPokemon.filter(
            (pokemon) => pokemon.name.toLowerCase().includes(textCerca));
    }

    Utils.renderitzarLlistaNoms(pokemonFiltrats);
}



// ==========================================================
// EXERCICI 3: Detall del Pokémon, cache i crit
// ==========================================================

// Recuperamos el <ul id="pokemon-list">.
const llistaPokemonElement = document.getElementById("pokemon-list") as HTMLUListElement | null;

    if (llistaPokemonElement) {

        // Utilizamos un único listener para toda la lista.
         llistaPokemonElement.addEventListener("click", (event: MouseEvent) => {

            // Elemento concreto sobre el que se ha pulsado.
            const elementPremut = event.target;

            if (!(elementPremut instanceof HTMLElement)) {
                return;
            }

            // Buscamos el <li> más próximo.
            // Funciona aunque se pulse en el <strong>.
            const liPokemon = elementPremut.closest("li") as HTMLLIElement | null;

            if (!liPokemon) {
                return;
            }

            // Obtenemos el ID guardado en data-id.
            const idText = liPokemon.dataset.id;

            if (!idText) {
                return;
            }

            const idPokemon = Number(idText);

            // Buscamos el Pokémon básico en el Map.
            const pokemonBase = mapaPokemon.get(idPokemon);

            if (!pokemonBase) {
                return;
            }

            // Marcamos visualmente el elemento seleccionado.
            Utils.marcarItemActiu(liPokemon);

            // Cargamos su detalle.
            void carregarDetallPokemon(
                pokemonBase.id,
                pokemonBase.url
            );
        }
    );

} else {
    console.error("No s'ha trobat la llista amb id pokemon-list");
}


/**
 * Carrega la informació detallada d'un Pokémon.
 *
 * Primer consulta la memòria cau.
 * Si el Pokémon no està guardat, fa una petició a la PokéAPI.
 */
async function carregarDetallPokemon(
    id: number,
    url: string
): Promise<void> {

    // Comprobamos si ya tenemos el Pokémon en la caché.
    const pokemonEnCache = cachePokemon.get(id);

    if (pokemonEnCache) {
        console.log(`Pokémon ${id} recuperat de la memòria cau`);

        Utils.renderitzarDetallCard(pokemonEnCache);

        return;
    }

    // Si no está en caché, mostramos el mensaje de carga.
    Utils.mostrarEstat("Carregant el detall del Pokémon...", "loading");

    try {
        // Pedimos los datos detallados a la API.
        const resposta = await fetch(url);

        if (!resposta.ok) {
            throw new Error(`Error HTTP: ${resposta.status}`);
        }

        // Convertimos la respuesta a JSON.
        const dadesPokemon = (await resposta.json()) as Models.IPokeApiDetail;

        // Creamos una instancia de DetailedPokemon.
        const pokemonDetallat = new Models.DetailedPokemon(dadesPokemon, url);

        // Guardamos el objeto en la caché.
        cachePokemon.set(pokemonDetallat.id, pokemonDetallat);

        // Mostramos la tarjeta en el panel derecho.
        Utils.renderitzarDetallCard(pokemonDetallat);

        // Ocultamos el mensaje de carga.
        Utils.amagarEstat();

    } catch (error: unknown) {
        console.error("Error carregant el detall:", error);

        Utils.mostrarEstat("No s'ha pogut carregar el detall del Pokémon.", "error");
    }
}






// ==========================================================
// EXERCICI 4: Botons de filtre per tipus
// ==========================================================

Utils.generarBotonsTipus();




// ==========================================================
// EXERCICI 5: Filtrar la llista per tipus
// ==========================================================
// TODO: Implementa la lògica de l'exercici 5 seguint els requisits