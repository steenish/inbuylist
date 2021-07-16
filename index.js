// Global data array of recipes.
var recipes = []

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
        .text(d => d.namn)
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
        .data(recipe.ingredienser)

    let recipePartEnter = recipePartUpdate
        .enter()

    // Create the title and button for the recipe part.
    let recipePartHeaders = recipePartEnter
        .append("div")
        .classed("recipePartHeader", true)

    recipePartHeaders
        .append("p")
        .classed("recipePartTitle", true)
        .text(d => d.namn)
        
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
                .data(d => d.ingredienser)
                .enter()
                .append("li")
                .text(formatIngredient)
}

const addIngredients = function() {
    // The ingredients from the recipe part.
    let ingredients = d3.select(this).datum().ingredienser

    // TODO: Make global shopping list variable to hold all added ingredients, then add the newly added ingredients to that variable gracefully, then do the d3 data join stuff.

    // TODO: This is temporary, see TODO above.
    let shoppingListUpdate = d3
        .select("#shoppingList")
        .selectAll("li")
        .data(ingredients)

    let shoppingListEnter = shoppingListUpdate
        .enter()
        .append("li")
        .text(formatIngredient)
}

// TODO: Implement nice formatting for ingredients.
const formatIngredient = function(ingredient) {
    return ingredient.namn
}