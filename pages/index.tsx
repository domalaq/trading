import Container from "@mui/material/Container";
import Box from "@mui/material/Box";
import { Button, TextField } from "@mui/material";
import { useState } from "react";
import CoinsTable from "../src/CoinsTable";
import { Kline } from "../src/types";
import axios, { AxiosResponse } from "axios";

export default function Home() {
  const [loading, setLoading] = useState(false);
  const [loadingCreate, setLoadingCreate] = useState(false);
  const [coins, setCoins] = useState([] as Kline[]);
  const [currencyPair, setCurrencyPair] = useState("BTC_USDT");
  const [amount, setAmount] = useState("0");

  const getTrendingCoins = async () => {
    setLoading(true);
    setCoins([]);

    try {
      const res: AxiosResponse<Kline[][]> = await axios.get("/api/trend");

      const flatData: Kline[] = [];

      res.data.forEach((d: Kline[]) => d.forEach((t) => flatData.push(t)));

      setCoins(flatData);
    } catch (error) {
      console.log(error);
    }

    setLoading(false);
  };

  const createOrder = async () => {
    setLoadingCreate(true);
    setCoins([]);

    try {
      const res = await axios.post("/api/deal", {
        currencyPair,
        amount,
      });

      console.log(res);
    } catch (error) {
      console.log(error);
    }

    setLoadingCreate(false);
  };

  return (
    <Container maxWidth="lg">
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
          py: 6,
        }}
      >
        <Box
          sx={{
            display: "flex",
            gap: 2,
            alignItems: "center",
          }}
        >
          <TextField
            label="Currency Pair"
            value={currencyPair}
            onChange={(event) => setCurrencyPair(event.target.value)}
          />
          <TextField
            label="Amount"
            value={amount}
            onChange={(event) => setAmount(event.target.value)}
          />

          <Button
            variant="contained"
            onClick={createOrder}
            disabled={loadingCreate}
          >
            {loadingCreate ? "loading" : "create order"}
          </Button>
        </Box>

        <Button
          variant="contained"
          onClick={getTrendingCoins}
          disabled={loading}
          sx={{
            mt: 4,
          }}
        >
          {loading ? "loading" : "get trending coins"}
        </Button>

        {coins.length > 0 ? <CoinsTable rows={coins} /> : null}
      </Box>
    </Container>
  );
}
