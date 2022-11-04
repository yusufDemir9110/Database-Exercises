import { MongoClient } from "mongodb";
import dotenv from "dotenv";

dotenv.config();

const main = async () => {
  const uri = process.env.MONGODB_URI;

  const client = new MongoClient(uri);

  try {
    await client.connect();
    await printCheapestSuburbs(client, "Australia", "Sydney", 10);
  } finally {
    await client.close();
  }
};

main().catch(console.error);

const printCheapestSuburbs = async (
  client,
  country,
  market,
  maxNumberToPrint
) => {
  const pipeline = [
    {
      $match: {
        bedrooms: 1,
        "address.country": country,
        "address.market": market,
        "address.suburb": {
          $exists: 1,
          $ne: "",
        },
        room_type: "Entire home/apt",
      },
    },
    {
      $group: {
        _id: "$address.suburb",
        averagePrice: {
          $avg: "$price",
        },
      },
    },
    {
      $sort: {
        averagePrice: 1,
      },
    },
    {
      $limit: maxNumberToPrint,
    },
  ];

  const aggCursor = client
    .db("sample_airbnb")
    .collection("listingsAndReviews")
    .aggregate(pipeline);

  await aggCursor.forEach((airbnbListing) => {
    console.log(`${airbnbListing._id}:${airbnbListing.averagePrice}`);
  });
};
