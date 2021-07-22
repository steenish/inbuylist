var recipePartSource = `
<label>Receptdelsnamn:</label>
<input class="recipePartName" name="recipePartName" type="text">
<p>Ingredienser:</p>
<div class="ingredientList">
<button class="addIngredientButton" onclick="addIngredient(this.parentNode)">Lägg till ingrediens</button>
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
    console.log(event.target)
})

const addRecipePart = function () {
    let recipePart = d3
        .select("#recipeParts")
        .insert("div", "#addRecipePartButton")
        .classed("recipePart", true)
        .html(recipePartSource)

    recipePart
        .select(".recipePartName")
        .attr("name", `recipePartName${++recipePartIndex}`)

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