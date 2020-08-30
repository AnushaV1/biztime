process.env.NODE_ENV = 'test';

const request = require('supertest');
const app = require('../app');
const db = require("../db");

let testCompany;
beforeEach(async()=> {
    const res = await db.query(`INSERT INTO companies (code,name,description) VALUES('Apple','Apple Inc','Manufacturer of iphone, Mac and ipad') RETURNING code,name,description`)
    testCompany = res.rows[0];
})

afterEach(async () => {
    await db.query(`DELETE FROM companies`)
})

afterAll(async() => {
    await db.end()
})

describe("GET /companies", () => {
    test("Get a list with all companies", async() => {
        const res = await request(app).get('/companies')
        expect(res.statusCode).toBe(200);
        expect(res.body).toEqual({companies: [testCompany]})
    })
})

describe("GET /companies/:code", () => {
    test("Get a single company given code", async() => {
        const res = await request(app).get(`/companies/${testCompany.code}`)
        expect(res.statusCode).toBe(200);
        expect(res.body).toEqual({company: testCompany })
    })
    test("Responds with 404 for invalid code", async() => {
        const res = await request(app).get(`/companies/0`)
        expect(res.statusCode).toBe(404);
        
    })
})

describe("POST /companies", () => {
    test("Create a single company in table", async () => {
        const res = await request(app).post('/companies').send({code:'IBM', name:'IBM Company', description:'Manufacturer of computers'})
        expect(res.statusCode).toBe(201);
        expect(res.body).toEqual({
            company: { code:'IBM', name:'IBM Company', description:'Manufacturer of computers'}
        })
    })
})

describe("PUT /companies/:code", () => {
    test("Updates single company", async() => {
        const res = await request(app).put(`/companies/${testCompany.code}`).send({name:'Apple', description:'computer company'})
        expect(res.statusCode).toBe(200);
        expect(res.body).toEqual({
            company: {code:testCompany.code, name:'Apple', description:'computer company'}
            })

    })
})

describe("DELETE /companies/:code", ()=> {
    test("Deletes a single company", async() => {
        const res = await request(app).delete(`/companies/${testCompany.code}`)
        expect(res.statusCode).toBe(200);
        expect(res.body).toEqual({status: "DELETED"})
    })
})