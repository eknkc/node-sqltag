"use strict"

let SQL = require('../build.js').default
let expect = require('chai').expect

describe('sqltag', function() {
  it('should work on basic strings', function() {
    expect(SQL`SELECT 1`).to.deep.equal({
      sql: 'SELECT 1',
      text: "SELECT 1",
      values: []
    })
  })

  it('should interpolate', function() {
    let val = Math.random();

    expect(SQL`SELECT ${val}`).to.deep.equal({
      sql: 'SELECT ?',
      text: "SELECT $1",
      values: [val]
    })
  })

  it('should interpolate multiple values', function() {
    let val1 = Math.random()
      , val2 = Math.random()

    expect(SQL`SELECT * from x where col1 = ${val1} AND col2 = ${val2}`).to.deep.equal({
      sql: 'SELECT * from x where col1 = ? AND col2 = ?',
      text: "SELECT * from x where col1 = $1 AND col2 = $2",
      values: [val1, val2]
    })
  })

  it('should interpolate raw values', function() {
    let val = Math.random()

    expect(SQL`SELECT * from ${SQL.raw('table')} where col = ${val}`).to.deep.equal({
      sql: 'SELECT * from table where col = ?',
      text: "SELECT * from table where col = $1",
      values: [val]
    })
  })

  it('should interpolate multiple wheres', function() {
    expect(SQL`SELECT * from table ${SQL.where({ name: 'foo', city: 'bar' })}`).to.deep.equal({
      sql: 'SELECT * from table WHERE `name` = ? AND `city` = ?',
      text: 'SELECT * from table WHERE "name" = $1 AND "city" = $2',
      values: ['foo', 'bar']
    })
  })

  it('should interpolate single where', function() {
    expect(SQL`SELECT * from table ${SQL.where({ name: 'foo' })}`).to.deep.equal({
      sql: 'SELECT * from table WHERE `name` = ?',
      text: 'SELECT * from table WHERE "name" = $1',
      values: ['foo']
    })
  })

  it('should interpolate multiple sets', function() {
    expect(SQL`UPDATE table ${SQL.set({ name: 'foo', city: 'bar' })}`).to.deep.equal({
      sql: 'UPDATE table SET `name` = ?, `city` = ?',
      text: 'UPDATE table SET "name" = $1, "city" = $2',
      values: ['foo', 'bar']
    })
  })

  it('should interpolate single set', function() {
    expect(SQL`UPDATE table ${SQL.set({ name: 'foo' })}`).to.deep.equal({
      sql: 'UPDATE table SET `name` = ?',
      text: 'UPDATE table SET "name" = $1',
      values: ['foo']
    })
  })

  it('should interpolate insert values (object)', function() {
    expect(SQL`INSERT INTO table ${SQL.values({ name: 'foo', city: 'bar' })}`).to.deep.equal({
      sql: 'INSERT INTO table (`name`, `city`) VALUES (?, ?)',
      text: 'INSERT INTO table ("name", "city") VALUES ($1, $2)',
      values: ['foo', 'bar']
    })
  })

  it('should interpolate insert values (array)', function() {
    expect(SQL`INSERT INTO table ${SQL.values([{ name: 'foo', city: 'bar' }, { name: 'baz', city: 'quux' }])}`).to.deep.equal({
      sql: 'INSERT INTO table (`name`, `city`) VALUES (?, ?), (?, ?)',
      text: 'INSERT INTO table ("name", "city") VALUES ($1, $2), ($3, $4)',
      values: ['foo', 'bar', 'baz', 'quux']
    })
  })

  it('should interpolate spread', function() {
    expect(SQL`SELECT * from table WHERE tags IN (${SQL.spread(['foo', 'bar', 'baz'])})`).to.deep.equal({
      sql: 'SELECT * from table WHERE tags IN (?, ?, ?)',
      text: 'SELECT * from table WHERE tags IN ($1, $2, $3)',
      values: ['foo', 'bar', 'baz']
    })
  })

  it('should interpolate spread (nested)', function() {
    expect(SQL`SELECT * from table WHERE (composite, key) IN (${SQL.spread([['foo', 'bar'], ['baz', 'quux']])})`).to.deep.equal({
      sql: 'SELECT * from table WHERE (composite, key) IN ((?, ?), (?, ?))',
      text: 'SELECT * from table WHERE (composite, key) IN (($1, $2), ($3, $4))',
      values: ['foo', 'bar', 'baz', 'quux']
    })
  })

  it('should interpolate operators', function() {
    expect(SQL`SELECT * from table ${SQL.where({ age: SQL.op('>', 18) })}`).to.deep.equal({
      sql: 'SELECT * from table WHERE `age` > ?',
      text: 'SELECT * from table WHERE "age" > $1',
      values: [18]
    })
  })
})
