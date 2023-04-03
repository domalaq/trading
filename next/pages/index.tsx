import Container from "@mui/material/Container";
import Box from "@mui/material/Box";
import {
  Alert,
  AlertColor,
  Button,
  Divider,
  Snackbar,
  TextField,
} from "@mui/material";
import { useEffect, useState } from "react";
import CoinsTable from "../src/CoinsTable";
import { Kline, Trade } from "../src/types";
import axios, { AxiosResponse } from "axios";
import BigNumber from "bignumber.js";

export default function Home() {
  const [loading, setLoading] = useState(false);
  const [loadingTrade, setLoadingTrade] = useState(false);
  const [loadingCreate, setLoadingCreate] = useState(false);
  const [loadingStopLoss, setLoadingStopLoss] = useState(false);
  const [loadingTakeProfit, setLoadingTakeProfit] = useState(false);
  const [coins, setCoins] = useState([] as Kline[]);
  const [currencyPair, setCurrencyPair] = useState("?_USDT");
  const [amount, setAmount] = useState("60");
  const [buyPrice, setBuyPrice] = useState(new BigNumber(0));
  const [sellPrice, setSellPrice] = useState(new BigNumber(0));
  const [percent, setPercent] = useState(new BigNumber(0));
  const [precision, setPrecision] = useState(0);
  const [message, setMessage] = useState("");
  const [isMessage, setIsMessage] = useState(false);
  const [severity, setSeverity] = useState("success");

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

  const getBuyPrice = async () => {
    setLoadingTrade(true);

    try {
      const res: AxiosResponse<Trade> = await axios.get("/api/trade", {
        params: {
          currencyPair,
        },
      });

      setBuyPrice(new BigNumber(res.data.price));
      setSellPrice(new BigNumber(res.data.price));
      setPrecision(res.data.precision);
      setPercent(new BigNumber(0));
    } catch (error) {
      console.log(error);
    }

    setLoadingTrade(false);
  };

  const buyOrder = async () => {
    setLoadingCreate(true);

    try {
      const res = await axios.post("/api/deal", {
        currencyPair,
        amount,
      });

      setMessage(JSON.stringify(res.data));
      setSeverity("success");
      setIsMessage(true);
    } catch (error: any) {
      setMessage(JSON.stringify(error.response.data));
      setSeverity("error");
      setIsMessage(true);
    }

    setLoadingCreate(false);
  };

  const setStopLoss = async () => {
    setLoadingStopLoss(true);

    try {
      const res = await axios.post("/api/stop-loss", {
        currencyPair,
        sellPrice,
      });

      setMessage(JSON.stringify(res.data));
      setSeverity("success");
      setIsMessage(true);
    } catch (error: any) {
      setMessage(JSON.stringify(error.response.data));
      setSeverity("error");
      setIsMessage(true);
    }

    setLoadingStopLoss(false);
  };

  const setTakeProfit = async () => {
    setLoadingTakeProfit(true);

    try {
      const res = await axios.post("/api/take-profit", {
        currencyPair,
        sellPrice,
      });

      setMessage(JSON.stringify(res.data));
      setSeverity("success");
      setIsMessage(true);
    } catch (error: any) {
      setMessage(JSON.stringify(error.response.data));
      setSeverity("error");
      setIsMessage(true);
    }

    setLoadingTakeProfit(false);
  };

  useEffect(() => {
    setSellPrice(buyPrice.plus(buyPrice.multipliedBy(percent).div(100)));
  }, [percent]);

  return (
    <Container maxWidth={false}>
      <Snackbar
        open={isMessage}
        autoHideDuration={6000}
        onClose={() => setIsMessage(false)}
      >
        <Alert
          onClose={() => setIsMessage(false)}
          severity={severity as AlertColor}
          sx={{ width: "100%" }}
        >
          {message}
        </Alert>
      </Snackbar>

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
            onClick={buyOrder}
            disabled={loadingCreate}
          >
            {loadingCreate ? "loading" : "buy"}
          </Button>
        </Box>

        <Box
          sx={{
            display: "flex",
            gap: 2,
            alignItems: "center",
            mt: 2,
          }}
        >
          <Button
            variant="contained"
            onClick={() => getBuyPrice()}
            disabled={loadingTrade}
          >
            {loadingTrade ? "loading" : `get buy price`}
          </Button>
          <Button
            variant="contained"
            onClick={() => setPercent(percent.minus(0.5))}
          >
            {`-0.5%`}
          </Button>
          {sellPrice.toFixed(precision)} ({percent.toString()}%)
          <Button
            variant="contained"
            onClick={() => setPercent(percent.plus(0.5))}
          >
            {`+0.5%`}
          </Button>
        </Box>
        <Box
          sx={{
            display: "flex",
            gap: 2,
            alignItems: "center",
            mt: 2,
          }}
        >
          <Button
            variant="contained"
            onClick={() => setStopLoss()}
            disabled={loadingStopLoss}
          >
            {loadingStopLoss ? "loading" : `stop loss`}
          </Button>
          <Button
            variant="contained"
            onClick={() => setTakeProfit()}
            disabled={loadingTakeProfit}
          >
            {loadingTakeProfit ? "loading" : `take profit`}
          </Button>
        </Box>
        <Divider
          sx={{
            width: "100%",
            mt: 4,
          }}
        />

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

        {coins.length > 0 ? <CoinsTable rows={coins} amount={amount} /> : null}
      </Box>
    </Container>
  );
}
