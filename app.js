const express = require("express");
const ejs = require("ejs");
const paypal = require("paypal-rest-sdk");

paypal.configure({
  mode: "live", //sandbox or live
  client_id:
    "AUO6q0a8b9cLqirtfTTUFI_y71KADlaLzmaHFtYd3g3r4q6ak0iCYecdSJSdAadeMXRryINkyMgisvj0",
  client_secret:
    "ECsgPd-V-8Mklki0eKrPFOBLPZVNrn-u1TtjtjUjNeuyayXvx3Xa1zCuyo7vH--m7ZGDoKiqxn4cldYs",
});

const app = express();

app.set("view engine", "ejs");

app.get("/", (req, res) => res.render("index"));

app.post("/pay", (req, res) => {
  const create_payment_json = {
    intent: "sale",
    payer: {
      payment_method: "paypal",
    },
    redirect_urls: {
      return_url: "http://localhost:3000/success",
      cancel_url: "http://localhost:3000/cancel",
    },
    transactions: [
      {
        item_list: {
          items: [
            {
              name: "iPhone SE",
              sku: "001",
              price: "399.00",
              currency: "USD",
              quantity: 1,
            },
          ],
        },
        amount: {
          currency: "USD",
          total: "399.00",
        },
        description: "New iPhone SE",
      },
    ],
  };

  paypal.payment.create(create_payment_json, function (error, payment) {
    if (error) {
      throw error;
    } else {
      for (let i = 0; i < payment.links.length; i++) {
        if (payment.links[i].rel === "approval_url") {
          res.redirect(payment.links[i].href);
        }
      }
    }
  });
});

app.get("/success", (req, res) => {
  const payerId = req.query.PayerID;
  const paymentId = req.query.paymentId;

  const execute_payment_json = {
    payer_id: payerId,
    transactions: [
      {
        amount: {
          currency: "USD",
          total: "399.00",
        },
      },
    ],
  };

  paypal.payment.execute(paymentId, execute_payment_json, function (
    error,
    payment
  ) {
    if (error) {
      console.log(error.response);
      throw error;
    } else {
      console.log(JSON.stringify(payment));
      res.send("Success");
    }
  });
});
app.use(express.static(__dirname + "/public"));

app.get("/cancel", (req, res) => res.send("Cancelled"));

app.listen(5000, () => console.log("Server Started"));
