const { MongoClient } = require("mongodb");

const main = async () => {
  const uri =
    "mongodb+srv://<username>:<password>@cluster0.t6bfn2p.mongodb.net/?retryWrites=true&w=majority";

  const client = new MongoClient(uri);
  try {
    await client.connect();
    await deleteListingsScrapedBeforeDate(
      client,
      new Date("2019-02-16T05:00:00.000+00:00")
    );
    // await deleteListingByName(client, "Cozy Cottage");

    // await updatedAllListingsToHavePropertyType(client);

    // await upsertListingByName(client, "Cozy Cottage", {
    //   name: "Cozy Cottage",
    //   bedrooms: 12,
    //   bathrooms: 9,
    // });
    // await updateListingByName(client, "Ribeira Charming Duplex", {
    //   bedrooms: 6,
    //   beds: 12,
    // });
    // await findOneListingByName(client, "Ribeira Charming Duplex");
    // await findListingsWithMinBedroomsAndBathroomsAndMostRecentReviews(client, {
    //   minBathrooms: 4,
    //   minBedrooms: 2,
    //   maxNumberResult: 5,
    // });
  } catch (error) {
    console.log(error);
  } finally {
    await client.close();
  }
};

main();

const deleteListingsScrapedBeforeDate = async (client, date) => {
  const result = await client
    .db("sample_airbnb")
    .collection("listingsAndReviews")
    .deleteMany({ last_scraped: { $lt: date } });

  console.log(`${result.deletedCount} documents was/were deleted`);
};

const deleteListingByName = async (client, nameOfListing) => {
  const result = await client
    .db("sample_airbnb")
    .collection("listingsAndReviews")
    .deleteOne({ name: nameOfListing });

  console.log(`${result.deletedCount} documents was/were deleted`);
};

const updatedAllListingsToHavePropertyType = async (client) => {
  const result = await client
    .db("sample_airbnb")
    .collection("listingsAndReviews")
    .updateMany(
      { property_type: { $exists: false } },
      { $set: { property_type: "Unknown" } }
    );

  console.log(`${result.matchedCount} documents matched the query criteria`);
  console.log(`${result.modifiedCount} documents was/were updated`);
};

const upsertListingByName = async (client, nameOfListing, updatedListing) => {
  const result = await client
    .db("sample_airbnb")
    .collection("listingsAndReviews")
    .updateOne(
      { name: nameOfListing },
      { $set: updatedListing },
      { upsert: true }
    );
  console.log(`${result.matchedCount} documents matched the query criteria`);
  if (result.upsertedCount > 0) {
    console.log(`one document was inserted with the id ${result.upsertedId}`);
  } else {
    console.log(`${result.modifiedCount} documents was/were updated`);
  }
};

const updateListingByName = async (client, nameOfListing, updatedListing) => {
  const result = await client
    .db("sample_airbnb")
    .collection("listingsAndReviews")
    .updateOne({ name: nameOfListing }, { $set: updatedListing });
  console.log(`${result.matchedCount} documents matched the query criteria`);
  console.log(`${result.modifiedCount} documents was/were updated`);
};

const findListingsWithMinBedroomsAndBathroomsAndMostRecentReviews = async (
  client,
  {
    minBedrooms = 0,
    minBathrooms = 0,
    maxNumberResult = Number.MAX_SAFE_INTEGER,
  }
) => {
  const cursor = await client
    .db("sample_airbnb")
    .collection("listingsAndReviews")
    .find({
      bedrooms: { $gte: minBedrooms },
      bathrooms: { $gte: minBathrooms },
    })
    .sort({ last_review: -1 })
    .limit(maxNumberResult);

  const result = await cursor.toArray();

  if (result.length > 0) {
    result.forEach((result, i) => {
      date = new Date(result.last_review).toDateString();
      console.log(`${i + 1}, name:${result.name}`);
      console.log(`  _id:${result.id}`);
      console.log(`  bedrooms:${result.bedrooms}`);
      console.log(`  bathrooms:${result.bathrooms}`);
      console.log(
        `  most recent review date: ${new Date(
          result.last_review
        ).toDateString()}`
      );
    });
  } else {
    console.log(`no listing ${minBathrooms} and ${minBathrooms}`);
  }
};

const findOneListingByName = async (client, nameOfListing) => {
  const result = await client
    .db("sample_airbnb")
    .collection("listingsAndReviews")
    .findOne({ name: nameOfListing });
  if (result) {
    console.log(`Found a list name ${nameOfListing}`);
    console.log(result);
  } else {
    console.log(`No listing name ${nameOfListing}`);
  }
};

const createMultipleListing = async (client, newListing) => {
  const result = await client
    .db("sample_airbnb")
    .collection("listingsAndReviews")
    .insertMany(newListing);
  console.log(
    `${result.insertedCount} new listing created with following ids: `
  );
  console.log(result.insertedIds);
};

const createListing = async (client, newListing) => {
  const result = await client
    .db("sample_airbnb")
    .collection("listingsAndReviews")
    .insertOne(newListing);
  console.log(`New listing with id: ${result.insertedId}`);
};

const listDatabases = async (client) => {
  const databasesList = await client.db().admin().listDatabases();
  console.log("databases");
  databasesList.databases.forEach((db) => {
    console.log(`- ${db.name}`);
  });
};
