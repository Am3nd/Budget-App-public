
type currentUserType ={
    userID: string, //Customer id
    lastActivity:number, // Timestamp of lastactivity
    name:string,  // Customer name
    email:string // Customer email
    budgetStatus:string,
    setupMode:boolean
    
}

type userDetails = {
    fname?: string,       // Users FName and Lname
    lname?: string,       // Users FName and Lname
    email?: string,      // Users email
    password?: string,    // Users password
    budgetStatus?:string,
    setupMode?:boolean, 
    userID?:string
}

type Categories = {
    categoryID?: string,
    name:string,
    subCategories:string[] | string,
    budget?:string
}

type TransactionType ={
    description:string,
    category:string,
    amount: string,
    date:string,
    txnID:string,
    accountID:string,
    accountName:string,
    userID:string,
    cleared:boolean,
    recurring?:boolean
}

type AccountType ={
    accountID:string,
    account:string,
    name:string,
    type:string,
    last_updated:string,
    balance:string,
    userID:string
}

type SpendingOverviewType = {
    category: string,
    actual: number
}

type BudgetType ={
    userID:string,
    budgetID:string,
    categoryID:string,
    totalBalance:string,
    actualBalance:string,
    remaningBalance:string,
    active:boolean,
    currentMonth:number
}
