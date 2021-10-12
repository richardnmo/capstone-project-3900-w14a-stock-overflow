import { authRegister } from "../auth";
import { createPf } from "../portfolio";
import { checkStock, addStock, modifyStock } from "../stocks";
import { Database } from "../database";
import request from 'supertest';
import { app } from "../index";

describe('Check stock', () => {
	const d = new Database(true);
  beforeAll(async () => {
    await d.connect();
  })

  it('Checking valid stock', async () => {
    const resp = await checkStock('AAP');
    expect(resp).toBe(true);
  })
  it('Checking invalid stock', async () => {
    const resp = await checkStock('Jono');
    expect(resp).toBe(false);
  })

  afterAll(async () => {
    await d.disconnect();
  })
})

describe('Add stock', () => {
	const d = new Database(true);
  beforeAll(async () => {
    await d.connect();
  })

  var token = null;
  var pid = null;

  it('Create new user and portfolio', async () => {
    const rego = await authRegister('Ashley', 'strongpassword', d);
    token = rego.token;
    const getPid = await createPf(token, 'myPf', d);
    pid = getPid.pid;
    expect(pid).not.toBe(null);
  })
  it('Adding valid stock', async () => {
    const resp = await addStock(token, pid, 'IBM', 1.00, 2, d);
    expect(resp).toBe(true);
    const stock = await d.getStock(pid, 'IBM');
    expect(stock).toMatchObject({
      stock: 'IBM',
      avgPrice: 1.00,
      quantity: 2,
    })
  })
  it('Adding invalid stock', async () => {
    const resp = await addStock(token, pid, 'Jono', 1.00 , 5, d);
    expect(resp).toBe(2);
    const stock = await d.getStock(pid, 'Jono');
    expect(stock).toBe(null);
  })
  it('Invalid token', async () => {
    const resp = await addStock('yep', pid, 'IBM', 1.00 , 5, d);
    expect(resp).toBe(1);
  })
  it('Invalid pid', async () => {
    const resp = await addStock(token, 'pid', 'IBM', 1.00 , 5, d);
    expect(resp).toBe(3);
  })

  afterAll(async () => {
    await d.disconnect();
  })
})

describe('Modify stock', () => {
	const d = new Database(true);
  beforeAll(async () => {
    await d.connect();
  })

  var token = null;
  var pid = null;

  it('Create new user and portfolio and adding a stock', async () => {
    const rego = await authRegister('Ashley', 'strongpassword', d);
    token = rego.token;
    const getPid = await createPf(token, 'myPf', d);
    pid = getPid.pid;
    await addStock(token, pid, 'IBM', 1.00, 2, d);
  })
  it('Adding to existing stock', async () => {
    const resp = await modifyStock(token, pid, 'IBM', .5, 2, 1, d);
    expect(resp).toBe(true);
    const stock = await d.getStock(pid, 'IBM');
    expect(stock).toMatchObject({
      stock: 'IBM',
      avgPrice: .75,
      quantity: 4,
    })
  })
  it('Selling part of a stock', async () => {
    const resp = await modifyStock(token, pid, 'IBM', .5, 2, 0, d);
    expect(resp).toBe(true);
    const stock = await d.getStock(pid, 'IBM');
    expect(stock).toMatchObject({
        stock: 'IBM',
        avgPrice: .75,
        quantity: 2,
      })
  })
  it('Selling more stock than owned', async () => {
    const resp = await modifyStock(token, pid, 'IBM', 1, 555, 0, d);
    expect(resp).toBe(4);
    const stock = await d.getStock(pid, 'IBM');
    expect(stock).toMatchObject({
        stock: 'IBM',
        avgPrice: .75,
        quantity: 2,
      })
  })
  it('Invalid stock', async () => {
    const resp = await modifyStock(token, pid, 'Jono', 1, 2, 0, d);
    expect(resp).toBe(2);
  })
  it('Selling whole stock', async () => {
    const resp = await modifyStock(token, pid, 'IBM', 1, 2, 0, d);
    expect(resp).toBe(true);
    const stock = await d.getStock(pid, 'IBM');
    expect(stock).toBe(null);
  })
  it('Stock is valid but not in portfolio', async () => {
    const resp = await modifyStock(token, pid, 'IBM', 1, 2, 0, d);
    expect(resp).toBe(5);
  })
  it('Invalid token', async () => {
    const resp = await modifyStock('token', pid, 'IBM', 1, 2, 0, d);
    expect(resp).toBe(1);
  })
  it('Invalid pid', async () => {
    const resp = await modifyStock(token, 'pid', 'IBM', 1, 2, 0, d);
    expect(resp).toBe(3);
  })

  afterAll(async () => {
    await d.disconnect();
  })
})