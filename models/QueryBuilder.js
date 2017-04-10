'use strict';

/**
 * Example:
   var q = queryBuilder.select()
    .field("name")
    .field("id")
    .field("events")
    .subQuery(
        queryBuilder.select()
        .field("address")
        .from("houses")
    )
    .from("users")
    .where([{"AND": ["id = 2", "name != 'admin'"]}]);

    console.log('query: ', q.toString());

    ===> 'query:  SELECT name, id, events, address, (SELECT name, id, events, address FROM houses) FROM users WHERE (id = 2 AND name != 'admin')'
 */

function QueryBuilder() {
  this.query = {
      action: "",
      table: "",
      fields: [],
      clause: ""
  };

  this.select = function(){
    this.query.action = "SELECT";
    
    return this;
  };

  this.from = function(table){
    this.query.table = table;
    return this;
  };

  this.field = function(field){
    this.query.fields.push(field);
    return this;
  };

  // [{"AND": ["id = 2", "name like '%name%'"]}]}, {"OR": ["start = something", "end = something"]}]
  // ==> WHERE (id = 2 AND name like '%name %') AND (start = something OR end = something)
  this.where = function(clauses){
    if(clauses.constructor.prototype != Array.prototype){
        this.query.clause = clauses;
        return this;
    }
    if(!clauses.length) throw Error("Bad query format!");
    clauses.forEach(function(clause, index){
      for(var key in clause){
        if(clause.hasOwnProperty(key)){
          this.queryBuilder.query.clause += "(";
          clause[key].forEach(function(expr, i){
            this.queryBuilder.query.clause += expr + (i < clause[key].length - 1 ? " " + key + " " : "");
          });
          this.queryBuilder.query.clause += ") ";
        }
      }
      this.queryBuilder.query.clause += (index < clauses.length - 1 ? " AND " : "");
    });

    return this;
  };

  this.subQuery = function(query){
    this.query.fields.push("(" + query.toString() + ")");
    return this;
  };

  this.toString = function(){
      var q = this.query.action + " ";
      this.query.fields.forEach(function(f, i, arr){
          q += f + (i < arr.length - 1 ? ", ": "");
      });
      q += " FROM " + this.query.table;
      if(this.query.clause) q += " WHERE " + this.query.clause;
      return q;
  }
}

module.exports = QueryBuilder;