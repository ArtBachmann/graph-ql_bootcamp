import { GraphQLServer } from 'graphql-yoga'

// Scalar types: String, Boolean, Int, Float, ID

// Demo user data:
const users = [{
  id: '1',
  name: 'Art',
  email: 'art@home.ee',
  age: 47
}, {
  id: '2',
  name: 'Aksel',
  email: 'aksel@home.ee',
  age: 9
}, {
  id: '3',
  name: 'Richard',
  email: 'richard@home.ee',
  age: 19
}]

const posts = [{
  id: '1',
  title: 'Good morning!',
  body: 'Beautiful morning today.',
  published: true,
  author: '1'
}, {
  id: '2',
  title: 'Good afternoon!',
  body: 'Beautiful afternoon today.',
  published: false,
  author: '1'
}, {
  id: '3',
  title: 'Good evening!',
  body: '',
  published: true,
  author: '2'
}]

// Type definitions (schema)
//  *** <users>  has a non scalar type User just like ... little bit //confusing yet.
// *** If one of the fields is a non-scalar type >> posts: [Post],
// then custom resolver function must be set up!!!
const typeDefs = `
  type Query {    
    users(query: String): [User!]!
    posts(query: String): [Post!]!
    me: User!
    post: Post!   
  }

  type User {
    id: ID!
    name: String!
    email: String!
    age: Int
    posts: [Post!]!
  }  

  type Post {
    id: ID!
    title: String!
    body: String!
    published: Boolean!
    author: User!
  }
`

const resolvers = {
  Query: {
    users(parent, args, ctx, info) {
      if (!args.query) {    // if there is no or empty query->>>>
        return users        // returns all users 
      }
      // filters users by their name: argument (user) is searched in 
      // objects <name> property
      // truthy value is added to resulting new array.
      // here filter checkes if user.name includes() argument in the query
      // dont forget return keyword!!!
      return users.filter((user) => {
        return user.name.toLowerCase().includes(args.query.toLowerCase())
      })
    },

    posts(parent, args, ctx, info) {
      if (!args.query) {
        return posts
      }

      // alternative way to complete this task.
      // --------------------------------------
      const isTitleMatch = post.title.toLowerCase().includes(args.query.toLowerCase())
      const isBodyMatch = post.body.toLowerCase().includes(args.query.toLowerCase())
      return isBodyMatch || isTitleMatch

      // return posts.filter((post) => {
      //   return post.title.toLowerCase().includes(args.query.toLowerCase()) || post.body.toLowerCase().includes(args.query.toLowerCase())
      // })
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
  },

  Post: {
    author(parent, args, ctx, info) {
      return user.find((user) => {  // find() searches until first match
        // user.id comes from author(user) object,
        // and author is in every post as property(has an ID)
        return user.id === parent.author
      })
    }
  },
  // User function is called as many times there are users
  // parent is used to pull out data(properties) from users objects
  // parent.id, parent.name, parent.email... anything on user object.
  User: {
    posts(parent, args, ctx, info) {
      // return true if post belongs to specifies author
      return posts.filter((post) => {
        //post is associeated with user >>>
        return post.author === parent.id
      })
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