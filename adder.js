var recipePartSource = `
<label>Receptdelsnamn:</label>
<input class="recipePartName" name="recipePartName" type="text">
<p>Ingredienser:</p>
<div class="ingredientList">
<button class="addIngredientButton" type="button" onclick="addIngredient(this.parentNode)">Lägg till ingrediens</button>
</div>`

var ingredientSource = `
<label for="ingredientName">Ingrediensnamn:</label>
<input name="ingredientName" type="text">
<label for="ingredientAmount">Mängd:</label>
<input name="ingredientAmount" type="text">
<label for="ingredientUnit">Enhet:</label>
<select>
<option>ml</option>
<option>g</option>
<option>st</option>
</select>`

document.forms[0].addEventListener("submit", function (event) {
    event.preventDefault()

    // Extract data from the form and input it into a new recipe object.
    let form = document.getElementById("form")
    let topChildren = form.childNodes
    let topInputs = form.getElementsByTagName("input")

    let recipe = { name: topInputs[0].value, category: topInputs[1].value.toLowerCase(), ingredients: [] }

    let recipeParts = document.getElementsByClassName("recipePart")

    for (element of recipeParts) {
        let recipePart = { name: element.getElementsByTagName("input")[0].value.toLowerCase(), ingredients: [] }

        for (ingredientElement of element.getElementsByClassName("ingredient")) {
            let ingredientInputs = ingredientElement.getElementsByTagName("input")
            recipePart.ingredients.push({
                name: ingredientInputs[0].value.toLowerCase(),
                amount: parseInt(ingredientInputs[1].value),
                unit: ingredientElement.getElementsByTagName("select")[0].value
            })
        }

        recipe.ingredients.push(recipePart)
    }
    const textarea = document.createElement("textarea")
    document.body.appendChild(textarea)
    textarea.value = JSON.stringify(recipe, null, 4)
    textarea.select()
    document.execCommand("copy")
    document.body.removeChild(textarea)
    location.reload()
})

const addRecipePart = function () {
    let recipePart = d3
        .select("#recipeParts")
        .insert("div", "#addRecipePartButton")
        .classed("recipePart", true)
        .html(recipePartSource)

    recipePart.select()

    addIngredient(recipePart.select(".ingredientList").node())

    focusFirst(recipePart, "input")
}

const addIngredient = function (parent) {
    let ingredient = d3
        .select(parent)
        .insert("div", ".addIngredientButton")
        .classed("ingredient", true)
        .html(ingredientSource)

    focusFirst(ingredient, "input")
}

const focusFirst = function (selection, selectString) {
    selection
        .selectAll(selectString)
        .filter((_, i) => i == 0)
        .node()
        .focus()
}