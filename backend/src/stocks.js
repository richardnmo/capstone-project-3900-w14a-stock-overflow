/**
  This file manages all stocks specific functions
*/

import { Database } from "./database.js";
import axios from "axios";
import { API } from "./api.js";

export const api = new API();

/**
 * Gets a list of active stocks
 * @returns {Promise <[{symbol: String, name: String}]>}
 * A list of stocks with their symbol and name
 * 
 */
export const getAllStocks = async () => {
  const resp = await api.getAllStocks();
  return resp;
}

/**
 * Adds a stock to a portfolio
 * @param {string} token 
 * @param {string} pid 
 * @param {string} stock 
 * @param {float} price 
 * @param {int} quantity 
 * @param {Database} database
 * @returns {Promise <boolean>}
 */
export const addStock = async (token, pid, stock, price, quantity, database) => {
  // Finding corresponding user for the given token
  const uid = await database.getTokenUid(token);
  if (uid === null) {
    return 1;
  }

  if (!await checkStock(stock)) {
    return 2;
  }

  // Check for watchlist
  const get = await database.openPf(pid);
  if (get == null) return 3;
  const name = get.name;

  if (name !== 'Watchlist') {
    if (!Number.isInteger(quantity) || quantity <= 0) {
      return 4;
    } else if (isNaN(price) || price <= 0) {
      return 5;
    } else {
      return await database.addStocks(pid, stock, price, quantity);
    }
  } else {
    return await database.addStocks(pid, stock, null, null);
  }
}

/**
 * Modifies an existing stock inside the portfolio
 * @param {string} token 
 * @param {string} pid 
 * @param {string} stock 
 * @param {float} price 
 * @param {int} quantity 
 * @param {int} option 0 = sell, anything else = buy
 * @param {Database} database
 * @returns {Promise <boolean>}
 */
export const modifyStock = async (token, pid, stock, price, quantity, option, database) => {
  // Finding corresponding user for the given token
  const uid = await database.getTokenUid(token);
  if (uid === null) {
    return 1;
  }

  if (!await checkStock(stock)) {
    return 2;
  }

  // Check for watchlist
  const get = await database.openPf(pid);
  if (get == null) return 3;
  const name = get.name;

  if (name !== 'Watchlist') {    
    if (!Number.isInteger(quantity) || quantity <= 0) {
      return 6;
    } 
      
    if (isNaN(price) || price <= 0) {
      return 7;
    }
  }
  
  let resp = null;
  if (option) {
    resp = await database.addStocks(pid, stock, price, quantity);
  }
  else {
    resp = await database.sellStocks(pid, stock, price, quantity);
  }
  return resp;
}

/**
 * Function to check if a stock, or series of stocks is valid
 * @param {string} stock 
 * @returns 
 */
export const checkStock = async (stock) => {
  // console.log("checkStock time for " + stock);
  const stocks = await api.getAllStocks();
  // console.log("received all stocks");
  const symbols = stock.split(",");

  for (let i = 0; i < symbols.length; i++) {
    // console.log("symbol is " + symbols[i]);
    const filteredStock = stocks.filter(o => o.symbol === symbols[i])
    if (filteredStock.length === 0) return false;
  }

  return true;
}

/**
 * Function to retrieve stock from api
 * @param {string} stock 
 * @param {int} param
 * @returns {Promise <Object>}
 */
export const getStock = async (type, stocks, interval, start) => {
  const check = await checkStock(stocks);
  if (!check) return -1;

  const typeInt = parseFloat(type);
  if (typeInt < 0 || typeInt > 3 || !Number.isInteger(typeInt)) return -2;

  if (typeInt === 2 && interval) {
    if (interval.match(/^(daily|weekly|monthly)$/) === null) return -3;
  }

  if (typeInt === 3 && interval) {
    if (interval.match(/^(1min|5min|15min)$/) === null) return -3;
  }

  if (start) {
    const startCheck = start.toString();
    if (typeof(startCheck) !== 'string') return -4;

    const today = Date.now();
    const dateCheck = Date.parse(start);
    if (dateCheck > today) return -4;

    if (typeInt === 2 && startCheck.match(/^[0-9]{4}-(0[1-9]|1[0-2])-(0[1-9]|[1-2][0-9]|3[0-1])$/) === null) return -4;
    if (typeInt === 3 && startCheck.match(/^[0-9]{4}-(0[1-9]|1[0-2])-(0[1-9]|[1-2][0-9]|3[0-1]) ([0-1][0-9]|2[0-4]):([0-5][0-9])$/) === null) return -4;

  }

  const resp = await api.getStock(typeInt, stocks, interval, start);
  // console.log(stocks);
  return resp;
}