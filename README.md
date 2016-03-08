# sqltag

SQL generation using ES6 tagged template strings for [mysql](https://www.npmjs.com/package/mysql) / [mysql2](https://www.npmjs.com/package/mysql2) and [postgres](https://www.npmjs.com/package/pq).

## install

```sh
npm install sqltag
```

## basic usage

You can use `${}` syntax for value interpolation.

```js
import SQL from 'sqltag'

mysql.query(SQL`SELECT * FROM users WHERE id = ${15}`)
mysql.query(SQL`SELECT * FROM users WHERE id = ${15} AND age > ${30}`)

pg.query(SQL`SELECT * FROM users WHERE id = ${15}`)
pg.query(SQL`SELECT * FROM users WHERE id = ${15} AND age > ${30}`)
```

## extensions

### raw

Raw values are inserted into resulting SQL as is.

```js
pg.query(SQL`SELECT * FROM ${SQL.raw('users')} WHERE id = ${15}`)
```

### ident

Identifiers are escaped according to database engine. Use for table / field names.

```js
pg.query(SQL`SELECT * FROM ${SQL.ident('users')} WHERE id = ${15}`)
```

### where

```js
pg.query(SQL`SELECT * FROM users ${SQL.where({ id: 15, name: 'foo' })}`)
pg.query(SQL`SELECT * FROM users ${SQL.where({ id: 15, age: SQL.op('>', 30) })}`)
```

### set

```js
pg.query(SQL`UPDATE users ${SQL.set({ name: 'foo', age: 40 })} WHERE id = ${33}`)
```

### values

```js
pg.query(SQL`INSERT INTO users ${SQL.values({ name: 'foo', age: 40 })}`)
```

### spread

```js
pg.query(SQL`SELECT * FROM users WHERE tags IN (${SQL.spread(['foo', 'bar', 'baz'])})`)
```
