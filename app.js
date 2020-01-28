//BUDGET CONTROLLER
const budgetController = (function () {

    const Expense = function (id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
        this.percentage = -1;
    }

    Expense.prototype.calculatePercentages = function (totalIncome) {
        if (totalIncome > 0) {
            this.percentage = Math.round((this.value / totalIncome) * 100);

        } else {
            this.percentage = -1;
        }
    };

    Expense.prototype.getPercentage = function () {
        return this.percentage;
    };

    const Income = function (id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
    };

    const calcuateTotal = function (type) {
        let sum = 0;
        data.allItems[type].forEach(function (cur) {
            sum = sum + cur.value;
        });

        data.totals[type] = sum;
    };

    const allExpenses = [];
    const allIncomes = [];
    const totalExpenses = 0;


    const data = {
        allItems: {
            exp: [],
            inc: []
        },
        totals: {
            exp: 0,
            inc: 0
        },
        budget: 0,
        percentage: -1
    };

    return {
        addItem: function (type, des, val) {
            let newItem, ID;

            //create new ID
            if (data.allItems[type].length > 0) {
                ID = data.allItems[type][data.allItems[type].length - 1].id + 1;
            } else {
                ID = 0;
            }


            //create newiutem based on inc or exp
            if (type === "exp") {
                newItem = new Expense(ID, des, val);
            } else if (type === "inc") {
                newItem = new Income(ID, des, val)
            }
            //Push into new data structure
            data.allItems[type].push(newItem);
            //return new element
            return newItem;
        },

        //DELETE ITEM
        deleteItem: function (type, id) {
            let ids, index;

            ids = data.allItems[type].map(function (current) {
                return current.id;
            });

            index = ids.indexOf(id);

            if (index !== -1) {
                data.allItems[type].splice(index, 1)
            }
        },

        calculateBudget: function () {
            //calcuate total income and expenses
            calcuateTotal("exp");
            calcuateTotal("inc");

            //calulate the budget: income - expenses
            data.budget = data.totals.inc - data.totals.exp;

            //calculate the pencentage of income spent
            if (data.totals.inc > 0) {
                data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100);
            } else {
                data.percentage = -1;
            }

        },

        calculatePercentages: function () {
            data.allItems.exp.forEach(function (cur) {
                cur.calculatePercentages(data.totals.inc);
            })
        },

        getPercentage: function () {
            const allPerc = data.allItems.exp.map(function (cur) {
                return cur.getPercentage();
            });
            return allPerc;
        },

        getBudget: function () {
            return {
                budget: data.budget,
                totalInc: data.totals.inc,
                totalExp: data.totals.exp,
                percentage: data.percentage
            };
        },

        testing: function () {
            console.log(data);
        }
    };

})();















//UI CONTROLLER
const UIcontroller = (function () {

    const DOMStrings = {
        inputType: '.add__type',
        inputDescription: '.add__description',
        inputValue: '.add__value',
        inputBtn: '.add__btn',
        incomeContainer: '.income__list',
        expensesContainer: '.expenses__list',
        budgetLabel: '.budget__value',
        incomeLabel: '.budget__income--value',
        expensesLabel: '.budget__expenses--value',
        percentageLabel: '.budget__expenses--percentage',
        container: '.container',
        expensesPercLabel: '.item__percentage',
        dateLabel: ".budget__title--month"
    };

    const formatNumber = function (num, type) {
        var numSplit, int, dec, type;

        num = Math.abs(num);
        num = num.toFixed(2);

        numSplit = num.split('.');

        int = numSplit[0];
        if (int.length > 3) {
            int = int.substr(0, int.length - 3) + ',' + int.substr(int.length - 3, 3);
        }

        dec = numSplit[1];

        return (type === 'exp' ? '-' : '+') + ' ' + int + '.' + dec;

    };

    const NodeListForEach = function (list, callback) {
        for (let i = 0; i < list.length; i++) {
            callback(list[i], i);
        }
    };



    return {
        getinput: function () {
            return {
                type: document.querySelector(DOMStrings.inputType).value, //will be either inc or exp
                description: document.querySelector(DOMStrings.inputDescription).value,
                value: parseFloat(document.querySelector(DOMStrings.inputValue).value) //converts string to number
            }
        },

        addListItem: function (obj, type) {
            let html, newHtml, element;
            // Create HTML string with placeholder text

            if (type === 'inc') {
                element = DOMStrings.incomeContainer;

                html = '<div class="item clearfix" id="inc-%id%"> <div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
            } else if (type === 'exp') {
                element = DOMStrings.expensesContainer;

                html = '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
            }

            // Replace the placeholder text with some actual data
            newHtml = html.replace('%id%', obj.id);
            newHtml = newHtml.replace('%description%', obj.description);
            newHtml = newHtml.replace('%value%', formatNumber(obj.value, type));

            // Insert the HTML into the DOM
            document.querySelector(element).insertAdjacentHTML('beforeend', newHtml);
        },

        //delete item from UI
        deleteListItem: function (selectorID) {
            const el = document.getElementById(selectorID);
            el.parentNode.removeChild(el);
        },


        clearFields: function () {
            let fields, fieldsArr;

            fields = document.querySelectorAll(DOMStrings.inputDescription + ", " + DOMStrings.inputValue);

            fieldsArr = Array.prototype.slice.call(fields);

            fieldsArr.forEach(function (current, index, array) {
                current.value = "";
            });
            //focus back onto description box
            fieldsArr[0].focus();
        },

        displayBudget: function (obj) {
            obj.budget > 0 ? type = "inc" : type = "exp";
            document.querySelector(DOMStrings.budgetLabel).textContent = formatNumber(obj.budget, type);
            document.querySelector(DOMStrings.incomeLabel).textContent = formatNumber(obj.totalInc, "inc");
            document.querySelector(DOMStrings.expensesLabel).textContent = formatNumber(obj.totalExp, "exp");


            if (obj.percentage > 0) {
                document.querySelector(DOMStrings.percentageLabel).textContent = obj.percentage + " %";
            } else {
                document.querySelector(DOMStrings.percentageLabel).textContent = "---";
            }
        },

        displayPercentages: function (percentages) {
            const fields = document.querySelectorAll(DOMStrings.expensesPercLabel);



            NodeListForEach(fields, function (current, index) {
                if (percentages[index] > 0) {
                    current.textContent = percentages[index] + "%";
                } else {
                    current.textContent = "---";
                }
            });
        },

        displayMonth: function () {
            let now, month, months, year;

            now = new Date();
            months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]
            month = now.getMonth();

            year = now.getFullYear();
            document.querySelector(DOMStrings.dateLabel).textContent = months[month] + " " + year;
        },

        changeType: function () {
            const fields = document.querySelectorAll(
                DOMStrings.inputType + ", " +
                DOMStrings.inputDescription + "," +
                DOMStrings.inputValue
            );

            NodeListForEach(fields, function (cur) {
                cur.classList.toggle("red-focus");
            });

            document.querySelector(DOMStrings.inputBtn).classList.toggle("red");
        },

        getDOMstrings: function () {
            return DOMStrings;
        }
    };


})();



//GLOBAL APP CONTROLLER
const controller = (function (budgeCtrl, UICtrl) {

    const setupEventListeners = function () {
        const DOM = UICtrl.getDOMstrings();
        document.querySelector(DOM.inputBtn).addEventListener("click", ctrlAddItem);
        document.addEventListener("keypress", function (event) {
            if (event.keyCode === 13 || event.which === 13) {
                ctrlAddItem();
            }
        });
        //delete on click
        document.querySelector(DOM.container).addEventListener("click", ctrlDeleteItem);

        document.querySelector(DOM.inputType).addEventListener("change", UICtrl.changeType);
    }

    let updateBudget = function () {
        //Calculate the budget
        budgetController.calculateBudget();
        //return the budjet
        let budget = budgetController.getBudget();
        //Display the budject on the UI
        UICtrl.displayBudget(budget);
    };

    const ctrlAddItem = function () {
        let input, newItem;
        //1.Get input field data
        input = UICtrl.getinput();

        //make sure that something has been inputted into box 
        if (input.description !== "" && !isNaN(input.value) && input.value > 0) {

            //2.add item to budget controller
            newItem = budgetController.addItem(input.type, input.description, input.value);

            //3.add the new item to userinterface
            UICtrl.addListItem(newItem, input.type);

            //Clear the fields
            UICtrl.clearFields();

            //calculate and update budget
            updateBudget();

            //calculate Percentages
            updatePercentages();
        }
    };

    const updatePercentages = function () {
        //calculate percentages
        budgeCtrl.calculatePercentages();
        //read percentages from budget controller
        const percentages = budgeCtrl.getPercentage();
        //update UI
        UICtrl.displayPercentages(percentages);
    };


    const ctrlDeleteItem = function (event) {
        let itemID, splitID, type, ID;

        itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;
        if (itemID) {
            splitID = itemID.split("-");
            type = splitID[0];
            ID = parseInt(splitID[1]);

            //DELETE THE ITEM FROM DATA STRUCTURE
            budgeCtrl.deleteItem(type, ID);

            //DELETE FROM UI
            UICtrl.deleteListItem(itemID);

            //UPDATE AND SHOW NEW BUDGET
            updateBudget();

            //calculate Percentages
            updatePercentages();
        }
    };

    return {
        init: function () {
            console.log("application has started");
            UICtrl.displayMonth();
            //RESET TO 0 ON REFRESH
            UICtrl.displayBudget({
                budget: 0,
                totalInc: 0,
                totalExp: 0,
                percentage: -1
            });
            setupEventListeners();
        }

    }

})(budgetController, UIcontroller);


controller.init();