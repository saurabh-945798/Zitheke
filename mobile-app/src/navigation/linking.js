const linking = {
  prefixes: ["zitheke://", "https://zitheke.com"],
  config: {
    screens: {
      Main: {
        screens: {
          Home: {
            screens: {
              ProductDetails: "ad/:id",
            },
          },
        },
      },
    },
  },
};

export default linking;
