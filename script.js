const API_URL = `https://pokeapi.co/api/v2/`;

let pokedex = null
let pokedexEntryData = null
let pokemonGameData = null
let currentPokemon = null
let pokeName = ''
let button = document.querySelector('button')
let spriteImage = document.querySelector('#sprite')
let pageContent = document.body.children[2]
let guessCounter = 0
let hints = []

button.addEventListener('click', async () => {
    pageContent.removeChild(button)
    try {

        if(pokedex == null){
            pokedex = (await axios.get(`${API_URL}pokedex/1`));
            pokedex = pokedex.data.pokemon_entries;
        }

        let pokeID = Math.ceil(Math.random()*pokedex.length-1);
        
        //Generation, genus, egg groups, flavor texts
        pokedexEntryData = ((await axios.get(`${API_URL}pokemon-species/${pokeID}`)).data)
        //Types, abilities, held items in wild, moves, sprite, ev yeild
        pokemonGameData = (await axios.get(`${API_URL}pokemon/${pokeID}`)).data

        currentPokemon = new Pokemon(pokedexEntryData.id, pokedexEntryData.name, pokedexEntryData.flavor_text_entries, pokemonGameData.types, pokedexEntryData.generation.name, pokemonGameData.stats, pokedexEntryData.egg_groups, pokemonGameData.abilities, pokemonGameData.moves, pokemonGameData.held_items, pokedexEntryData.genera)
        console.log(currentPokemon)
        generateHints(currentPokemon)
        createContent(hints[0])
    } catch (error) {

        console.log(error)

    }

})

function generateHints (pokemonObject){

    if (pokemonObject.types.length > 1){
        hints.push(`This pokemon is ${pokemonObject.types[0]} and ${pokemonObject.types[1]} type`)
    } else if (pokemonObject.types.length = 1){
        hints.push(`This pokemon is ${pokemonObject.types[0]} type`)
    }

    hints.push(`This pokemon is from ${pokemonObject.generation}`)

    if (pokemonObject.evYield.length > 1){
        hints.push(`This pokemon yields ${pokemonObject.evYield[0].yeild} ${pokemonObject.evYield[0].name} and ${pokemonObject.evYield[1].yeild} ${pokemonObject.evYield[1].name} EVs`)
    } else if (pokemonObject.evYield.length = 1){
        hints.push(`This pokemon yields ${pokemonObject.evYield[0].yeild} ${pokemonObject.evYield[0].name} EVs`)
    }

    if (pokemonObject.eggGroups.length > 1){
        hints.push(`This pokemon is from the ${pokemonObject.eggGroups[0]} and ${pokemonObject.eggGroups[1]} egg groups`)
    } else if (pokemonObject.eggGroups[0] == 'no-eggs'){
        hints.push(`This pokemon does not have any egg groups`)
    } else if (pokemonObject.eggGroups.length == 1){
        hints.push(`This pokemon is from the ${pokemonObject.eggGroups[0]} egg group`)
    }

    if (pokemonObject.abilities.length == 1){
        hints.push(`This pokemon's only ability is ${pokemonObject.abilities[0]}`)
    } else if (pokemonObject.abilities.length == 2){
        hints.push(`This pokemon's possible abilities are ${pokemonObject.abilities[0]} and ${pokemonObject.abilities[1]}`)
    } else if (pokemonObject.abilities.length == 3){
        hints.push(`This pokemon's possible abilities are ${pokemonObject.abilities[0]}, ${pokemonObject.abilities[1]}, and ${pokemonObject.abilities[2]}`)
    }

    let move = pokemonObject.moves[Math.floor(Math.random()*pokemonObject.moves.length)]
    hints.push(`One of the moves this pokemon can learn is ${move}`)

    if (pokemonObject.heldItems.length == 0){
        hints.push(`This pokemon never has a held item in the wild`)
    } else if (pokemonObject.heldItems.length == 1){
        hints.push(`This pokemon sometimes is caught holding a ${pokemonObject.heldItems[0]}`)
    } else if (pokemonObject.heldItems.length >= 2){
        hints.push(`This pokemon sometimes is caught holding a ${pokemonObject.heldItems[0]} or ${pokemonObject.heldItems[1]}`)
    }

    hints.push(`This pokemon is known as the ${pokemonObject.genus}`)
}

function createContent (hintAttribute){
    let newDiv = document.createElement('div')
    newDiv.classList.toggle('hint-and-guess') 

    let newHint = document.createElement('p')
    newHint.innerText = hintAttribute
    let newInput = document.createElement('input')
    let newButton = document.createElement('button')
    let newButtonImg = document.createElement('img')
    newButtonImg.src = 'images/pokeball.png'
    newButtonImg.height = '150';
    newButtonImg.width = '150';
    newButton.classList.toggle('pokeball')
    newButton.appendChild(newButtonImg)
    newButton.onclick = function () {
        newDiv.removeChild(newButton)
        guessCounter++
        console.log('Running guess')
        if (newInput.value.toLowerCase() == currentPokemon.name){
            console.log('correct guess')
            spriteImage.src = currentPokemon.sprite
        } else if (guessCounter <= 7){
            createContent(hints[guessCounter])
        } else if (guessCounter > 7){
            spriteImage.src = currentPokemon.sprite
        }
    }

    newDiv.appendChild(newHint)
    newDiv.appendChild(newInput)
    newDiv.appendChild(newButton)

    pageContent.appendChild(newDiv)
}

function parseGuess (guess) {
    
}

class Pokemon {
    constructor(number, name, flavorTexts, types, generation, stats, eggGroups, abilities, moves, heldItems, genus){
        
        //Parse input for number
        number = `${number}`
        if(number.length < 3){
            if(number.length == 1){
                number = `00${number}`
            } else if (number.length == 2){
                number = `0${number}`
            }
        }

        this.number = number
        this.name = name
        this.sprite = `https://www.serebii.net/pokemon/art/${number}.png`

        //Parse input for english flavor texts and remove multiples of the same entries
        let flavorTextsBuilder = []
        flavorTexts.forEach(element => {
            if (element.language.name == 'en') {
                let flavorText = element.flavor_text
                flavorText = flavorText.split('\n')
                flavorText = flavorText.join(' ')
                if(!flavorTextsBuilder.includes(flavorText)){
                    flavorTextsBuilder.push(flavorText)
                }
            }
        })

        this.flavorTexts = flavorTextsBuilder

        //Parse input for types' names only
        let typesBuilder = []
        types.forEach(element => {
            typesBuilder.push(element.type.name)
        })

        this.types = typesBuilder

        //Parse generation into a more easily readable version
        generation = generation.split('-')
        generation = generation.join(' ')
        generation = (generation.substring(0,1).toUpperCase() + generation.substring(1, 10) + generation.substring(10).toUpperCase())
        this.generation = generation
        
        //Parse input for effort value yeild name and value only
        let effortBuilder = []
        stats.forEach(element => {
            if(element.effort > 0){
                effortBuilder.push({name: element.stat.name, yeild: element.effort})
            }
        })

        this.evYield = effortBuilder

        //Parse input for egg group names only
        let eggGroupBuilder = []
        eggGroups.forEach(element => {
            eggGroupBuilder.push(element.name)
        })

        this.eggGroups = eggGroupBuilder

        //Parse input for abilities' names only
        let abilityBuilder = []
        abilities.forEach(element => {
            abilityBuilder.push(element.ability.name)
        })

        this.abilities = abilityBuilder

        //Parse input for move names only
        let movesBuilder = []
        moves.forEach(element => {
            movesBuilder.push(element.move.name)
        })

        this.moves = movesBuilder

        //Parse input for item names only
        let heldItemBuilder = []
        heldItems.forEach(element => {
            heldItemBuilder.push(element.item.name)
        })

        this.heldItems = heldItemBuilder

        //Parse input for english genus only
        genus.forEach( item => {
            if(item.language.name == 'en'){
                this.genus = item.genus
            }
        })
    }
}