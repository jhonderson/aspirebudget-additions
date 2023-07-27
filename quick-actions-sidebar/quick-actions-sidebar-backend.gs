
/* ----------------------------- COMMONS ----------------------------- */

function currentLocalDate() {
  return new Date(new Date().toLocaleString( 'sv', { timeZoneName: 'short' } ).split(' ')[0]);
}

function formatDateToISOString(date) {
  return date.toISOString().split('T')[0];
}

/* ----------------------------- CONFIGURATION ----------------------------- */

const CATEGORY_STARTING_BALANCE = '➡️ Starting Balance';
const CATEGORY_TRANSFER = '↕️ Account Transfer';
const CATEGORY_BALANCE_ADJUSTMENT = '🔢 Balance Adjustment';
const CATEGORY_AVAILABLE_TO_BUDGET = 'Available to budget';

const CATEGORY_TYPE_GROUP = "✦";

const TRANSACTION_CONFIRMED_ICON = '✅';
const TRANSACTION_PENDING_ICON = '🅿️';

const CONFIGURATION_SHEET_NAME = "Configuration";

const CONFIGURATION_CATEGORY_FIRST_ROW = 9;
const CONFIGURATION_CATEGORY_TYPE_COLUMN_INDEX = 0;
const CONFIGURATION_CATEGORY_NAME_COLUMN_INDEX = 1;

const CONFIGURATION_ACCOUNT_FIRST_ROW = 9;
const CONFIGURATION_ACCOUNT_LAST_ROW = 23;
const CONFIGURATION_ACCOUNT_NAME_COLUMN_INDEX = 0;

function getCategories() {
  const configurationSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(CONFIGURATION_SHEET_NAME);
  const rows = configurationSheet.getRange(`B${CONFIGURATION_CATEGORY_FIRST_ROW}:C${configurationSheet.getLastRow()}`).getValues();
  const userCategories = rows
    .filter(row => row[CONFIGURATION_CATEGORY_TYPE_COLUMN_INDEX] != CATEGORY_TYPE_GROUP && row[CONFIGURATION_CATEGORY_NAME_COLUMN_INDEX] != '')
    .map(row => row[CONFIGURATION_CATEGORY_NAME_COLUMN_INDEX]);
  return [CATEGORY_STARTING_BALANCE, CATEGORY_TRANSFER, CATEGORY_BALANCE_ADJUSTMENT, CATEGORY_AVAILABLE_TO_BUDGET, ...userCategories];
}

function getAccounts() {
  const configurationSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(CONFIGURATION_SHEET_NAME);
  const bankAccountRows = configurationSheet.getRange(`H${CONFIGURATION_ACCOUNT_FIRST_ROW}:H${CONFIGURATION_ACCOUNT_LAST_ROW}`).getValues();
  const creditAccountRows = configurationSheet.getRange(`I${CONFIGURATION_ACCOUNT_FIRST_ROW}:I${CONFIGURATION_ACCOUNT_LAST_ROW}`).getValues();
  return [...bankAccountRows, ...creditAccountRows]
    .filter(row => row[CONFIGURATION_ACCOUNT_NAME_COLUMN_INDEX] != '')
    .map(row => row[CONFIGURATION_ACCOUNT_NAME_COLUMN_INDEX]);
}

/* ----------------------------- CATEGORY TRANSFERS ----------------------------- */


const CATEGORY_TRANSFER_SHEET_NAME = "Category Transfers";

function addCategoryTransfers(categoryTransfers) {
  if (categoryTransfers.length == 0) {
    return;
  }
  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  const destinationSheet = spreadsheet.getSheetByName(CATEGORY_TRANSFER_SHEET_NAME);
  const destinationLastRow = destinationSheet.getLastRow();

  destinationSheet.getRange("B" + (destinationLastRow + 1) + ":F" + (destinationLastRow + categoryTransfers.length))
    .setValues(categoryTransfers.map(categoryTransfer => convertCategoryTransferToRow(categoryTransfer)));
}

function convertCategoryTransferToRow(categoryTransfer) {
  return [
    formatDateToISOString(categoryTransfer.date),
    categoryTransfer.amount,
    categoryTransfer.fromCategory,
    categoryTransfer.toCategory,
    categoryTransfer.memo
  ];
}

/* ----------------------------- TRANSACTIONS ----------------------------- */

const TRANSACTIONS_SHEET_NAME = "Transactions";
const TRANSACTIONS_SHEET_FIRST_ROW = 9;

const TRANSACTIONS_DATE_COLUMN_INDEX = 0;
const TRANSACTIONS_OUTFLOW_COLUMN_INDEX = 1;
const TRANSACTIONS_INFLOW_COLUMN_INDEX = 2;
const TRANSACTIONS_CATEGORY_COLUMN_INDEX = 3;
const TRANSACTIONS_ACCOUNT_COLUMN_INDEX = 4;
const TRANSACTIONS_MEMO_COLUMN_INDEX = 5;
const TRANSACTIONS_STATUS_COLUMN_INDEX = 6;

const TRANSACTIONS_STATUS_COLUMN_LETTER = 'H';

function addTransactions(transactions) {
  if (transactions.length == 0) {
    return;
  }
  const transactionsSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(TRANSACTIONS_SHEET_NAME);
  transactionsSheet.getRange("B" + (transactionsSheet.getLastRow() + 1) + ":H" + (transactionsSheet.getLastRow() + transactions.length)).setValues(transactions.map(transaction => convertTransactionToRow(transaction)));
}

function convertTransactionToRow(transaction) {
  return [
    formatDateToISOString(transaction.date),
    transaction.amount > 0 ? `${transaction.amount}`: '',
    transaction.amount < 0 ? `${(-1*transaction.amount)}` : '',
    transaction.category,
    transaction.account,
    transaction.name,
    transaction.pending ? TRANSACTION_PENDING_ICON : TRANSACTION_CONFIRMED_ICON
  ];
}


/* ----------------------------- QUICK ACTIONS SIDEBAR BACKEND ----------------------------- */


function onOpen() {
   const ui = SpreadsheetApp.getUi();
   ui.createAddonMenu()
       .addItem('Open Quick Actions Sidebar', 'onOpenQuickActionsSidebar')
       .addToUi();
}

function onOpenQuickActionsSidebar() {
  const quickActionsSidebarHtml = HtmlService.createTemplateFromFile('quick-actions-sidebar')
    .evaluate()
    .setTitle('Quick Actions Sidebar');
  SpreadsheetApp.getUi().showSidebar(quickActionsSidebarHtml);
}

function getCategoriesForCategoryTransfer() {
  const invalidCategoriesForCategoryTransfer = [CATEGORY_STARTING_BALANCE, CATEGORY_TRANSFER, CATEGORY_BALANCE_ADJUSTMENT];
  return getCategories().filter(category => !invalidCategoriesForCategoryTransfer.includes(category));
}

function getCategoriesForTransaction() {
  return getCategories();
}

function addQuickTransfer(from, to, amount, memo) {
  if (!from || !to || amount == '') {
    throw new Error('Unable to add transfer since mandatory fields are missing');
  }
  const numericAmount = Number(amount);
  if (numericAmount <= 0) {
    throw new Error(`Unable to add transfer since specified amount is invalid: $${numericAmount}`);
  }
  const categoryTransfer = {
    date: currentLocalDate(),
    amount: numericAmount,
    fromCategory: from,
    toCategory: to,
    memo
  };
  addCategoryTransfers([categoryTransfer]);
}

function addQuickTransaction(category, account, amount, memo, status, toAccount) {
  if (!category || !account || amount == '') {
    throw new Error('Unable to add transaction since mandatory fields are missing');
  }
  const numericAmount = Number(amount);
  if (category === CATEGORY_TRANSFER && !toAccount) {
    throw new Error('Unable to add account transfer transaction since the destination account was not specified');
  }
  const transaction = {
    date: currentLocalDate(),
    amount: numericAmount,
    category: category,
    account: account,
    name: memo,
    pending: status === TRANSACTION_PENDING_ICON,
    toAccount
  };
  const transactionsToAdd = [transaction];
  if (transaction.toAccount) {
    transactionsToAdd.push({
      ...transaction,
      account: transaction.toAccount,
      amount: -1 * transaction.amount
    });
  }
  addTransactions(transactionsToAdd);
}

