const API_URL = `https://pokeapi.co/api/v2/`;

let pokedex = null
let pokedexEntryData = null
let pokemonGameData = null
let currentPokemon = null
let pokeName = ''
let pokeID = 1
let button = document.querySelector('button')
let spriteImage = document.querySelector('#sprite')
let resultText = document.querySelector('#flavor-text')
let roundResults = document.querySelector('#round-end')
let gameResults = document.querySelector('#game-end')
let pageContent = document.querySelector('#dynamic-content')
let resultsContent = document.querySelector('#results')
let guessCounter = 0
let comScore = 0
let playerScore = 0
let hints = []


//The starting button's click event, it starts the first round of the game
button.addEventListener('click', async () => {
    pageContent.removeChild(pageContent.children[0])
    try {

        //Generate the poxedex
        if(pokedex == null){
            pokedex = (await axios.get(`${API_URL}pokedex/1`));
            pokedex = pokedex.data.pokemon_entries;
        }

        //Generate a random index from the pokedex
        pokeID = Math.ceil(Math.random()*pokedex.length-1);
        if (pokeID == 0){
            pokeID = 1
        }
        
        //Generate all data needed for output and hints
        //Generation, genus, egg groups, flavor texts
        pokedexEntryData = ((await axios.get(`${API_URL}pokemon-species/${pokeID}`)).data)
        //Types, abilities, held items in wild, moves, sprite, ev yeild
        pokemonGameData = (await axios.get(`${API_URL}pokemon/${pokeID}`)).data

        //Begin the round of the game
        roundStart(pokedexEntryData, pokemonGameData)

    } catch (error) {

        

    }

})

//Generate a new pokemon, hints, and the first game objects
function roundStart (pokedexData, gameData) {
    currentPokemon = new Pokemon(pokedexData.id, pokedexData.name, pokedexData.flavor_text_entries, gameData.types, pokedexData.generation.name, gameData.stats, pokedexData.egg_groups, gameData.abilities, gameData.moves, gameData.held_items, pokedexData.genera)
    generateHints(currentPokemon)
    createContent(hints[0])
}

//Function to generate an array of hints from a given pokemon
function generateHints (pokemonObject){

    //Pokemon type
    hints = []
    if (pokemonObject.types.length > 1){
        hints.push(`This pokemon is ${pokemonObject.types[0]} and ${pokemonObject.types[1]} type`)
    } else if (pokemonObject.types.length = 1){
        hints.push(`This pokemon is ${pokemonObject.types[0]} type`)
    }

    //Generation pokemon is from
    hints.push(`This pokemon is from ${pokemonObject.generation}`)

    //EV yeild from pokemon
    if (pokemonObject.evYield.length > 1){
        hints.push(`This pokemon yields ${pokemonObject.evYield[0].yeild} ${pokemonObject.evYield[0].name} and ${pokemonObject.evYield[1].yeild} ${pokemonObject.evYield[1].name} EVs`)
    } else if (pokemonObject.evYield.length = 1){
        hints.push(`This pokemon yields ${pokemonObject.evYield[0].yeild} ${pokemonObject.evYield[0].name} EVs`)
    }

    //Egg groups the pokemon belongs to
    if (pokemonObject.eggGroups.length > 1){
        hints.push(`This pokemon is from the ${pokemonObject.eggGroups[0]} and ${pokemonObject.eggGroups[1]} egg groups`)
    } else if (pokemonObject.eggGroups[0] == 'no-eggs'){
        hints.push(`This pokemon does not have any egg groups`)
    } else if (pokemonObject.eggGroups.length == 1){
        hints.push(`This pokemon is from the ${pokemonObject.eggGroups[0]} egg group`)
    }

    //Abilities the pokemon can have
    if (pokemonObject.abilities.length == 1){
        hints.push(`This pokemon's only ability is ${pokemonObject.abilities[0]}`)
    } else if (pokemonObject.abilities.length == 2){
        hints.push(`This pokemon's possible abilities are ${pokemonObject.abilities[0]} and ${pokemonObject.abilities[1]}`)
    } else if (pokemonObject.abilities.length == 3){
        hints.push(`This pokemon's possible abilities are ${pokemonObject.abilities[0]}, ${pokemonObject.abilities[1]}, and ${pokemonObject.abilities[2]}`)
    }

    //Picks a random move the pokemon can learn
    let move = pokemonObject.moves[Math.floor(Math.random()*pokemonObject.moves.length)]
    hints.push(`One of the moves this pokemon can learn is ${move}`)

    //Held items the pokemon can be holding when caught
    if (pokemonObject.heldItems.length == 0){
        hints.push(`This pokemon never has a held item in the wild`)
    } else if (pokemonObject.heldItems.length == 1){
        hints.push(`This pokemon sometimes is caught holding a ${pokemonObject.heldItems[0]}`)
    } else if (pokemonObject.heldItems.length >= 2){
        hints.push(`This pokemon sometimes is caught holding a ${pokemonObject.heldItems[0]} or ${pokemonObject.heldItems[1]}`)
    }

    //The pokemon's genus. Ex: Bulbasaur is The Seed Pokemon
    hints.push(`This pokemon is known as the ${pokemonObject.genus}`)
}

//Create the next hint, input, and submit button. Put an event listener on the button
function createContent (hintAttribute){

    //Creating elements needed
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

    //Add new elements to the page
    newDiv.appendChild(newHint)
    newDiv.appendChild(newInput)
    newDiv.appendChild(newButton)

    pageContent.appendChild(newDiv)

    //Create a click event on the new button
    newButton.onclick = function () {
        //Disable the button after it's clicked
        newButton.onclick = undefined
        guessCounter++

        //If player guesses correctly
        if (newInput.value.toLowerCase() == currentPokemon.name){
            playerScore++
            spriteImage.src = currentPokemon.sprite

            let replayDiv = document.createElement('div')
            replayDiv.classList.toggle('hint-and-guess') 
            
            roundResults.innerText = `You guessed correctly and won the round! You now have ${playerScore} points to my ${comScore} points. \n\n\nThe pokemon I was looking for this round was Pokemon ${currentPokemon.number}, ${(currentPokemon.name.substring(0,1).toUpperCase())+(currentPokemon.name.substring(1))}`
            resultText.innerText = currentPokemon.flavorTexts[Math.floor(Math.random()*currentPokemon.flavorTexts.length)]

            //If player wins the game
            if(playerScore == 3){
                gameResults.innerText = `You won with ${playerScore} points to my ${comScore} points! Click the pokeball to play again!`

                //Create elements for the replay button
                let replayButton = document.createElement('button')
                let replayButtonImg = document.createElement('img')
                replayButtonImg.src = 'images/pokeball.png'
                replayButtonImg.height = '150';
                replayButtonImg.width = '150';
                replayButton.classList.toggle('pokeball')

                //Add replay elements to the page
                replayButton.appendChild(newButtonImg)
                replayDiv.appendChild(replayButton)

                resultsContent.appendChild(replayDiv)
                
                //Add a click event to replay button
                replayButton.onclick = async function () {
                    //Delete all of the current round's content from the page
                    resultsContent.removeChild(replayDiv)
                    while(pageContent.children[0]){
                        pageContent.removeChild(pageContent.children[0])
                    }

                    //Reset all variables
                    playerScore = 0
                    comScore = 0
                    guessCounter = 0
                    resultText.innerText = ''
                    roundResults.innerText = ''
                    gameResults.innerText = ''
                    spriteImage.src = 'https://www.colorhexa.com/303030.png'
                    
                    //Generate a new pokemon
                    pokeID = Math.ceil(Math.random()*pokedex.length-1);
                    if (pokeID == 0){
                        pokeID = 1
                    }
                    
                    //Generation, genus, egg groups, flavor texts
                    pokedexEntryData = ((await axios.get(`${API_URL}pokemon-species/${pokeID}`)).data)
                    //Types, abilities, held items in wild, moves, sprite, ev yeild
                    pokemonGameData = (await axios.get(`${API_URL}pokemon/${pokeID}`)).data

                    //Start a new round with new pokemon
                    roundStart(pokedexEntryData, pokemonGameData)
                }
            } else {

                //Create elements for the replay button
                let replayButton = document.createElement('button')
                let replayButtonImg = document.createElement('img')
                replayButtonImg.src = 'images/pokeball.png'
                replayButtonImg.height = '150';
                replayButtonImg.width = '150';
                replayButton.classList.toggle('pokeball')
                
                //Add replay elements to the page
                replayButton.appendChild(newButtonImg)
                replayDiv.appendChild(replayButton)

                pageContent.appendChild(replayDiv)
                
                //Add a click event to the replay button
                replayButton.onclick = async function () {

                    //Reset variables
                    guessCounter = 0
                    resultText.innerText = ''
                    roundResults.innerText =''
                    spriteImage.src = 'https://www.colorhexa.com/303030.png'

                    //Remove past round's content from the page
                    while(pageContent.children[0]){
                        pageContent.removeChild(pageContent.children[0])
                    }
                    
                    //Generate a new pokemon
                    pokeID = Math.ceil(Math.random()*pokedex.length-1);
                    if (pokeID == 0){
                        pokeID = 1
                    }
                    
                    //Generation, genus, egg groups, flavor texts
                    pokedexEntryData = ((await axios.get(`${API_URL}pokemon-species/${pokeID}`)).data)
                    //Types, abilities, held items in wild, moves, sprite, ev yeild
                    pokemonGameData = (await axios.get(`${API_URL}pokemon/${pokeID}`)).data

                    //Start a new round with the new pokemon
                    roundStart(pokedexEntryData, pokemonGameData)
                }

            }
        } 
        //If round isn't over, generate next hint
        else if (guessCounter <= 7){
            createContent(hints[guessCounter])
        }

        //If round is over and player lost
        else if (guessCounter > 7){
            comScore++
            spriteImage.src = currentPokemon.sprite

            //Create replay elements
            let replayDiv = document.createElement('div')
            replayDiv.classList.toggle('hint-and-guess') 

            roundResults.innerText = `You ran out of hints and lost the round! I now have ${comScore} points to your ${playerScore} points. \n\n\nThe pokemon I was looking for this round was Pokemon ${currentPokemon.number}, ${(currentPokemon.name.substring(0,1).toUpperCase())+(currentPokemon.name.substring(1))}`
            resultText.innerText = currentPokemon.flavorTexts[Math.floor(Math.random()*currentPokemon.flavorTexts.length)]
            
            //If computer won the game
            if (comScore == 3){
                gameResults.innerText = `You lost with ${playerScore} points to my ${comScore} points! Click the pokeball to play again!`

                //Create replay button
                let replayButton = document.createElement('button')
                let replayButtonImg = document.createElement('img')
                replayButtonImg.src = 'images/pokeball.png'
                replayButtonImg.height = '150';
                replayButtonImg.width = '150';
                replayButton.classList.toggle('pokeball')
                
                //Add replay elements to the page
                replayButton.appendChild(newButtonImg)
                replayDiv.appendChild(replayButton)

                resultsContent.appendChild(replayDiv)

                //Add a click event to the replay button
                replayButton.onclick = async function () {
                    
                    //Remove all past content from the page
                    resultsContent.removeChild(replayDiv)
                    while(pageContent.children[0]){
                        pageContent.removeChild(pageContent.children[0])
                    }

                    //Reset variables
                    playerScore = 0
                    comScore = 0
                    guessCounter = 0
                    resultText.innerText = ''
                    roundResults.innerText = ''
                    gameResults.innerText = ''
                    spriteImage.src = 'https://www.colorhexa.com/303030.png'

                    //Generate a new pokemon
                    pokeID = Math.ceil(Math.random()*pokedex.length-1);
                    if (pokeID == 0){
                        pokeID = 1
                    }
                    
                    //Generation, genus, egg groups, flavor texts
                    pokedexEntryData = ((await axios.get(`${API_URL}pokemon-species/${pokeID}`)).data)
                    //Types, abilities, held items in wild, moves, sprite, ev yeild
                    pokemonGameData = (await axios.get(`${API_URL}pokemon/${pokeID}`)).data

                    //Start a new round with the pokemon
                    roundStart(pokedexEntryData, pokemonGameData)
                }
            }
            //If the round is over and a new round needs generated
            else {

                //Create elements needed for replay
                let replayDiv = document.createElement('div')
                replayDiv.classList.toggle('hint-and-guess') 
                
                let replayButton = document.createElement('button')
                let replayButtonImg = document.createElement('img')
                replayButtonImg.src = 'images/pokeball.png'
                replayButtonImg.height = '150';
                replayButtonImg.width = '150';
                replayButton.classList.toggle('pokeball')

                //Add replay elements to page
                replayButton.appendChild(newButtonImg)
                replayDiv.appendChild(replayButton)

                pageContent.appendChild(replayDiv)

                //Add a click event to the replay button
                replayButton.onclick = async function () {
                    
                    //Remove past content from page
                    while(pageContent.children[0]){
                        pageContent.removeChild(pageContent.children[0])
                    }

                    //Reset variables
                    guessCounter = 0
                    resultText.innerText = ''
                    roundResults.innerText =''
                    spriteImage.src = 'https://www.colorhexa.com/303030.png'

                    //Generate a new pokemon
                    pokeID = Math.ceil(Math.random()*pokedex.length-1);
                    if (pokeID == 0){
                        pokeID = 1
                    }
                    
                    //Generation, genus, egg groups, flavor texts
                    pokedexEntryData = ((await axios.get(`${API_URL}pokemon-species/${pokeID}`)).data)
                    //Types, abilities, held items in wild, moves, sprite, ev yeild
                    pokemonGameData = (await axios.get(`${API_URL}pokemon/${pokeID}`)).data

                    //Start a new round with the pokemon
                    roundStart(pokedexEntryData, pokemonGameData)

                }
            }
        }
    }
}

//Object class for the random pokemon each round generates
class Pokemon {

    //Constructs a new pokemon with all the given variables
    constructor(number, name, flavorTexts, types, generation, stats, eggGroups, abilities, moves, heldItems, genus){
        
        //Parse an inputted number into a string of the needed length
        number = `${number}`
        if(number.length < 3){
            if(number.length == 1){
                number = `00${number}`
            } else if (number.length == 2){
                number = `0${number}`
            }
        }

        //Set the pokemon's number
        this.number = number

        //Set the pokemon's name, replacing any instances of the character '-' with a space
        name = name.split('-')
        this.name = name.join(' ')

        //Set the pokemon's sprite to a url of an image of the given pokemon
        this.sprite = `https://www.serebii.net/pokemon/art/${number}.png`

        //Filter the input for only english flavor texts and remove multiples of the same entries
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

        //Sets the flavorTexts to an array of english entries
        this.flavorTexts = flavorTextsBuilder

        //Filter the input for only the names of the types
        let typesBuilder = []
        types.forEach(element => {
            typesBuilder.push(element.type.name)
        })

        //Sets the pokemon's types to an array of type names
        this.types = typesBuilder

        //Changes the generation into a more easily readable version
        generation = generation.split('-')
        generation = generation.join(' ')
        generation = (generation.substring(0,1).toUpperCase() + generation.substring(1, 10) + generation.substring(10).toUpperCase())
        this.generation = generation
        
        //Filters the effort value input for the stat name and value only
        let effortBuilder = []
        stats.forEach(element => {
            if(element.effort > 0){
                effortBuilder.push({name: element.stat.name, yeild: element.effort})
            }
        })

        this.evYield = effortBuilder

        //Filters the input for the names of egg group only
        let eggGroupBuilder = []
        eggGroups.forEach(element => {
            eggGroupBuilder.push(element.name)
        })

        this.eggGroups = eggGroupBuilder

        //Filters the input for abilities' names only
        let abilityBuilder = []
        abilities.forEach(element => {
            abilityBuilder.push(element.ability.name)
        })

        this.abilities = abilityBuilder

        //Filter the input for move names only
        let movesBuilder = []
        moves.forEach(element => {
            movesBuilder.push(element.move.name)
        })

        this.moves = movesBuilder

        //Filter the input for item names only
        let heldItemBuilder = []
        heldItems.forEach(element => {
            heldItemBuilder.push(element.item.name)
        })

        this.heldItems = heldItemBuilder

        //Filter the input for english genus only
        genus.forEach( item => {
            if(item.language.name == 'en'){
                this.genus = item.genus
            }
        })
    }
}