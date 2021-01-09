const wrapper = document.querySelector('#wrapper')
const budgetWrapper = document.querySelector('#budget-wrapper')
const formWrapper = document.querySelector('#form-wrapper')
const expensesWrapper = document.querySelector('#expenses-wrapper')

const select = document.querySelector('#select')
const description = document.querySelector('#description')
const amount = document.querySelector('#amount')

const btnSubmit = document.querySelector('#submit')

const btnClearAll = document.querySelector('#clear')

const surplus = document.querySelector('#surplus')
const deficit = document.querySelector('#deficit')

const listDef = document.createElement('ul')
deficit.append(listDef)
listDef.className = 'list-def'

const listSur = document.createElement('ul')
surplus.append(listSur)
listSur.className = 'list-sur'

const d = new Date()
let month = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]

const monthYearParagraph = document.createElement('p')
budgetWrapper.append(monthYearParagraph)
monthYearParagraph.setAttribute('id', 'month-year')
monthYearParagraph.textContent = `My wallet for ${month[d.getMonth()]} ${d.getFullYear()}`.toUpperCase()

const budgetDiv = document.createElement('div')
budgetWrapper.append(budgetDiv)
const overall = document.createElement('p')
overall.setAttribute('id', 'overall')
const income = document.createElement('p')
const expenses = document.createElement('p')
budgetDiv.append(overall, income, expenses)


const getFromLS = () => {
    //gets local storage objects and returns an array with individual objects as items
    let allItemsList = []
    let allItems = { ...localStorage }
    let values = Object.values(allItems)
    for (value of values) {
        allItemsList.push(JSON.parse(value))
    }
    return allItemsList
}


let surplusArr = []
let deficitArr = []


const incomeOrExpense = () => {
    //sorsts items from an array with all objects into array with income objects and array with expenses objects
    let itemsList = getFromLS()
    itemsList.forEach(object => {
        if (object.surOrDef == '+') {
            surplusArr.push(object)
        }
        else {
            deficitArr.push(object)
        }
    });
}


incomeOrExpense()
// on load, if local storage has objects, it sorts them to arrays


const totalSum = arr => {
    //returns the sum of all amounts of all objects in an array
    let sum = 0
    arr.forEach(object => {
        sum += object.amount
    });
    return sum
}


const totalBudget = (arr1, arr2) => {
    // returns the difference between two sums
    let incomeVar = totalSum(arr1)
    let expenseVar = totalSum(arr2)
    let budgetVar = incomeVar - expenseVar
    return budgetVar
}


const percentage = (total, expense) => {
    //calculates the percentage
    let percentageVar = Math.round((expense * 100) / total)
    if (percentageVar == Infinity) {
        return ''
    }
    return ' | ' + percentageVar + '%'
}


const updateExpenses = arr => {
    //deletes the HTML for expenses list and adds again list item for every object in the expenses array
    listDef.innerHTML = ''
    arr.forEach(object => {
        expensesAddToDOM(object)
    });
}

const updateIncome = arr => {
    //deletes the HTML for expenses list and adds again list item for every object in the expenses array
    listSur.innerHTML = ''
    arr.forEach(object => {
        incomeAddToDOM(object)
    });
}


const totalAddToDOM = (arr1, arr2) => {
    // adds  total income, total expenses, total budget and total percentage to DOM
    let totalIncome = totalSum(arr1)
    let totalExpense = totalSum(arr2)
    let total = totalBudget(arr1, arr2)
    let totalPerc = percentage(totalIncome, totalExpense)
    if (arr1.length != 0) {
        income.innerHTML = `INCOME <span>+ ${totalIncome.toLocaleString()}</span>`
        income.className = 'overall-income'
    }
    else {
        income.innerHTML = ''
        income.classList.remove('overall-income')
    }

    if (arr2.length != 0) {
        expenses.innerHTML = `EXPENSES <span>- ${totalExpense.toLocaleString()}<span  class="percentage"> ${totalPerc}</span></span>`
        expenses.className = 'overall-expenses'
    }
    else {
        expenses.innerHTML = ''
        expenses.classList.remove('overall-expenses')
    }

    if (total > 0) {
        overall.textContent = `+${total.toLocaleString()}`
        overall.className = 'plus'
    }
    else if (total == 0) {
        overall.textContent = `${total.toLocaleString()}`
        overall.className = 'plus'
    }
    else {
        overall.textContent = `${total.toLocaleString()}`
        overall.className = 'minus'
    }

    if (arr1.length == 0 && arr2.length == 0) {
        overall.textContent = ''
    }
}


const objectInLS = object => {
    //returns the object if the object is in locale storage
    for (i = 0; i < localStorage.length; i++) {
        let key = localStorage.key(i)
        if (localStorage.getItem(key) === JSON.stringify(object)) {
            return localStorage.getItem(key)
        }
    }
}


const removeFromLS = object => {
    //removes an object from local storage
    for (i = 0; i < localStorage.length; i++) {
        let key = localStorage.key(i)
        if (localStorage.getItem(key) === JSON.stringify(object)) {
            localStorage.removeItem(key)
        }
    }
}


const incomeAddToDOM = object => {
    //adds an income object o DOM
    const listItem = document.createElement('li')
    listItem.className = 'income-li'
    listItem.innerHTML = `<p class='list-p'>${object.description}<span>+ ${object.amount.toLocaleString()}</span></p>`
    listSur.append(listItem)

    const hr = document.createElement('hr')
    hr.className = 'income-hr'
    listSur.append(hr)

    const btnDelete = document.createElement('button')
    listItem.insertBefore(btnDelete, listItem.childNodes[0])
    btnDelete.innerHTML = '<i class="far fa-times-circle fa-lg"></i>'

    btnDelete.addEventListener('click', () => {
        // on click removes the object from DOM, income array and locale storage
        listItem.remove()
        hr.remove()
        removeFromLS(object)
        surplusArr.splice(surplusArr.indexOf(object), 1)
        totalAddToDOM(surplusArr, deficitArr)
        updateIncome(surplusArr)
        updateExpenses(deficitArr)
    })
}


const expensesAddToDOM = object => {
    //adds an expense object to DOM
    let totalValue = totalSum(surplusArr)
    let expenseValue = object.amount
    let percentageValue = percentage(totalValue, expenseValue)
    const listItem = document.createElement('li')
    listItem.className = 'expenses-li'
    listItem.innerHTML = `<p class='list-p'>${object.description}<span>- ${object.amount.toLocaleString()}<span class="percentage"> ${percentageValue}</span></span></p>`
    listDef.append(listItem)

    const hr = document.createElement('hr')
    hr.className = 'expenses-hr'
    listDef.append(hr)

    const btnDelete = document.createElement('button')
    listItem.insertBefore(btnDelete, listItem.childNodes[0])
    btnDelete.innerHTML = '<i class="far fa-times-circle fa-lg"></i>'

    btnDelete.addEventListener('click', () => {
        // on click removes the object from DOM, income array and locale storage
        listItem.remove()
        hr.remove()
        removeFromLS(object)
        deficitArr.splice(deficitArr.indexOf(object), 1)
        totalAddToDOM(surplusArr, deficitArr)
        updateIncome(surplusArr)
        updateExpenses(deficitArr)
    })
}


surplusArr.forEach(object => {
    //if income array has items it adds them to DOM
    incomeAddToDOM(object)
    totalAddToDOM(surplusArr, deficitArr)
});

deficitArr.forEach(object => {
    //if expense array has items it adds them to DOM
    expensesAddToDOM(object)
    totalAddToDOM(surplusArr, deficitArr)
});


const addToLS = object => {
    //adds an object to local storage
    key = localStorage.length
    localStorage.setItem(key, JSON.stringify(object))
}




const isValid = object => {
    //checks if input is valid and adds an object to local storage, then pushes the object to income of expenses array and adds the object to DOM
    if ((object.surOrDef == '-' || object.surOrDef == '+') &&
        object.description != '' &&
        !isNaN(object.amount) &&
        object.amount > 0) {
        addToLS(object)
        if (object.surOrDef == '-') {
            if (objectInLS(object) && !deficitArr.includes(object)) {
                deficitArr.push(object)
                expensesAddToDOM(object)
                updateIncome(surplusArr)
                updateExpenses(deficitArr)
            }
        }
        else {
            if (objectInLS(object) && !surplusArr.includes(object)) {
                surplusArr.push(object)
                incomeAddToDOM(object)
                updateIncome(surplusArr)
                updateExpenses(deficitArr)
            }
        }
        totalAddToDOM(surplusArr, deficitArr)
    }
    else {
        const invalidP = document.createElement('p')
        invalidP.innerHTML = 'Invalid input.'
        invalidP.setAttribute('id', 'invalid')
        wrapper.insertBefore(invalidP, expensesWrapper)
        formWrapper.append(invalidP)
        setTimeout(function(){
            invalidP.remove()
        }, 3000)
    }
}


btnSubmit.addEventListener('click', () => {
    // creates an input object on click and validates it, then resets the form
    let obj = {
        surOrDef: select.value,
        description: description.value.trim(),
        amount: Number(amount.value.trim())
    }

    isValid(obj)
    select.value = '+'
    description.value = ''
    amount.value = ''
})

btnClearAll.addEventListener('click', () => {
    //deletes all entries
    localStorage.clear()
    listSur.innerHTML = ''
    listDef.innerHTML = ''
    surplusArr = []
    deficitArr = []
    totalAddToDOM(surplusArr, deficitArr)
})