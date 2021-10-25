//THIS FILE IS RESPONSIBLE FOR RUNNING LOGIC EVERY SECOND BASED ON THE PRODUCTION RATES OF EVERY VILLAGE
// test variables - hard-coded temporarily
const rate = 1;
const fruit = {
    amount: 5,
    workers: 3,
    abundance: 1.5
}
const meat = {
    amount: 3,
    workers: 2,
    abundance: 1.0
}
const lumber = {
    amount: 2,
    workers: 1,
    abundance: 1.0
}
const gold = {
    amount: 6,
    workers: 4,
    abundance: 0.8
}

// this function will work together with a mutation to update the stored data
function getResource(resource) {
    const harvest = (rate * resource.workers) * resource.abundance;
    resource.amount = Math.round((resource.amount + harvest) * 10) / 10;
    return resource.amount;
}

// adapt version to use Village model

function getResources(Village) {
    if (Village.unitAllocation.fruit > 0) {
        const harvest = (rate * Village.unitAllocation.fruit) * Village.abundanceOfResources.fruit;
        Village.amountOfResources.fruit = roundNum(Village.amountOfResources.fruit + harvest);
    }
    // mutate the database info with updated data
}


// initial values
console.log('fruit:', fruit.amount);
console.log('meat:', meat.amount);
console.log('lumber:', lumber.amount);
console.log('gold:', gold.amount);
console.log('=============');

const addResources = setInterval(function () {
    console.log('fruit:', getResource(fruit));
    console.log('meat:', getResource(meat));
    console.log('lumber:', getResource(lumber));
    console.log('gold:', getResource(gold));
    console.log('=============');
}, 2000);