
import ApolloClient, { InMemoryCache } from "apollo-boost";
const client = new ApolloClient({
  uri: "https://us-central1-hospital-search-code-challenge.cloudfunctions.net/graphql",

  cache: new InMemoryCache(),
  onError: ({ graphQLErrors, networkError }) => {
    if (graphQLErrors) {
      graphQLErrors.map(({ message }) => console.log(JSON.stringify(message)));
    }
    if (networkError) {
      console.log(networkError);
    }
  },
  clientState: {
    defaults: {
      isConnected: true,
    },
    resolvers: {
      Mutation: {
        updateNetworkStatus: (_, { isConnected }, { cache }) => {
          cache.writeData({ data: { isConnected } });
          return null;
        },
      },
    },
  },
});

export default client;