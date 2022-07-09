import {
  gql,
  ApolloServer
} from "apollo-server-micro";
import {
  PrismaClient
} from '@prisma/client'
import {
  ApolloServerPluginLandingPageGraphQLPlayground
} from "apollo-server-core";
const prisma = new PrismaClient();
const typeDefs = gql `
type blogPost{
    id:String,
    text:String
}

type Query{
blogPosts:[blogPost]
}
type Mutation{
  addBlogPost(text:String):blogPost
  editBlogPost(id:String,text:String):blogPost
  deleteBlogPost(id:String):blogPost
}
`;
const resolvers = {
  Query: {
    blogPosts: (_parent, _args, _context) => {
      return prisma.blog_post.findMany();
    }
  },
  Mutation: {
    addBlogPost: (_parent, {
      text
    }, _context) => {
      return prisma.blog_post.create({
        data: {
          text
        }
      })
    },
    editBlogPost: (_parent, {
      id,
      text
    }, _context) => {
      return prisma.blog_post.update({
        where: {
          id
        },
        data: {
          text
        }
      })
    },
    deleteBlogPost: (_parent, {
      id
    }, _context) => {
      try{
      return prisma.blog_post.delete({
        where: {
          id
        }
      })
    }
    catch(e){
    if(e instanceof Prisma.PrismaClientKnownRequestError){
      if(e.code === 'P2025'){
        console.log("Blog post not found")
      }
    }
    console.log(e);
    throw e
    }
    }
  },
};
const apolloServer = new ApolloServer({
  typeDefs,
  resolvers,
  csrfPrevention: true,  // highly recommended
  cache: 'bounded',
  playground: true,
  plugins: [
    ApolloServerPluginLandingPageGraphQLPlayground(),
  ],
})
export const config = {
  api: {
    bodyParser: false
  }
}
const startServer = apolloServer.start();
export default async function handler(req, res) {
  await startServer;
  await apolloServer.createHandler({
    path: "/api/graphql",
  })(req, res);
}