import { GraphQLServer } from 'graphql-yoga'

const typeDefs = `
  type Query {
    add(a: Float!, b: Float!): Float!
    greeting(name: String, position: String): String!
    me: User!
    post: Post!
  }

  type User {
    id: ID!
    name: String!
    email: String!
    age: Int
  }

  type Post {
    id: ID!
    title: String!
    body: String!
    published: Boolean!
  }
`

const resolvers = {
  Query: {
    greeting(parent, args, ctx, info) {
      if (args.name && args.position) {
        return `Hello ${args.name}! You art my favourite ${args.position}`
      } else {
        return 'Hello'
      }
    },

    add(parent, args, ctx, info) {
      if (args.a && args.b) {
        return args.a + args.b
      }
    },

    me() {
      return {
        id: '123asd',
        name: 'Art',
        email: 'art@gmail.com',
        age: 44
      }
    },

    post() {
      return {
        id: '345dfg',
        title: 'Hei You! Dummy commentator.',
        body: ' ',
        published: true
      }
    }
  }
}


const server = new GraphQLServer({
  typeDefs,
  resolvers
})

server.start(() => {
  console.log('The server is up!')
})