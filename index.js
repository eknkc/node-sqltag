export default function SQLTAG(parts, ...values) {
  return SQLTAG.frag(parts, ...values).build();
}

SQLTAG.frag = function(parts, ...values) {
  if (typeof parts === 'string')
    parts = [parts];

  let merged = parts.reduce(function(memo, cur, i) {
    let merged = [...memo, cur];

    if (values.length > i) {
      merged.push(makeNode(values[i]))
    }

    return merged
  }, [])

  return new TreeNode(merged);
}

function makeNode(value) {
  if (value instanceof Node)
    return value;

  return new Value(value);
}

class Node {
  build() {
    return "";
  }
}

class TreeNode extends Node {
  constructor(tree = []) {
    super()
    this.tree = tree;
  }

  build(valoffset = 0, root = true) {
    var ret = { text: "", sql: "", values: [] };

    this.tree.forEach(function(node) {
      if (node instanceof Node) {
        let inner = node.build(valoffset, false);
        ret.text += inner.text;
        ret.sql += inner.sql;
        ret.values.push(...inner.values);
        valoffset += inner.values.length;
      } else {
        ret.text += node;
        ret.sql += node;
      }
    })

    return ret;
  }
}

class Raw extends Node {
  constructor(value) {
    super()
    this.value = value;
  }

  build() {
    return {
      text: this.value,
      sql: this.value,
      values: []
    }
  }
}

class Value extends Node {
  constructor(value) {
    super()
    this.value = value;
  }

  build(valoffset = 0) {
    return {
      text: `$${++valoffset}`,
      sql: '?',
      values: [this.value]
    }
  }
}

class Ident extends Node {
  constructor(name) {
    super()
    this.name = name;
  }

  build() {
    return {
      text: '"' + this.name.replace(/\"/g, '""') + '"',
      sql: '`' + this.name.replace(/`/g, '``').replace(/\./g, '`.`') + '`',
      values: []
    }
  }
}

class Expr extends TreeNode {
  constructor(conditions) {
    let tree = [];
    let keys = Object.keys(conditions);

    if (keys.length) {
      keys.forEach(key => {
        let condition = conditions[key];

        if (condition instanceof Op)
          tree.push(new Ident(key), condition, ' AND ');
        else
          tree.push(new Ident(key), ' = ', makeNode(conditions[key]), ' AND ');
      })

      tree.pop();
    }

    super(tree);
  }
}

class Where extends TreeNode {
  constructor(conditions) {
    super(['WHERE ', new Expr(conditions)])
  }
}

class SetValues extends TreeNode {
  constructor(values) {
    let tree = [];
    let keys = Object.keys(values);

    if (keys.length) {
      tree.push('SET ');

      keys.forEach(key => {
        tree.push(new Ident(key), ' = ', makeNode(values[key]), ', ');
      })

      tree.pop();
    }

    super(tree);
  }
}

class Values extends TreeNode {
  constructor(values) {
    let tree = [];
    let keys = Object.keys(values);

    if (keys.length) {
      tree.push('(')

      keys.forEach(key => {
        tree.push(new Ident(key), ', ');
      })

      tree.pop()

      tree.push(') VALUES (')

      keys.forEach(key => {
        tree.push(makeNode(values[key]), ', ');
      })

      tree.pop()

      tree.push(')')
    }

    super(tree);
  }
}

class Spread extends TreeNode {
  constructor(values) {
    let tree = [];

    if (values.length) {
      values.forEach(value => {
        tree.push(makeNode(value), ', ');
      })

      tree.pop();
    }

    super(tree);
  }
}

class Op extends TreeNode {
  constructor(op = '=', value) {
    super([` ${op} `, makeNode(value)]);
  }
}

const mapping = {
  'raw': Raw,
  'ident': Ident,
  'expr': Expr,
  'where': Where,
  'set': SetValues,
  'values': Values,
  'spread': Spread,
  'op': Op
};

Object.keys(mapping).forEach(function(key) {
  SQLTAG[key] = function(...args) {
    return new mapping[key](...args);
  }
})
