

/* ----------------------------- COMMONS ----------------------------- */


function currentLocalDate() {
  return new Date(new Date().toLocaleString( 'sv', { timeZoneName: 'short' } ).split(' ')[0]);
}

function formatDateToISOString(date) {
  return date.toISOString().split('T')[0];
}


/* ----------------------------- CONFIGURATION ----------------------------- */


const TRANSACTION_CONFIRMED_ICON = '✅';
const TRANSACTION_PENDING_ICON = '🅿️';


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


/* ----------------------------- WEB API BACKEND ----------------------------- */


function doGet(e) {
  const action = e.parameter.action;
  const api = Api();
  if (action in api) {
    return api[action](e);
  }
  return {'error': 'Unsupported action'};
}

function jsonResponse_(content) {
  return ContentService.createTextOutput(JSON.stringify(content)).setMimeType(ContentService.MimeType.JSON);
}

function Api() {
  return {
    addTransaction: function(e) {
      const transaction = {
        date: currentLocalDate(),
        amount: Number(e.parameter.amount),
        category: e.parameter.category,
        account: e.parameter.account,
        name: e.parameter.payee,
        pending: e.parameter.pending === 'true',
        toAccount: e.parameter.toAccount || null
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
      return jsonResponse_(transaction);
    },
    addCategoryTransfer: function(e) {
      const categoryTransfer = {
        date: currentLocalDate(),
        amount: Number(e.parameter.amount),
        fromCategory: e.parameter.fromCategory,
        toCategory: e.parameter.toCategory,
        memo: e.parameter.memo || ''
      };
      addCategoryTransfers([categoryTransfer]);
      return jsonResponse_(categoryTransfer);
    }
  };
}

function authorizationTrigger() {
  addTransactions([{
    date: currentLocalDate(),
    amount: Number(12),
    category: 'Dummy Category',
    account: 'Dummy Account',
    name: 'REMOVE ME',
    pending: true,
    toAccount: null
  }]); 
}

