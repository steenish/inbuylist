// Global data array of recipes.
var recipes = []

// Global data array of ingredients in the shopping list.
var shoppingList = []

// Global unit conversion table.
const unitConverter = {
    g: [
        { unit: "kg", lowerLimit: 1000 },
        { unit: "g", lowerLimit: 1}
    ],
    ml: [
        { unit: "l", lowerLimit: 1000},
        { unit: "dl", lowerLimit: 100},
        { unit: "msk", lowerLimit: 15},
        { unit: "tsk", lowerLimit: 5},
        { unit: "krm", lowerLimit: 1}
    ]
}

// Load the recipes from the JSON file and do the first update of the recipe list.
d3.json("data.json", data => { recipes = data; updateRecipeList(); })

// Add new recipes and remove the old ones, according to filtering.
const updateRecipeList = function() {
    let recipeList = d3.select("#recipeList");
    let recipeUpdate = recipeList
        .selectAll("li")
        .data(recipes)

    let recipeEnter = recipeUpdate
        .enter()
        .append("li")
        .text(d => d.name)
        .on("click", openRecipe)

    let recipeExit = recipeUpdate
        .exit()
        .remove()
}

// When a recipe is clicked, remove any old ingredients shown and show the new ones.
const openRecipe = function() {
    // The data from the recipe.
    let recipe = d3.select(this).datum()
    
    // Remove old ingredients.
    d3
        .select("#recipeIngredients")
        .selectAll("*")
        .remove()

    // Do data join for the recipe parts.
    let recipePartUpdate = d3
        .select("#recipeIngredients")
        .selectAll(".recipePart")
        .data(recipe.ingredients)

    let recipePartEnter = recipePartUpdate
        .enter()

    // Create the title and button for the recipe part.
    let recipePartHeaders = recipePartEnter
        .append("div")
        .classed("recipePartHeader", true)

    recipePartHeaders
        .append("p")
        .classed("recipePartTitle", true)
        .text(d => d.name)
        
    recipePartHeaders
        .append("button")
        .classed("addIngredientsButton", true)
        .text("Lägg till")
        .on("click", addIngredients)

    // Append the list of ingredients for each recipe part.
    recipePartHeaders
        .append("ul")
            .classed("recipePart", true)
            .selectAll("li")
                .data(d => d.ingredients)
                .enter()
                .append("li")
                .text(formatIngredient)
}

const addIngredients = function() {
    // The ingredients from the recipe part.
    let ingredients = d3.select(this).datum().ingredients

    // Merge the new ingredients into the existing shopping list.
    mergeIngredients(ingredients)

    // Update the visuals.
    let shoppingListUpdate = d3
        .select("#shoppingList")
        .selectAll("li")
        .data(shoppingList)
        .text(formatIngredient)

    let shoppingListEnter = shoppingListUpdate
        .enter()
        .append("li")
        .text(formatIngredient)
}

const formatIngredient = function(ingredient) {
    if (ingredient.unit in unitConverter) {
        let amountUnit = ""
        const units = unitConverter[ingredient.unit]

        let currentAmount = ingredient.amount
        units.forEach(unit => {
            const fraction = currentAmount / unit.lowerLimit
            if (fraction >= 1) {
                const whole = Math.floor(fraction)
                currentAmount -= whole * unit.lowerLimit
                amountUnit += `${whole} ${unit.unit} `
            }
        });

        if (currentAmount === ingredient.amount) {
            amountUnit = `${ingredient.amount} ${ingredient.unit} `
        }

        return `${amountUnit}${ingredient.name}`
    } else {
        return `${ingredient.amount} ${ingredient.unit} ${ingredient.name}`
    }
}

const mergeIngredients = function(newIngredients) {
    newIngredients.forEach(newIngredient => {
        let neverFound = true
        shoppingList.forEach(oldIngredient => {
            if (neverFound && newIngredient.name === oldIngredient.name && newIngredient.unit === oldIngredient.unit) {
                oldIngredient.amount += newIngredient.amount
                neverFound = false
            }
        })

        if (neverFound) {
            shoppingList.push({name: newIngredient.name, amount: newIngredient.amount, unit: newIngredient.unit})
        }
    })
}