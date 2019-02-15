import { GraphQLServer } from 'graphql-yoga'
import uuidv4 from 'uuid'

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
  id: '11',
  title: 'Good morning!',
  body: 'Beautiful morning today.',
  published: true,
  author: '1'
}, {
  id: '22',
  title: 'Good afternoon!',
  body: 'Beautiful afternoon today.',
  published: false,
  author: '1'
}, {
  id: '33',
  title: 'Good evening!',
  body: '',
  published: true,
  author: '2'
}]

// comments are associated with posts post:'33' means that 
// this comment comments post with id 33 and in resolver 
// look like >>> parent.post
const comments = [{
  id: '1',
  text: 'Comment number 1',
  author: '1',
  post: '11'
}, {
  id: '2',
  text: 'Comment number 2',
  author: '2',
  post: '22'
}, {
  id: '3',
  text: 'Comment number 3',
  author: '2',
  post: '33'
}, {
  id: '4',
  text: 'Comment number 4',
  author: '3',
  post: '22'
}]

// Type definitions (schema)
//  *** <users>  has a non scalar type User just like ... little bit //confusing yet.
// *** If one of the fields is a non-scalar type >> posts: [Post],
// then custom resolver function must be set up!!!
// -----------------------------------------
// Mutations >> Operation name and a list of arguments.
const typeDefs = `
  type Query {    
    users(query: String): [User!]!
    posts(query: String): [Post!]!
    comments: [Comment!]!
    me: User!
    post: Post!   
  }
 
  type Mutation {
    createUser(name: String!, email: String!, age: Int): User!
    createPost(title: String!, body: String!, published: Boolean, author: ID!): Post!
    createComment(text: String!, author: ID!, post: ID!): Comment!
  }

  type User {
    id: ID!
    name: String!
    email: String!
    age: Int
    posts: [Post!]!
    comments: [Comment!]! 
  }  

  type Post {
    id: ID!
    title: String!
    body: String!
    published: Boolean!
    author: User!
    comments: [Comment!]!
  }

  type Comment {
    id: ID!
    text: String!
    author: User!
    post: Post!
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

    comments(parent, args, ctx, info) {
      return comments
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

  // Two sides of every mutation >>
  // Client operation and the server definition
  Mutation: {
    createUser(parent, args, ctx, info) {
      // some is an array method, retuns true if email is
      // already in use. args.email is what we want to register.
      const emailTaken = users.some((user) => user.email === args.email)

      // throw an error if email true >> (is taken)
      if (emailTaken) {
        throw new Error('Email is taken')
      }
      // if email is not taken >> create new object (user),
      // and generate new random id.
      const user = {
        id: uuidv4(),
        // name: args.name,
        // email: args.email,
        // age: args.age
        ...args
      }
      users.push(user)

      return user
    },

    createPost(parent, args, ctx, info) {
      // does authors id matches with one of the users
      // if returns true means that user really exists
      const userExists = users.some((user) => user.id === args.author)
      // throw an error when user does not exists
      if (!userExists) {
        throw new Error('User not found')
      }
      // if user exists, create new post and save it and return post object.
      // title and body live on args.title...
      const post = {
        id: uuidv4(),
        // title: args.title,
        // body: args.body,
        // published: args.published,
        // author: args.author
        ...args
      }
      // add new post to the existing post array.
      posts.push(post)
      // after addin new post it is returned
      return post
    },

    createComment(parent, args, ctx, info) {
      // check if the user actually exists??
      const userExists = users.some((user) => user.id === args.author)
      const postExists = posts.some((post) =>
        post.id === args.post && post.published) // === true >> same


      if (!userExists || !postExists) {
        throw new Error('Unable to find user and post')
      }

      const comment = {
        id: uuidv4(),
        ...args
      }
      comments.push(comment)

      return comment
    }
  },

  Post: {
    author(parent, args, ctx, info) {
      return users.find((user) => {
        // find() searches until first match
        // user.id comes from author(user) object,
        // and author is in every post as property(has an ID)
        return user.id === parent.author
      })
    },

    comments(parent, args, ctx, info) {
      //find all comments that match up with this post
      return comments.filter((comment) => {
        // comment.post is post's ID,
        // and the parent is the Post (in which type Post we are now
        // and declared as type Post with fields ID, title, body,published and two in this Post resolver>> author and comments.)
        return comment.post === parent.id
        // if match then the comment is associated with particular post
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
    },
    comments(parent, args, ctx, info) {
      return comments.filter((comment) => {
        // return true if comment belongs to certain user.
        // parent.id means user's id and  comment.author looks for
        // id of the field >> author: '3' in the array of comments objects
        return comment.author === parent.id
      })
    }
  },

  Comment: {
    author(parent, args, ctx, info) {
      return users.find((user) => {
        // users ID matches comment's author's ID
        // parent holds the instances from the comments array?
        return user.id === parent.author
      })
    },

    // return the post given the comment
    post(parent, args, ctx, info) {
      //
      return posts.find((post) => {
        //parent.post is a field value set up for each comment
        return post.id === parent.post
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