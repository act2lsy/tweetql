import { ApolloServer, gql } from "apollo-server";
// import fetch from "node-fetch";

let tweets = [
  {
    id: "1",
    text: "t1",
    userId: "2",
  },
  {
    id: "2",
    text: "t2",
    userId: "1",
  },
  {
    id: "3",
    text: "t3",
    userId: "2",
  },
];

let users = [
  { id: "1", firstname: "kim", lastname: "d" },
  { id: "2", firstname: "lee", lastname: "k" },
];

const typeDefs = gql`
  type User {
    id: ID!
    firstname: String!
    lastname: String!
    fullname: String!
  }
  """
  doc ex) fake twitter
  """
  type Tweet {
    id: ID!
    text: String!
    author: User!
  }
  type Movie {
    id: Int!
    url: String!
    imdb_code: String!
    title: String!
    title_english: String!
    title_long: String!
    slug: String!
    year: Int!
    rating: Float!
    runtime: Float!
    genres: [String]
    summary: String
    description_full: String
    synopsis: String
    yt_trailer_code: String
    language: String
    background_image: String
    background_image_original: String
    small_cover_image: String
    medium_cover_image: String
    large_cover_image: String
  }
  type Query {
    allMovies: [Movie]
    allUsers: [User!]!
    allTweets: [Tweet!]!
    tweet(id: ID!): Tweet
    movie(id: String): Movie
  }
  type Mutation {
    postTweet(text: String!, userId: ID!): Tweet!
    deleteTweet(id: ID!): Boolean!
  }
`;

const resolvers = {
  Query: {
    async allMovies() {
      //error : "message": "Unexpected token '<', \"<!DOCTYPE \"... is not valid JSON"
      //occured 403
      const response = await fetch(
        "https://yts.torrentbay.st/api/v2/list_movies.json",
        {
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
        }
      );
      console.log(response);
      const json = await response.json();
      return json.data.movies;
    },
    allUsers() {
      console.log("called allUsers!");
      return users;
    },
    allTweets() {
      return tweets;
    },
    tweet(root, { id }) {
      return tweets.find((tweet) => tweet.id === id);
    },
    async movie(__, { id }) {
      return await fetch(
        `https://yts.torrentbay.to/api/v2/movie_detail.json?movie_id=${id}`
      )
        .then((r) => r.json())
        .then((json) => json.data.movie);
    },
  },
  Mutation: {
    postTweet(__, { text, userId }) {
      const newTweet = { id: tweets.length + 1, text, userId };
      tweets.push(newTweet);
      return newTweet;
    },
    deleteTweet(__, { id }) {
      const tweet = tweets.find((tweet) => tweet.id === id);
      if (!tweet) return false;
      tweets = tweets.filter((tweet) => tweet.id !== id);
      return true;
    },
  },
  User: {
    fullname({ firstname, lastname }) {
      console.log("called fullname!");
      return `${firstname} ${lastname}`;
    },
  },
  Tweet: {
    author({ userId }) {
      return users.find((user) => user.id === userId);
    },
  },
};

const server = new ApolloServer({ typeDefs, resolvers });
server.listen().then(({ url }) => {
  console.log(`Running on ${url}`);
});
