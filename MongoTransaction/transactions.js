import { MongoClient } from "mongodb";
import dotenv from "dotenv";

dotenv.config();

const main = async () => {
  const uri = process.env.MONGODB_URI;
  const client = new MongoClient(uri);
  try {
    await client.connect();
    await createReservation(
      client,
      "yavuz@gmail.com",
      "Infinite Views",
      [(new Date("2021-12-31"), new Date("2022-01-01"))],
      {
        pricePerNight: 100,
        specialRequests: "Late checkout",
        breakfastIncluded: true,
      }
    );
    // console.log(
    //   createReservationDocument(
    //     "Infinite Views",
    //     [new Date("2021-12-31"), new Date("2022-01-01")],
    //     {
    //       pricePerNight: 100,
    //       specialRequests: "Late checkout",
    //       breakfastIncluded: true,
    //     }
    //   )
    // );
  } finally {
    await client.close();
  }
};

main().catch(console.error);

const createReservation = async (
  client,
  userEmail,
  nameOfListing,
  reservationDates,
  reservationDetails
) => {
  const usersCollection = client.db("sample_airbnb").collection("users");
  const listingAndReviewsCollection = client
    .db("sample_airbnb")
    .collection("listingsAndReviews");
  const reservation = createReservationDocument(
    nameOfListing,
    reservationDates,
    reservationDetails
  );

  const session = client.startSession();

  const transactionOptions = {
    readPreference: "primary",
    readConcern: { level: "local" },
    writeConcern: { w: "majority" },
  };
  try {
    const transactionResults = await session.withTransaction(async () => {
      const usersUpdateResults = await usersCollection.updateOne(
        { email: userEmail },
        { $addToSet: { reservations: reservation } },
        { session }
      );
      console.log(
        `${usersUpdateResults.matchedCount} document(s) found in users collection with the email address ${userEmail}`
      );
      console.log(
        `${usersUpdateResults.modifiedCount} document(s) was/were updated to include the reservation`
      );

      const isListingReservedResults =
        await listingAndReviewsCollection.findOne(
          { name: nameOfListing, datesReserved: { $in: reservationDates } },
          { session }
        );
      if (isListingReservedResults) {
        await session.abortTransaction();
        console.error(
          "This listing is already reserved for at least one of given dates. The reservation could not be created"
        );
        console.error(
          "Any operations that already occurred as part of this transaction will be rolled back"
        );
        return;
      }
      const listingAndReviewsUpdatedResults =
        await listingAndReviewsCollection.updateOne(
          { name: nameOfListing },
          { $addToSet: { datesReserved: { $each: reservationDates } } },
          { session }
        );
      console.log(
        `${listingAndReviewsUpdatedResults.matchedCount} document(s) found in the listingsAndReviews collection with the name ${nameOfListing}`
      );
      console.log(
        `${listingAndReviewsUpdatedResults.modifiedCount} document(s) was/were updated to include the reservation dates`
      );
    }, transactionOptions);
    if (transactionResults) {
      console.log("The reservation was successfully created");
    } else {
      console.log("The transaction was intentionally aborted");
    }
  } catch (error) {
    console.log(
      "The transaction was aborted dur to an unexpected error " + error
    );
  } finally {
    await session.endSession();
  }
};

const createReservationDocument = (
  nameOfListing,
  reservationDates,
  reservationDetails
) => {
  let reservation = {
    name: nameOfListing,
    date: reservationDates,
  };
  for (let detail in reservationDetails) {
    reservation[detail] = reservationDetails[detail];
  }
  return reservation;
};
