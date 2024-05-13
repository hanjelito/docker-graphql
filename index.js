const { ApolloServer, gql } = require('apollo-server');
const { Pool } = require('pg');


const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});


const typeDefs = gql`
  type Query {
    hello: String
    testConnection: String
    getAllItems: [Item]
    getItem(id: Int!): Item
  }

  type Mutation {
    createItem(name: String!, description: String): Item
    updateItem(id: Int!, name: String, description: String): Item
    deleteItem(id: Int!): String
  }

  type Item {
    id: Int
    name: String
    description: String
  }
`;

const resolvers = {
  Query: {
    hello: () => 'Hello world!',
    testConnection: async () => {
      try {
        const res = await pool.query('SELECT NOW()');
        return res.rows[0].now;
      } catch (error) {
        console.error(error);
        return 'Failed to connect to the database';
      }
    },
    getAllItems: async () => {
      const res = await pool.query('SELECT * FROM items');
      return res.rows;
    },
    getItem: async (_, { id }) => {
      const res = await pool.query('SELECT * FROM items WHERE id = $1', [id]);
      return res.rows[0];
    }
  },
  Mutation: {
    createItem: async (_, { name, description }) => {
      const res = await pool.query('INSERT INTO items (name, description) VALUES ($1, $2) RETURNING *', [name, description]);
      return res.rows[0];
    },
    updateItem: async (_, { id, name, description }) => {
      const res = await pool.query('UPDATE items SET name = $1, description = $2 WHERE id = $3 RETURNING *', [name, description, id]);
      return res.rows[0];
    },
    deleteItem: async (_, { id }) => {
      await pool.query('DELETE FROM items WHERE id = $1', [id]);
      return `Item with ID ${id} deleted`;
    }
  }
};

const server = new ApolloServer({ typeDefs, resolvers });

server.listen().then(({ url }) => {
  console.log(`🚀 Server ready at ${url}`);
});
