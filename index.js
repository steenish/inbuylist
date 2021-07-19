// Global data array of recipes per category.
var recipeByCategory = []

// Global data array of ingredients in the shopping list.
var shoppingList = []

// String representing the html for the ingredient controls.
const ingredientControls = '<button id="remove100" class="removeButton ingredientButton" onclick="onIngredientConrolClick(-100)">-100</button><button id="remove10" class="removeButton ingredientButton" onclick="onIngredientConrolClick(-10)">-10</button><button id="remove1" class="removeButton ingredientButton" onclick="onIngredientConrolClick(-1)">-1</button><button id="add1" class="addButton ingredientButton" onclick="onIngredientConrolClick(1)">+1</button><button id="add10" class="addButton ingredientButton" onclick="onIngredientConrolClick(10)">+10</button><button id="add100" class="addButton ingredientButton" onclick="onIngredientConrolClick(100)">+100</button>';

var selectedIngredient = null;

// Global unit conversion table.
const unitConverter = {
    g: [
        { unit: "kg", lowerLimit: 1000 },
        { unit: "g", lowerLimit: 1 }
    ],
    ml: [
        { unit: "l", lowerLimit: 1000 },
        { unit: "dl", lowerLimit: 100 },
        { unit: "msk", lowerLimit: 15 },
        { unit: "tsk", lowerLimit: 5 },
        { unit: "krm", lowerLimit: 1 }
    ]
}

// Load the recipes from the JSON file, pre-process the data and do the first update of the recipe list.
d3.json("data.json", data => { preProcessData(data); updateRecipeList(); })

// Map the recipes into their respective categories, and sort everything in alphanumeric order.
const preProcessData = function (recipes) {
    // Construct the temporary object mapping category to recipes.
    let tempRecipeByCategory = {}
    recipes.forEach(recipe => {
        const category = recipe.category.toLowerCase()
        if (!(category in tempRecipeByCategory)) {
            tempRecipeByCategory[category] = []
        }
        tempRecipeByCategory[category].push(recipe)
    });

    // Sort recipes in each category.
    Object.entries(tempRecipeByCategory).sort((a, b) => alphaOrder(a.name, b.name))

    // Convert the recipeByCategory object into a mappable recipeByCategory array.
    Object.entries(tempRecipeByCategory).forEach(element => recipeByCategory.push({ category: element[0], recipes: element[1] }))

    // Sort the categories.
    recipeByCategory.sort((a, b) => alphaOrder(a.category, b.category))
}

// Add new recipes.
const updateRecipeList = function () {

    // Do data join for the recipe categories.
    let recipeUpdate = d3
        .select("#recipes")
        .selectAll(".recipeCategory")
        .data(recipeByCategory)

    let recipeEnter = recipeUpdate
        .enter()

    // Create the title for the recipe category.
    let recipeHeaders = recipeEnter
        .append("div")
        .classed("recipeCategory", true)

    recipeHeaders
        .append("h3")
        .text(d => capitalizeFirstLetter(d.category.toLowerCase()))

    // Append the list of ingredients for each recipe part.
    recipeHeaders
        .append("ul")
        .classed("recipeList", true)
        .selectAll("li")
        .data(d => d.recipes)
        .enter()
        .append("li")
        .text(d => d.name)
        .on("click", openRecipe)
}

// When a recipe is clicked, remove any old ingredients shown and show the new ones.
const openRecipe = function () {
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
        .append("h4")
        .classed("recipePartTitle", true)
        .text(d => capitalizeFirstLetter(d.name.toLowerCase()))

    recipePartHeaders
        .append("img")
        .attr("src", "img/addIcon.svg")
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

const addIngredients = function () {
    // The ingredients from the recipe part.
    let ingredients = d3.select(this).datum().ingredients

    // Merge the new ingredients into the existing shopping list.
    mergeIngredients(ingredients)

    updateIngredients();
}

// Update the visuals of the shopping list.
const updateIngredients = function () {
    let shoppingListUpdate = d3
        .select("#shoppingList")
        .selectAll("li")
        .data(shoppingList)
        .text(formatIngredient)

    shoppingListUpdate
        .enter()
        .append("li")
        .text(formatIngredient)
        .on("mouseenter", showIngredientControls)
        .on("mouseleave", hideIngredientControls)

    shoppingListUpdate
        .exit()
        .remove()
}

// Returns a well-formatted string representation of an ingredient object.
const formatIngredient = function (ingredient) {
    // If it is possible to convert the unit into something else.
    if (ingredient.unit in unitConverter) {
        let amountUnit = ""
        const units = unitConverter[ingredient.unit]

        // Keep track of how much of the amount is left, and has not been converted.
        let currentAmount = ingredient.amount

        // For each unit, in order of descending magnitude, see if the remaining amount fits into that magnitude
        // then add the whole parts and subtract from the current amount.
        units.forEach(unit => {
            const fraction = currentAmount / unit.lowerLimit
            if (fraction >= 1) {
                const whole = Math.floor(fraction)
                currentAmount -= whole * unit.lowerLimit
                amountUnit += `${whole} ${unit.unit} `
            }
        });

        // Ddd the raw amount in parentheses after.
        amountUnit += `(${ingredient.amount} ${ingredient.unit}) `

        return `${amountUnit}${ingredient.name}`
    } else {
        return `${ingredient.amount} ${ingredient.unit} ${ingredient.name}`
    }
}

// Merges the new ingredients into the shopping list gracefully.
const mergeIngredients = function (newIngredients) {
    newIngredients.forEach(newIngredient => {
        let neverFound = true

        // Check through the ingredients of the shopping list.
        for (oldIngredient of shoppingList) {
            // If the name and unit match, merge in the new ingredient and stop searching.
            if (newIngredient.name === oldIngredient.name && newIngredient.unit === oldIngredient.unit) {
                oldIngredient.amount += newIngredient.amount
                neverFound = false
                break;
            }
        }

        // If no match was found in the shopping list, add the ingredient to the shopping list.
        if (neverFound) {
            shoppingList.push({ name: newIngredient.name, amount: newIngredient.amount, unit: newIngredient.unit })
        }
    })
}

// Sort comparison function for alphanumeric ordering.
const alphaOrder = function (a, b) {
    if (a < b) {
        return -1;
    } else if (a > b) {
        return 1
    } else {
        return 0;
    }
}

const capitalizeFirstLetter = function (string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

const showIngredientControls = function (d) {
    d3
        .select(this)
        .classed("selectedIngredient", true)
    
    selectedIngredient = d3
        .select(this)
        .append("span")
        .html(ingredientControls)
        .datum()

}

const hideIngredientControls = function (d) {
    d3
    .select(this)
    .classed("selectedIngredient", false)

    d3
        .select(this)
        .select("span")
        .remove()
        
    selectedIngredient = null
}

// Adds the amount to the selected ingredient, removing the ingredient if the amount falls below 1 and updating the shopping list visuals.
const onIngredientConrolClick = function (amount) {
    selectedIngredient.amount = selectedIngredient.amount + amount
    if (selectedIngredient.amount <= 0) {
        shoppingList = shoppingList.filter(ingredient => !(ingredient.name === selectedIngredient.name && ingredient.amount === ingredient.amount))
    }
    updateIngredients()
}